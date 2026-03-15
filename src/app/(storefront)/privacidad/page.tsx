export const metadata = {
  title: "Política de Privacidad | Kloven",
  description: "Política de privacidad y protección de datos de Kloven.",
};

export default function Privacidad() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-10">
          Política de Privacidad
        </h1>

        <div className="space-y-8 text-sm text-kloven-ash leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Información que recopilamos
            </h2>
            <p>
              Al realizar una compra en Kloven, recopilamos la información
              necesaria para procesar tu pedido: nombre, dirección de email,
              dirección de envío y datos de pago (procesados de forma segura por
              MercadoPago).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Uso de la información
            </h2>
            <p>Utilizamos tu información personal para:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Procesar y enviar tus pedidos.</li>
              <li>
                Enviarte actualizaciones sobre el estado de tu compra por email.
              </li>
              <li>
                Contactarte en caso de ser necesario respecto a tu pedido.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Protección de datos
            </h2>
            <p>
              Tus datos personales se almacenan de forma segura y no se
              comparten con terceros, salvo los servicios necesarios para
              procesar tu compra (MercadoPago para pagos, servicios de
              mensajería para envíos).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Cookies
            </h2>
            <p>
              Nuestro sitio utiliza cookies esenciales para el funcionamiento
              del carrito de compras y la sesión de usuario. No utilizamos
              cookies de seguimiento publicitario.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Tus derechos
            </h2>
            <p>
              Podés solicitar la eliminación o modificación de tus datos
              personales en cualquier momento contactándonos por{" "}
              <a
                href="https://wa.me/5493442319968"
                target="_blank"
                rel="noopener noreferrer"
                className="text-kloven-red hover:underline"
              >
                WhatsApp
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Cambios en esta política
            </h2>
            <p>
              Nos reservamos el derecho de actualizar esta política de
              privacidad. Cualquier cambio será publicado en esta página.
            </p>
            <p className="mt-2 text-xs text-kloven-ash/60">
              Última actualización: marzo 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
