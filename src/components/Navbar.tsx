"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, User, LogOut, Star, Mail, Lock, Loader2, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import KlovenLogo from "@/components/KlovenLogo";
import type { Category } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [navCategories, setNavCategories] = useState<
    { id: string; label: string }[]
  >([{ id: "all", label: "Todo" }]);
  const { totalItems, setIsOpen } = useCart();
  const { user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const loginMenuRef = useRef<HTMLDivElement>(null);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => {
        if (Array.isArray(data)) {
          setNavCategories([
            { id: "all", label: "Todo" },
            ...data.map((c) => ({ id: c.slug, label: c.name })),
          ]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logo appears after hero glitch animation finishes
  useEffect(() => {
    const timer = setTimeout(() => setLogoVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        loginMenuRef.current &&
        !loginMenuRef.current.contains(e.target as Node)
      ) {
        setLoginMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    const result = isSignUp
      ? await signUpWithEmail(loginEmail, loginPassword)
      : await signInWithEmail(loginEmail, loginPassword);

    setLoginLoading(false);

    if (result.error) {
      setLoginError(result.error);
    } else if (isSignUp) {
      setSignUpSuccess(true);
    } else {
      setLoginMenuOpen(false);
      setLoginEmail("");
      setLoginPassword("");
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 bg-kloven-black/85 backdrop-blur-md border-b border-kloven-smoke"
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

        {/* Logo — hidden until hero title animation ends */}
        <a
          href="/"
          className="flex items-center cursor-pointer select-none text-kloven-white"
          data-navbar-logo
          style={{
            opacity: logoVisible ? 1 : 0,
            transition: "opacity 0.3s ease-in",
          }}
        >
          <KlovenLogo height={36} className="sm:hidden" />
          <KlovenLogo height={44} className="hidden sm:block" />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navCategories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id === "all" ? "/tienda" : `/tienda?cat=${cat.id}`}
              className="text-sm font-bold uppercase tracking-widest text-kloven-ash hover:text-kloven-gold"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Mi Pedido */}
          <Link
            href="/mi-pedido"
            className="hidden md:flex text-kloven-ash hover:text-kloven-white transition-colors"
            title="Mi Pedido"
          >
            <Package className="w-5 h-5" />
          </Link>

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
                      <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-kloven-gold">
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
                            <p className="text-xs text-kloven-gold flex items-center gap-1 mt-1">
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
                <div className="relative" ref={loginMenuRef}>
                  <button
                    onClick={() => {
                      setLoginMenuOpen(!loginMenuOpen);
                      setLoginError("");
                      setSignUpSuccess(false);
                      setIsSignUp(false);
                    }}
                    className="flex items-center gap-2 text-kloven-ash hover:text-kloven-white text-sm font-medium"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {loginMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-kloven-dark border border-kloven-smoke shadow-xl overflow-hidden"
                      >
                        <div className="px-5 py-4">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-kloven-white mb-4">
                            {isSignUp ? "Crear cuenta" : "Iniciar sesion"}
                          </h3>

                          {signUpSuccess ? (
                            <div className="text-center py-2">
                              <Mail className="w-8 h-8 text-kloven-red mx-auto mb-2" />
                              <p className="text-sm text-kloven-white font-medium mb-1">
                                Revisa tu correo
                              </p>
                              <p className="text-xs text-kloven-ash">
                                Te enviamos un link de confirmacion a {loginEmail}
                              </p>
                            </div>
                          ) : (
                            <form onSubmit={handleEmailAuth} className="space-y-3">
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kloven-ash" />
                                <input
                                  type="email"
                                  placeholder="Correo electronico"
                                  value={loginEmail}
                                  onChange={(e) => setLoginEmail(e.target.value)}
                                  required
                                  className="w-full bg-kloven-carbon border border-kloven-smoke pl-10 pr-3 py-2.5 text-sm text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-gold transition-colors"
                                />
                              </div>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kloven-ash" />
                                <input
                                  type="password"
                                  placeholder="Contraseña"
                                  value={loginPassword}
                                  onChange={(e) => setLoginPassword(e.target.value)}
                                  required
                                  minLength={6}
                                  className="w-full bg-kloven-carbon border border-kloven-smoke pl-10 pr-3 py-2.5 text-sm text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-gold transition-colors"
                                />
                              </div>

                              {loginError && (
                                <p className="text-red-400 text-xs font-medium">{loginError}</p>
                              )}

                              <button
                                type="submit"
                                disabled={loginLoading}
                                className="w-full bg-kloven-red text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-kloven-red-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {loginLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isSignUp ? (
                                  "Crear cuenta"
                                ) : (
                                  "Ingresar"
                                )}
                              </button>
                            </form>
                          )}

                          {!signUpSuccess && (
                            <>
                              <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-kloven-smoke" />
                                <span className="text-[10px] text-kloven-ash uppercase tracking-widest">o</span>
                                <div className="flex-1 h-px bg-kloven-smoke" />
                              </div>

                              <button
                                onClick={() => {
                                  setLoginMenuOpen(false);
                                  signInWithGoogle();
                                }}
                                className="w-full bg-kloven-carbon border border-kloven-smoke text-kloven-white py-2.5 text-xs font-bold uppercase tracking-widest hover:border-kloven-ash transition-colors flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Ingresar con Google
                              </button>

                              <button
                                onClick={() => {
                                  setIsSignUp(!isSignUp);
                                  setLoginError("");
                                }}
                                className="w-full text-center text-xs text-kloven-ash hover:text-kloven-white mt-3 py-1 transition-colors"
                              >
                                {isSignUp ? "Ya tengo cuenta" : "Crear cuenta nueva"}
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {/* Cart */}
          <button
            className="relative text-kloven-white hover:text-kloven-gold"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingBag className="w-6 h-6" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-kloven-gold text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center"
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
            {navCategories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.id === "all" ? "/tienda" : `/tienda?cat=${cat.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left font-bold uppercase tracking-widest p-3 text-kloven-ash hover:text-kloven-gold hover:bg-kloven-carbon"
              >
                {cat.label}
              </Link>
            ))}
            <Link
              href="/mi-pedido"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-left font-bold uppercase tracking-widest p-3 text-kloven-ash hover:text-kloven-red hover:bg-kloven-carbon flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Mi Pedido
            </Link>
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
                        <span className="text-kloven-gold text-xs flex items-center gap-1 ml-auto">
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
                      setLoginMenuOpen(true);
                      setLoginError("");
                      setSignUpSuccess(false);
                      setIsSignUp(false);
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
