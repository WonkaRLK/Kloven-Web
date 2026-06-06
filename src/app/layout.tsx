import type { Metadata } from "next";
import { Archivo_Black, Familjen_Grotesk, Barlow } from "next/font/google";
import "./globals.css";

const archivo = Archivo_Black({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

const familjen = Familjen_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlow = Barlow({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["800", "900"],
});

export const metadata: Metadata = {
  title: "Kloven | Streetwear Redefined",
  description:
    "Redefiniendo el streetwear en Argentina. Prendas oversize, calidad premium y estilo sin compromisos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${archivo.variable} ${familjen.variable} ${barlow.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
