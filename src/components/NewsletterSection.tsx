"use client";

export default function NewsletterSection() {
  return (
    <section className="bg-kloven-black text-white py-24 px-4 text-center relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10 p-8 border border-white/10 backdrop-blur-sm rounded-sm">
        <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 tracking-tighter">
          Unite al Club
        </h2>
        <p className="text-gray-400 mb-10 text-lg">
          Suscribite para recibir acceso anticipado a nuevos drops y un{" "}
          <span className="text-white font-bold">10% OFF</span> en tu primera
          compra con el codigo{" "}
          <span className="bg-white text-black px-2 py-0.5 font-bold">
            KLOVEN10
          </span>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="TU EMAIL"
            className="flex-1 bg-white/5 border border-white/20 p-5 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-colors"
          />
          <button className="bg-white text-black px-10 py-5 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
            Suscribirse
          </button>
        </div>
      </div>
    </section>
  );
}
