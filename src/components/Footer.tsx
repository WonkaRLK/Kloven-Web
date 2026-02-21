import Link from "next/link";
import { Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-kloven-dark text-kloven-white pt-12 sm:pt-20 pb-10 border-t border-kloven-smoke">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-16 mb-16">
          <div className="col-span-1">
            <div className="mb-6">
              <h3 className="font-heading text-4xl sm:text-5xl tracking-wider">
                KLOVEN<span className="text-kloven-red">.</span>
              </h3>
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
                  className="hover:text-kloven-red inline-block"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda"
                  className="hover:text-kloven-red inline-block"
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
                <span className="hover:text-kloven-red inline-block cursor-pointer">
                  Tabla de Talles
                </span>
              </li>
              <li>
                <span className="hover:text-kloven-red inline-block cursor-pointer">
                  Envios y Devoluciones
                </span>
              </li>
              <li>
                <span className="hover:text-kloven-red inline-block cursor-pointer">
                  Preguntas Frecuentes
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest mb-6 text-xs text-kloven-ash">
              Seguinos
            </h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-12 h-12 border border-kloven-smoke flex items-center justify-center hover:bg-kloven-red hover:border-kloven-red group"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-kloven-smoke pt-10 flex flex-col md:flex-row justify-between items-center text-xs text-kloven-ash font-medium">
          <p>&copy; 2026 Kloven Argentina. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="cursor-pointer hover:text-kloven-red">
              Privacidad
            </span>
            <span className="cursor-pointer hover:text-kloven-red">
              Terminos
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
