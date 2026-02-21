"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, User, LogOut, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import KlovenLogo from "@/components/KlovenLogo";
import { categoryLabels } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "Todo" },
  ...Object.entries(categoryLabels).map(([id, label]) => ({ id, label })),
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 ${
        scrolled
          ? "bg-kloven-black/90 backdrop-blur-md border-b border-kloven-smoke shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-kloven-white"
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
          className="flex items-center cursor-pointer select-none text-kloven-white"
        >
          <KlovenLogo height={36} className="sm:hidden" />
          <KlovenLogo height={44} className="hidden sm:block" />
        </Link>

        {/* Desktop Links — instant color change on hover, no underline animation */}
        <div className="hidden md:flex items-center space-x-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id === "all" ? "/tienda" : `/tienda?cat=${cat.id}`}
              className="text-sm font-bold uppercase tracking-widest text-kloven-ash hover:text-kloven-red"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Auth section */}
          {!loading && (
            <>
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-kloven-ash hover:text-kloven-white"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt="Avatar"
                        width={28}
                        height={28}
                        className="border border-kloven-smoke"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    {profile && profile.points_balance > 0 && (
                      <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-kloven-red">
                        <Star className="w-3 h-3" fill="currentColor" />
                        {profile.points_balance}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-kloven-dark border border-kloven-smoke shadow-xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-kloven-smoke">
                          <p className="text-sm font-bold text-kloven-white truncate">
                            {user.user_metadata?.full_name || user.email}
                          </p>
                          {profile && (
                            <p className="text-xs text-kloven-red flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3" fill="currentColor" />
                              {profile.points_balance} puntos
                            </p>
                          )}
                        </div>
                        <Link
                          href="/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-kloven-ash hover:text-kloven-white hover:bg-kloven-carbon"
                        >
                          <User className="w-4 h-4" />
                          Mi Perfil
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut();
                          }}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-kloven-ash hover:text-kloven-red hover:bg-kloven-carbon w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="hidden sm:flex items-center gap-2 text-kloven-ash hover:text-kloven-white text-sm font-medium"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </>
          )}

          {/* Cart */}
          <button
            className="relative text-kloven-white hover:text-kloven-red"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingBag className="w-6 h-6" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-kloven-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay — square corners, no rounded */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-20 left-0 w-full bg-kloven-dark border-b border-kloven-smoke p-4 flex flex-col space-y-1 shadow-2xl"
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.id === "all" ? "/tienda" : `/tienda?cat=${cat.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left font-bold uppercase tracking-widest p-3 text-kloven-ash hover:text-kloven-red hover:bg-kloven-carbon"
              >
                {cat.label}
              </Link>
            ))}
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/perfil"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-left font-bold uppercase tracking-widest p-3 text-kloven-ash hover:text-kloven-white hover:bg-kloven-carbon flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Mi Perfil
                      {profile && profile.points_balance > 0 && (
                        <span className="text-kloven-red text-xs flex items-center gap-1 ml-auto">
                          <Star className="w-3 h-3" fill="currentColor" />
                          {profile.points_balance}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut();
                      }}
                      className="text-left font-bold uppercase tracking-widest p-3 text-kloven-ash hover:text-kloven-red hover:bg-kloven-carbon flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesion
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signInWithGoogle();
                    }}
                    className="text-left font-bold uppercase tracking-widest p-3 text-kloven-ash hover:text-kloven-white hover:bg-kloven-carbon flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Iniciar sesion
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
