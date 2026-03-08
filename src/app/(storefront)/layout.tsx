import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import SmokeBackground from "@/components/SmokeBackground";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-kloven-black text-kloven-white">
          <SmokeBackground />
          <Navbar />
          <CartDrawer />
          <main className="flex-grow relative z-[1]">{children}</main>
          <Footer />
          {/* WhatsApp floating button */}
          <a
            href="https://wa.me/5491100000000"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all duration-200"
          >
            <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
              <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.741 3.052 9.38L1.055 31.1l5.904-1.952A15.9 15.9 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.31 22.608c-.39 1.1-1.932 2.013-3.18 2.28-.854.18-1.97.324-5.725-1.23-4.806-1.988-7.9-6.87-8.14-7.19-.23-.32-1.93-2.573-1.93-4.906 0-2.334 1.222-3.48 1.656-3.956.39-.432.914-.612 1.22-.612.15 0 .284.008.405.014.433.02.65.044.936.724.358.85 1.23 3.004 1.338 3.224.11.22.22.52.07.82-.14.31-.22.5-.44.77-.22.27-.46.6-.66.81-.22.22-.45.47-.19.91.26.44 1.15 1.9 2.47 3.08 1.7 1.52 3.13 1.99 3.57 2.21.44.22.7.19.95-.11.26-.31 1.1-1.28 1.39-1.72.28-.44.57-.37.95-.22.39.15 2.45 1.16 2.87 1.37.43.21.71.32.82.5.1.17.1 1.01-.29 2.11z" />
            </svg>
          </a>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
