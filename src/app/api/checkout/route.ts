import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { getSupabaseAdmin } from "@/lib/supabase";
import { calculateShipping } from "@/lib/shipping";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

interface CheckoutItem {
  product_id: string;
  variant_id: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items: cartItems,
      email,
      name,
      phone,
      address,
      city,
      zip,
      promo_code,
    } = body as {
      items: CheckoutItem[];
      email: string;
      name: string;
      phone: string;
      address: string;
      city: string;
      zip: string;
      promo_code?: string;
    };

    // Validate required fields
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalido" }, { status: 400 });
    }
    if (!name || !address || !city || !zip) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }
    if (!cartItems?.length) {
      return NextResponse.json({ error: "Carrito vacio" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch real product data from DB
    const productIds = [...new Set(cartItems.map((i) => i.product_id))];
    const variantIds = cartItems.map((i) => i.variant_id);

    const [{ data: products }, { data: variants }] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, price, image_url")
        .in("id", productIds),
      supabase
        .from("product_variants")
        .select("id, product_id, size, color, stock")
        .in("id", variantIds),
    ]);

    if (!products?.length || !variants?.length) {
      return NextResponse.json(
        { error: "Productos no encontrados" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Validate stock for each item
    for (const item of cartItems) {
      const variant = variantMap.get(item.variant_id);
      if (!variant) {
        return NextResponse.json(
          { error: `Variante no encontrada` },
          { status: 400 }
        );
      }
      if (variant.stock < item.quantity) {
        const product = productMap.get(item.product_id);
        return NextResponse.json(
          {
            error: `Sin stock suficiente para ${product?.name || "producto"} (${variant.size}/${variant.color})`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate totals server-side
    const subtotal = cartItems.reduce((sum, item) => {
      const product = productMap.get(item.product_id)!;
      return sum + product.price * item.quantity;
    }, 0);

    // Validate promo code
    let discountPercent = 0;
    let promoCodeUsed: string | null = null;

    if (promo_code) {
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promo_code.toUpperCase())
        .eq("active", true)
        .single();

      if (promo) {
        const notExpired =
          !promo.expires_at || new Date(promo.expires_at) >= new Date();
        const hasUses =
          promo.max_uses === 0 || promo.current_uses < promo.max_uses;

        if (notExpired && hasUses) {
          discountPercent = promo.discount_percent;
          promoCodeUsed = promo.code;
        }
      }
    }

    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const afterDiscount = subtotal - discountAmount;
    const shippingCost = calculateShipping(afterDiscount);
    const total = afterDiscount + shippingCost;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        payer_name: name,
        payer_email: email,
        payer_phone: phone || "",
        shipping_address: address,
        shipping_city: city,
        shipping_zip: zip,
        subtotal,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        promo_code_used: promoCodeUsed,
        total,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "No se pudo crear la orden" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = cartItems.map((item) => {
      const product = productMap.get(item.product_id)!;
      const variant = variantMap.get(item.variant_id)!;
      return {
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: product.name,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        unit_price: product.price,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "No se pudieron crear los items" },
        { status: 500 }
      );
    }

    // Decrement stock for each variant
    for (const item of cartItems) {
      const variant = variantMap.get(item.variant_id)!;
      await supabase
        .from("product_variants")
        .update({ stock: variant.stock - item.quantity })
        .eq("id", item.variant_id);
    }

    // Increment promo code uses
    if (promoCodeUsed) {
      await supabase.rpc("increment_promo_uses", { promo_code: promoCodeUsed });
    }

    // Create MercadoPago preference
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const isHttps = baseUrl.startsWith("https://");

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: cartItems.map((item) => {
          const product = productMap.get(item.product_id)!;
          const variant = variantMap.get(item.variant_id)!;
          return {
            id: item.variant_id,
            title: `${product.name} (${variant.size}/${variant.color})`,
            quantity: item.quantity,
            unit_price: product.price,
            currency_id: "ARS",
          };
        }),
        payer: { email, name },
        external_reference: order.id,
        ...(isHttps && {
          notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        }),
        back_urls: {
          success: `${baseUrl}/compra/exito`,
          failure: `${baseUrl}/compra/error`,
          pending: `${baseUrl}/compra/pendiente`,
        },
        ...(isHttps && { auto_return: "approved" as const }),
      },
    });

    if (result.init_point) {
      return NextResponse.json({ init_point: result.init_point, order_id: order.id });
    }

    return NextResponse.json(
      { error: "No se pudo crear la preferencia de pago" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
