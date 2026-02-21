"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Crown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { categoryLabels, type Category } from "@/lib/types";

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "Todo" },
  ...Object.entries(categoryLabels).map(([id, label]) => ({ id, label })),
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, setIsOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <Crown className="w-8 h-8 text-black" strokeWidth={2.5} />
          <div className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">
            Kloven<span className="text-kloven-red">.</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id === "all" ? "/tienda" : `/tienda?cat=${cat.id}`}
              className="text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 text-gray-500 hover:text-black"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Cart */}
        <div className="flex items-center space-x-6">
          <button
            className="relative text-black hover:scale-105 transition-transform"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-kloven-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-4 flex flex-col space-y-4 shadow-lg animate-fade-in">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id === "all" ? "/tienda" : `/tienda?cat=${cat.id}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-left font-bold uppercase tracking-widest p-2 text-gray-500 hover:text-black hover:bg-gray-50"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
