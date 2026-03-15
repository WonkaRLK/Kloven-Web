import Link from "next/link";
import { Instagram } from "lucide-react";
import KlovenLogo from "@/components/KlovenLogo";

export default function Footer() {
  return (
    <footer className="bg-kloven-dark text-kloven-white pt-12 sm:pt-20 pb-10 border-t border-kloven-gold/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-16 mb-16">
          <div className="col-span-1">
            <div className="mb-6 text-kloven-white">
              <KlovenLogo height={44} />
            </div>
            <p className="text-kloven-ash text-sm leading-relaxed mb-6">
              Redefiniendo el streetwear en Argentina. Prendas oversize, calidad
              premium y estilo sin compromisos.
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest mb-6 text-xs text-kloven-ash">
              Navegacion
            </h4>
            <ul className="space-y-3 text-sm text-kloven-ash font-medium">
              <li>
                <Link
                  href="/"
                  className="hover:text-kloven-gold inline-block"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda"
                  className="hover:text-kloven-gold inline-block"
                >
                  Catalogo
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest mb-6 text-xs text-kloven-ash">
              Ayuda
            </h4>
            <ul className="space-y-3 text-sm text-kloven-ash font-medium">
              <li>
                <Link
                  href="/tabla-de-talles"
                  className="hover:text-kloven-gold inline-block"
                >
                  Tabla de Talles
                </Link>
              </li>
              <li>
                <Link
                  href="/envios-y-devoluciones"
                  className="hover:text-kloven-gold inline-block"
                >
                  Envios y Devoluciones
                </Link>
              </li>
              <li>
                <Link
                  href="/preguntas-frecuentes"
                  className="hover:text-kloven-gold inline-block"
                >
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest mb-6 text-xs text-kloven-ash">
              Seguinos
            </h4>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/kloven.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 border border-kloven-smoke flex items-center justify-center hover:bg-kloven-gold hover:border-kloven-gold group"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-kloven-smoke pt-10 flex flex-col md:flex-row justify-between items-center text-xs text-kloven-ash font-medium">
          <p>&copy; 2026 Kloven Argentina. Todos los derechos reservados.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link href="/privacidad" className="hover:text-kloven-gold">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-kloven-gold">
              Terminos
            </Link>
          </div>
        </div>

        {/* WonkaDev credit */}
        <div className="mt-8 flex justify-center">
          <a
            href="https://wonkadev.online"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-kloven-smoke hover:border-kloven-gold/50 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-kloven-ash group-hover:text-kloven-gold-light transition-colors"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <span className="text-sm text-kloven-ash group-hover:text-kloven-white transition-colors">Desarrollado por</span>
            <span style={{ fontFamily: "WillyWonka, cursive" }} className="text-lg text-kloven-white group-hover:text-kloven-gold-light transition-colors">Wonka</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
