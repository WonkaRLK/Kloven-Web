export const metadata = {
  title: "Preguntas Frecuentes | Kloven",
  description:
    "Respuestas a las preguntas más frecuentes sobre compras, envíos y productos Kloven.",
};

const faqs = [
  {
    pregunta: "¿Cómo compro en la tienda?",
    respuesta:
      "Elegí los productos que te gusten, seleccioná talle y color, agregalos al carrito y completá el checkout. Podés pagar con MercadoPago (tarjeta, transferencia o efectivo).",
  },
  {
    pregunta: "¿Puedo pagar en cuotas?",
    respuesta:
      "Sí, ofrecemos las cuotas que habilita MercadoPago según tu tarjeta y banco.",
  },
  {
    pregunta: "¿Cuánto tarda en llegar mi pedido?",
    respuesta:
      "Los envíos a AMBA tardan de 3 a 5 días hábiles, y al interior de 5 a 10 días hábiles. Una vez despachado, recibís un email con el código de seguimiento.",
  },
  {
    pregunta: "¿Puedo cambiar un producto?",
    respuesta:
      "Sí, tenés 15 días corridos desde que recibís el producto para solicitar un cambio. La prenda debe estar sin uso, sin lavar y con sus etiquetas.",
  },
  {
    pregunta: "¿Qué hago si mi producto llegó con un defecto?",
    respuesta:
      "Contactanos por WhatsApp con tu número de pedido y fotos del defecto. Nos hacemos cargo del envío y te ofrecemos un cambio o reembolso.",
  },
  {
    pregunta: "¿Las prendas son oversize?",
    respuesta:
      "Sí, todas nuestras prendas tienen corte oversize. Si preferís algo menos holgado, te recomendamos bajar un talle.",
  },
  {
    pregunta: "¿Cómo sé qué talle elegir?",
    respuesta:
      "Consultá nuestra tabla de talles con las medidas exactas de cada prenda. Si tenés dudas, escribinos y te asesoramos.",
  },
  {
    pregunta: "¿Hacen envíos a todo el país?",
    respuesta:
      "Sí, enviamos a cualquier punto de Argentina a través de Correo Argentino y servicios de mensajería privada.",
  },
];

export default function PreguntasFrecuentes() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-10">
          Preguntas Frecuentes
        </h1>

        <div className="space-y-0">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border-b border-kloven-smoke py-6 first:pt-0"
            >
              <h3 className="font-bold text-base mb-2">{faq.pregunta}</h3>
              <p className="text-sm text-kloven-ash leading-relaxed">
                {faq.respuesta}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 border border-kloven-smoke bg-kloven-carbon/30">
          <p className="text-sm text-kloven-ash">
            ¿No encontraste lo que buscabas? Escribinos por{" "}
            <a
              href="https://wa.me/5493442319968"
              target="_blank"
              rel="noopener noreferrer"
              className="text-kloven-gold hover:underline"
            >
              WhatsApp
            </a>{" "}
            y te respondemos a la brevedad.
          </p>
        </div>
      </div>
    </section>
  );
}
