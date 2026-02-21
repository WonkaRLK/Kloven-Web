"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Star, Gift, Clock, ArrowRight, LogIn, Loader2 } from "lucide-react";
import type { PointTransaction, Reward } from "@/lib/types";
import Image from "next/image";
import ScrollReveal from "@/components/animations/ScrollReveal";

export default function PerfilPage() {
  const { user, profile, loading, signInWithGoogle, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemResult, setRedeemResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);

    Promise.all([
      fetch("/api/points/history").then((r) => r.json()),
      fetch("/api/rewards").then((r) => r.json()),
    ])
      .then(([txs, rws]) => {
        setTransactions(Array.isArray(txs) ? txs : []);
        setRewards(Array.isArray(rws) ? rws : []);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [user]);

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    setRedeemResult(null);

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reward_id: rewardId }),
      });
      const data = await res.json();

      if (res.ok) {
        setRedeemResult({
          success: true,
          message: data.promo_code
            ? `Codigo de descuento generado: ${data.promo_code}`
            : "Recompensa canjeada exitosamente!",
        });
        await refreshProfile();
        const txRes = await fetch("/api/points/history");
        const txData = await txRes.json();
        setTransactions(Array.isArray(txData) ? txData : []);
      } else {
        setRedeemResult({
          success: false,
          message: data.error || "Error al canjear",
        });
      }
    } catch {
      setRedeemResult({ success: false, message: "Error de conexion" });
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 container mx-auto px-4 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-kloven-ash" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-28 pb-20 container mx-auto px-4 text-center max-w-lg">
        <ScrollReveal>
          <div className="bg-kloven-dark border border-kloven-smoke p-8 sm:p-12">
            <LogIn className="w-12 h-12 text-kloven-red mx-auto mb-6" />
            <h1 className="font-heading text-4xl uppercase tracking-wider mb-4 text-kloven-white">
              Mi Cuenta
            </h1>
            <p className="text-kloven-ash mb-8">
              Inicia sesion con Google para acceder a tu perfil, acumular puntos
              y canjear recompensas.
            </p>
            <button
              onClick={signInWithGoogle}
              className="bg-kloven-red text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-kloven-red-dark transition-colors glow-red inline-flex items-center gap-2"
            >
              Iniciar sesion con Google
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 container mx-auto px-4 max-w-4xl">
      {/* Profile header */}
      <ScrollReveal>
        <div className="bg-kloven-dark border border-kloven-smoke p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 mb-8">
          {user.user_metadata?.avatar_url && (
            <Image
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              width={80}
              height={80}
              className="rounded-full border-2 border-kloven-smoke"
            />
          )}
          <div className="text-center sm:text-left">
            <h1 className="font-heading text-3xl tracking-wider text-kloven-white">
              {user.user_metadata?.full_name || "Mi Cuenta"}
            </h1>
            <p className="text-kloven-ash text-sm">{user.email}</p>
          </div>
          <div className="sm:ml-auto text-center bg-kloven-carbon border border-kloven-smoke p-4 min-w-[120px]">
            <Star className="w-6 h-6 text-kloven-red mx-auto mb-1" fill="currentColor" />
            <p className="font-heading text-3xl text-kloven-red tracking-wider">
              {profile?.points_balance || 0}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-kloven-ash">
              Puntos
            </p>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rewards catalog */}
        <ScrollReveal>
          <div className="bg-kloven-dark border border-kloven-smoke p-6">
            <h2 className="font-heading text-2xl uppercase tracking-wider mb-6 text-kloven-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-kloven-red" />
              Recompensas
            </h2>

            {redeemResult && (
              <div
                className={`mb-4 p-3 text-sm rounded ${
                  redeemResult.success
                    ? "bg-green-900/30 text-green-400 border border-green-500/50"
                    : "bg-red-900/30 text-red-400 border border-red-500/50"
                }`}
              >
                {redeemResult.message}
              </div>
            )}

            {loadingData ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-kloven-ash" />
              </div>
            ) : rewards.length > 0 ? (
              <div className="space-y-4">
                {rewards.map((reward) => {
                  const canAfford =
                    (profile?.points_balance || 0) >= reward.points_cost;
                  const soldOut =
                    reward.max_redemptions > 0 &&
                    reward.current_redemptions >= reward.max_redemptions;

                  return (
                    <div
                      key={reward.id}
                      className="bg-kloven-carbon border border-kloven-smoke p-4 flex items-center gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-kloven-white text-sm">
                          {reward.name}
                        </h3>
                        {reward.description && (
                          <p className="text-kloven-ash text-xs mt-1">
                            {reward.description}
                          </p>
                        )}
                        <p className="text-kloven-red text-xs mt-1 font-bold flex items-center gap-1">
                          <Star className="w-3 h-3" fill="currentColor" />
                          {reward.points_cost} puntos
                        </p>
                      </div>
                      <button
                        onClick={() => handleRedeem(reward.id)}
                        disabled={
                          !canAfford ||
                          soldOut ||
                          redeeming === reward.id
                        }
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                          canAfford && !soldOut
                            ? "bg-kloven-red text-white hover:bg-kloven-red-dark"
                            : "bg-kloven-smoke text-kloven-ash cursor-not-allowed"
                        }`}
                      >
                        {redeeming === reward.id
                          ? "..."
                          : soldOut
                          ? "Agotado"
                          : "Canjear"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-kloven-ash text-sm py-8 text-center">
                No hay recompensas disponibles.
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* Transaction history */}
        <ScrollReveal delay={0.1}>
          <div className="bg-kloven-dark border border-kloven-smoke p-6">
            <h2 className="font-heading text-2xl uppercase tracking-wider mb-6 text-kloven-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-kloven-red" />
              Historial
            </h2>

            {loadingData ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-kloven-ash" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 border-b border-kloven-smoke/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-kloven-white">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-kloven-ash uppercase tracking-wider">
                        {new Date(tx.created_at).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        tx.type === "earn" || tx.type === "admin_adjust"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-kloven-ash text-sm py-8 text-center">
                Aun no tenes movimientos. Compra para ganar puntos!
              </p>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
