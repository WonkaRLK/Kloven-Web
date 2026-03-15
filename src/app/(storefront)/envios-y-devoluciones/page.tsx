export const metadata = {
  title: "Envíos y Devoluciones | Kloven",
  description:
    "Información sobre envíos, tiempos de entrega y política de devoluciones de Kloven.",
};

export default function EnviosYDevoluciones() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-10">
          Envíos y Devoluciones
        </h1>

        {/* Envíos */}
        <div className="mb-12">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-4">
            Envíos
          </h2>
          <div className="space-y-4 text-sm text-kloven-ash leading-relaxed">
            <p>
              Realizamos envíos a todo el país a través de Correo Argentino y
              servicios de mensajería privada.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <strong className="text-kloven-white">AMBA:</strong> 3 a 5 días
                hábiles.
              </li>
              <li>
                <strong className="text-kloven-white">Interior:</strong> 5 a 10
                días hábiles.
              </li>
            </ul>
            <p>
              Una vez despachado tu pedido, recibirás un email con el código de
              seguimiento para que puedas rastrear tu paquete.
            </p>
            <p>
              El costo de envío se calcula al momento del checkout según tu
              ubicación.
            </p>
          </div>
        </div>

        {/* Cambios */}
        <div className="mb-12">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-4">
            Cambios
          </h2>
          <div className="space-y-4 text-sm text-kloven-ash leading-relaxed">
            <p>
              Aceptamos cambios dentro de los{" "}
              <strong className="text-kloven-white">15 días corridos</strong>{" "}
              desde la recepción del producto, siempre que:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>La prenda esté sin uso, sin lavar y con sus etiquetas.</li>
              <li>Se presente el comprobante de compra.</li>
            </ul>
            <p>
              El costo de envío del cambio corre por cuenta del comprador, salvo
              que se trate de un error nuestro.
            </p>
          </div>
        </div>

        {/* Devoluciones */}
        <div className="mb-12">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-4">
            Devoluciones
          </h2>
          <div className="space-y-4 text-sm text-kloven-ash leading-relaxed">
            <p>
              Si el producto llegó con algún defecto de fabricación, podés
              solicitar la devolución dentro de los{" "}
              <strong className="text-kloven-white">15 días corridos</strong>{" "}
              desde la recepción.
            </p>
            <p>
              En estos casos, Kloven se hace cargo del costo de envío y te
              ofrecemos un reembolso completo o un cambio por otro producto.
            </p>
          </div>
        </div>

        {/* Contacto */}
        <div className="p-6 border border-kloven-smoke bg-kloven-carbon/30">
          <p className="text-sm text-kloven-ash">
            Para gestionar un cambio o devolución, escribinos por{" "}
            <a
              href="https://wa.me/5493442319968"
              target="_blank"
              rel="noopener noreferrer"
              className="text-kloven-red hover:underline"
            >
              WhatsApp
            </a>{" "}
            con tu número de pedido y te ayudamos.
          </p>
        </div>
      </div>
    </section>
  );
}
