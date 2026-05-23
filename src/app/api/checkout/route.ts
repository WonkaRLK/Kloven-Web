import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { getSupabaseAdmin } from "@/lib/supabase";
import { calculateShipping } from "@/lib/shipping";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { safeError } from "@/lib/api-utils";

// Use seller token for split payments if configured, otherwise use Kloven's own token
const sellerToken = process.env.MP_SELLER_ACCESS_TOKEN;
const isSplitMode = !!sellerToken;

const client = new MercadoPagoConfig({
  accessToken: isSplitMode ? sellerToken! : (process.env.MP_ACCESS_TOKEN || ""),
});

interface ComboSelection {
  product_id: string;
  variant_id: string;
  quantity: number;
}

interface CheckoutItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  is_combo?: boolean;
  combo_selections?: ComboSelection[];
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    if (!rateLimit(`checkout:${ip}`, { maxTokens: 5, refillRate: 5 / 60 })) {
      return safeError(429, "Demasiados intentos. Intenta de nuevo en un minuto.");
    }

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
      user_id,
      installments,
    } = body as {
      items: CheckoutItem[];
      email: string;
      name: string;
      phone: string;
      address: string;
      city: string;
      zip: string;
      promo_code?: string;
      user_id?: string;
      installments?: number;
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

    // Validate quantities
    for (const item of cartItems) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        return NextResponse.json(
          { error: "Cantidad invalida" },
          { status: 400 }
        );
      }
    }

    // Validate installments: must be one of the offered options
    const ALLOWED_INSTALLMENTS = [1, 3, 6, 9, 12];
    if (installments !== undefined && installments !== null) {
      if (
        !Number.isInteger(installments) ||
        !ALLOWED_INSTALLMENTS.includes(installments)
      ) {
        return NextResponse.json(
          { error: "Cantidad de cuotas invalida" },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseAdmin();

    // Validate user_id against auth session if provided
    let validUserId: string | null = null;
    if (user_id) {
      const { data: { user } } = await supabase.auth.admin.getUserById(user_id);
      if (user) {
        validUserId = user.id;
      }
    }

    // Collect all product_ids and variant_ids across regular and combo items
    const allProductIds = new Set<string>();
    const allVariantIds = new Set<string>();

    for (const item of cartItems) {
      allProductIds.add(item.product_id);
      if (item.is_combo && item.combo_selections) {
        for (const sel of item.combo_selections) {
          allProductIds.add(sel.product_id);
          allVariantIds.add(sel.variant_id);
        }
      } else if (item.variant_id) {
        allVariantIds.add(item.variant_id);
      }
    }

    const [{ data: products }, { data: variants }] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, price, image_url, is_combo, sold_out")
        .in("id", [...allProductIds]),
      allVariantIds.size > 0
        ? supabase
            .from("product_variants")
            .select("id, product_id, size, color, stock")
            .in("id", [...allVariantIds])
        : Promise.resolve({ data: [] as { id: string; product_id: string; size: string; color: string; stock: number }[] }),
    ]);

    if (!products?.length) {
      return NextResponse.json(
        { error: "Productos no encontrados" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map((variants || []).map((v) => [v.id, v]));

    // Validate all cart items and build stock decrement list
    const stockDecrements: { variant_id: string; quantity: number }[] = [];

    for (const item of cartItems) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: "Producto no encontrado" },
          { status: 400 }
        );
      }
      if (product.sold_out) {
        return NextResponse.json(
          { error: `"${product.name}" está agotado` },
          { status: 400 }
        );
      }

      if (item.is_combo && item.combo_selections) {
        // Validate combo
        if (!product.is_combo) {
          return NextResponse.json(
            { error: `${product.name} no es un combo` },
            { status: 400 }
          );
        }

        for (const sel of item.combo_selections) {
          const variant = variantMap.get(sel.variant_id);
          if (!variant) {
            return NextResponse.json(
              { error: "Variante de combo no encontrada" },
              { status: 400 }
            );
          }
          const totalQty = sel.quantity * item.quantity;
          if (variant.stock < totalQty) {
            const subProduct = productMap.get(sel.product_id);
            return NextResponse.json(
              {
                error: `Sin stock suficiente para ${subProduct?.name || "producto"} (${variant.size}/${variant.color})`,
              },
              { status: 400 }
            );
          }
          stockDecrements.push({ variant_id: sel.variant_id, quantity: totalQty });
        }
      } else {
        // Regular item
        const variant = variantMap.get(item.variant_id!);
        if (!variant) {
          return NextResponse.json(
            { error: "Variante no encontrada" },
            { status: 400 }
          );
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json(
            {
              error: `Sin stock suficiente para ${product.name} (${variant.size}/${variant.color})`,
            },
            { status: 400 }
          );
        }
        stockDecrements.push({ variant_id: item.variant_id!, quantity: item.quantity });
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
    const trackingToken = crypto.randomUUID();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        user_id: validUserId,
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
        tracking_token: trackingToken,
      })
      .select("id, tracking_token")
      .single();

    if (orderError || !order) {
      return safeError(500, "No se pudo crear la orden", orderError);
    }

    // Create order items
    const orderItems = cartItems.map((item) => {
      const product = productMap.get(item.product_id)!;

      if (item.is_combo && item.combo_selections) {
        // Combo order item — store selections as JSONB
        const comboVariantSelections = item.combo_selections.map((sel) => {
          const variant = variantMap.get(sel.variant_id)!;
          const subProduct = productMap.get(sel.product_id);
          return {
            product_id: sel.product_id,
            product_name: subProduct?.name || "",
            variant_id: sel.variant_id,
            size: variant.size,
            color: variant.color,
            quantity: sel.quantity,
          };
        });

        return {
          order_id: order.id,
          product_id: item.product_id,
          variant_id: null,
          product_name: product.name,
          size: "",
          color: "",
          quantity: item.quantity,
          unit_price: product.price,
          combo_variant_selections: comboVariantSelections,
        };
      }

      // Regular order item
      const variant = variantMap.get(item.variant_id!)!;
      return {
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: product.name,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        unit_price: product.price,
        combo_variant_selections: null,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return safeError(500, "No se pudieron crear los items", itemsError);
    }

    // Atomic stock decrement via DB function
    const { error: stockError } = await supabase.rpc("decrement_stock_batch", {
      p_items: stockDecrements,
    });

    if (stockError) {
      await supabase.from("order_items").delete().eq("order_id", order.id);
      await supabase.from("orders").delete().eq("id", order.id);
      return safeError(400, "No se pudo reservar el stock", stockError);
    }

    // Increment promo code uses
    if (promoCodeUsed) {
      await supabase.rpc("increment_promo_uses", { promo_code: promoCodeUsed });
    }

    // Create MercadoPago preference
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const isHttps = baseUrl.startsWith("https://");

    const preference = new Preference(client);

    // If promo discount, send consolidated item with net price
    const mpItems = discountPercent > 0
      ? [{
          id: order.id,
          title: `Pedido Kloven (${cartItems.length} producto${cartItems.length > 1 ? "s" : ""})`,
          quantity: 1,
          unit_price: afterDiscount,
          currency_id: "ARS" as const,
        }]
      : cartItems.map((item) => {
          const product = productMap.get(item.product_id)!;
          if (item.is_combo) {
            return {
              id: item.product_id,
              title: `${product.name} (Combo)`,
              quantity: item.quantity,
              unit_price: product.price,
              currency_id: "ARS" as const,
            };
          }
          const variant = variantMap.get(item.variant_id!)!;
          return {
            id: item.variant_id!,
            title: `${product.name} (${variant.size}/${variant.color})`,
            quantity: item.quantity,
            unit_price: product.price,
            currency_id: "ARS" as const,
          };
        });

    // Calculate marketplace fee for split payments (read % from DB, fallback to env)
    let feePercent = 0;
    if (isSplitMode) {
      const { data: feeSetting } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "mp_marketplace_fee_percent")
        .single();
      feePercent = parseFloat(feeSetting?.value || process.env.MP_MARKETPLACE_FEE_PERCENT || "0");
    }
    const marketplaceFee = isSplitMode && feePercent > 0
      ? Math.round(total * feePercent / 100)
      : 0;

    const result = await preference.create({
      body: {
        items: mpItems,
        ...(shippingCost > 0 && {
          shipments: { cost: shippingCost, mode: "not_specified" },
        }),
        payer: { email, name },
        external_reference: order.id,
        payment_methods: {
          installments: 12,
          ...(installments && installments > 1 && { default_installments: installments }),
          // Exclude cash-at-physical-store methods — we only accept online payments
          excluded_payment_types: [
            { id: "ticket" }, // Pagofácil, Rapipago, etc.
            { id: "atm" },    // Cajeros automáticos
          ],
        },
        ...(isHttps && {
          notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        }),
        back_urls: {
          success: `${baseUrl}/compra/exito`,
          failure: `${baseUrl}/compra/error`,
          pending: `${baseUrl}/compra/pendiente`,
        },
        ...(isHttps && { auto_return: "approved" as const }),
        ...(isSplitMode && marketplaceFee > 0 && {
          marketplace_fee: marketplaceFee,
        }),
      },
    });

    if (result.init_point) {
      return NextResponse.json({ init_point: result.init_point, order_id: order.id, tracking_token: order.tracking_token });
    }

    return safeError(500, "No se pudo crear la preferencia de pago");
  } catch (error) {
    return safeError(500, "Error interno del servidor", error);
  }
}
