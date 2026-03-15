"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, Check } from "lucide-react";

export default function MiPedidoPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/orders/resend-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.status === 429) {
        setError("Demasiados intentos. Intenta de nuevo en unos minutos.");
        setSending(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-28 pb-20 container mx-auto px-4 max-w-md">
      <Link
        href="/tienda"
        className="inline-flex items-center gap-2 text-sm text-kloven-ash hover:text-kloven-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la tienda
      </Link>

      <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-wider text-kloven-white mb-2">
        Mi Pedido
      </h1>
      <p className="text-kloven-ash text-sm mb-8">
        Ingresa tu email para recibir los links de seguimiento de tus pedidos.
      </p>

      {sent ? (
        <div className="bg-kloven-dark border border-kloven-smoke p-6 text-center">
          <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-kloven-white font-bold mb-2">Listo!</p>
          <p className="text-kloven-ash text-sm">
            Si hay pedidos asociados a ese email, te enviamos los links de seguimiento. Revisa tu bandeja de entrada.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest text-kloven-ash">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kloven-ash" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-kloven-carbon border border-kloven-smoke pl-10 pr-3 py-3 text-sm text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-gold transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-kloven-gold text-white py-3 font-bold uppercase tracking-widest hover:bg-kloven-gold/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar link"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
