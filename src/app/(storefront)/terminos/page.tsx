export const metadata = {
  title: "Términos y Condiciones | Kloven",
  description: "Términos y condiciones de uso de la tienda Kloven.",
};

export default function Terminos() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-10">
          Términos y Condiciones
        </h1>

        <div className="space-y-8 text-sm text-kloven-ash leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Generalidades
            </h2>
            <p>
              Al realizar una compra en kloven.ar, aceptás los presentes
              términos y condiciones. Kloven se reserva el derecho de modificar
              estos términos en cualquier momento, siendo efectivos a partir de
              su publicación en el sitio.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Productos
            </h2>
            <p>
              Las imágenes de los productos son a modo ilustrativo. Los colores
              pueden variar levemente según la configuración de tu pantalla.
              Hacemos nuestro mejor esfuerzo para que las fotos representen
              fielmente el producto.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Precios y pagos
            </h2>
            <p>
              Los precios publicados están expresados en pesos argentinos (ARS)
              e incluyen IVA. Los pagos se procesan de forma segura a través de
              MercadoPago. Kloven no almacena datos de tarjetas de crédito ni
              débito.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Stock
            </h2>
            <p>
              Todos los productos están sujetos a disponibilidad de stock. En
              caso de que un producto se agote después de realizada la compra,
              nos comunicaremos con vos para ofrecerte una alternativa o el
              reembolso completo.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Envíos
            </h2>
            <p>
              Los plazos de entrega son estimativos y pueden variar según la
              localidad de destino y factores externos al servicio de
              mensajería. Kloven no se responsabiliza por demoras ocasionadas
              por el correo o servicios de transporte.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Cambios y devoluciones
            </h2>
            <p>
              Aceptamos cambios dentro de los 15 días corridos desde la
              recepción. La prenda debe estar sin uso, sin lavar y con sus
              etiquetas originales. Para más información, consultá nuestra
              sección de{" "}
              <a
                href="/envios-y-devoluciones"
                className="text-kloven-red hover:underline"
              >
                Envíos y Devoluciones
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Propiedad intelectual
            </h2>
            <p>
              Todos los diseños, logos, textos e imágenes del sitio son
              propiedad de Kloven. Queda prohibida su reproducción total o
              parcial sin autorización previa.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-kloven-white uppercase tracking-wider mb-3">
              Contacto
            </h2>
            <p>
              Para cualquier consulta sobre estos términos, podés contactarnos
              por{" "}
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
            <p className="mt-2 text-xs text-kloven-ash/60">
              Última actualización: marzo 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
