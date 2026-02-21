import Link from "next/link";
import { Crown, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-12 sm:pt-20 pb-10 border-t border-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-16 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Crown className="w-8 h-8 text-white" />
              <h3 className="text-2xl sm:text-3xl font-black tracking-tighter">
                KLOVEN<span className="text-kloven-red">.</span>
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Redefiniendo el streetwear en Argentina. Prendas oversize, calidad
              premium y estilo sin compromisos.
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest mb-6 text-xs text-gray-500">
              Navegacion
            </h4>
            <ul className="space-y-3 text-sm text-gray-300 font-medium">
              <li>
                <Link
                  href="/"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all"
                >
                  Catalogo
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest mb-6 text-xs text-gray-500">
              Ayuda
            </h4>
            <ul className="space-y-3 text-sm text-gray-300 font-medium">
              <li>
                <span className="hover:text-white hover:translate-x-1 inline-block transition-all cursor-pointer">
                  Tabla de Talles
                </span>
              </li>
              <li>
                <span className="hover:text-white hover:translate-x-1 inline-block transition-all cursor-pointer">
                  Envios y Devoluciones
                </span>
              </li>
              <li>
                <span className="hover:text-white hover:translate-x-1 inline-block transition-all cursor-pointer">
                  Preguntas Frecuentes
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest mb-6 text-xs text-gray-500">
              Seguinos
            </h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-12 h-12 border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black transition-all rounded-full group"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-900 pt-10 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-medium">
          <p>&copy; 2026 Kloven Argentina. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="cursor-pointer hover:text-white transition-colors">
              Privacidad
            </span>
            <span className="cursor-pointer hover:text-white transition-colors">
              Terminos
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
