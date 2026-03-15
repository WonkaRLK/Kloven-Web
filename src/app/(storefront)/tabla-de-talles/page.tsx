export const metadata = {
  title: "Tabla de Talles | Kloven",
  description: "Guía de talles para prendas Kloven. Encontrá tu talle ideal.",
};

const talles = [
  { talle: "S", pecho: "96-100", largo: "70", hombro: "50" },
  { talle: "M", pecho: "100-104", largo: "72", hombro: "52" },
  { talle: "L", pecho: "106-110", largo: "74", hombro: "54" },
  { talle: "XL", pecho: "112-116", largo: "76", hombro: "56" },
  { talle: "XXL", pecho: "118-122", largo: "78", hombro: "58" },
];

export default function TablaDeTalles() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-4">
          Tabla de Talles
        </h1>
        <p className="text-kloven-ash mb-10">
          Todas nuestras prendas tienen corte oversize. Te recomendamos elegir
          tu talle habitual para un fit holgado, o bajar un talle si preferís
          algo más ajustado.
        </p>

        {/* Remeras / Buzos */}
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4">
          Remeras y Buzos
        </h2>
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-sm border border-kloven-smoke">
            <thead>
              <tr className="bg-kloven-carbon text-kloven-ash uppercase tracking-widest text-xs">
                <th className="px-4 py-3 text-left border-b border-kloven-smoke">
                  Talle
                </th>
                <th className="px-4 py-3 text-left border-b border-kloven-smoke">
                  Pecho (cm)
                </th>
                <th className="px-4 py-3 text-left border-b border-kloven-smoke">
                  Largo (cm)
                </th>
                <th className="px-4 py-3 text-left border-b border-kloven-smoke">
                  Hombro (cm)
                </th>
              </tr>
            </thead>
            <tbody>
              {talles.map((row) => (
                <tr
                  key={row.talle}
                  className="border-b border-kloven-smoke hover:bg-kloven-carbon/50 transition-colors"
                >
                  <td className="px-4 py-3 font-bold">{row.talle}</td>
                  <td className="px-4 py-3 text-kloven-ash">{row.pecho}</td>
                  <td className="px-4 py-3 text-kloven-ash">{row.largo}</td>
                  <td className="px-4 py-3 text-kloven-ash">{row.hombro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cómo medirte */}
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4">
          ¿Cómo medirte?
        </h2>
        <ul className="space-y-3 text-kloven-ash text-sm leading-relaxed">
          <li>
            <strong className="text-kloven-white">Pecho:</strong> Medí la
            circunferencia de tu pecho pasando la cinta por debajo de las
            axilas.
          </li>
          <li>
            <strong className="text-kloven-white">Largo:</strong> Desde el
            hombro hasta el borde inferior de la prenda.
          </li>
          <li>
            <strong className="text-kloven-white">Hombro:</strong> De costura a
            costura a lo largo de la parte superior de la espalda.
          </li>
        </ul>

        <div className="mt-10 p-6 border border-kloven-smoke bg-kloven-carbon/30">
          <p className="text-sm text-kloven-ash">
            ¿Tenés dudas con tu talle? Escribinos por{" "}
            <a
              href="https://wa.me/5493442319968"
              target="_blank"
              rel="noopener noreferrer"
              className="text-kloven-red hover:underline"
            >
              WhatsApp
            </a>{" "}
            y te ayudamos.
          </p>
        </div>
      </div>
    </section>
  );
}
