import { createClient } from "@supabase/supabase-js";
import DropCountdown from "@/components/DropCountdown";

export const dynamic = "force-dynamic";

interface StoreConfig {
  drop_mode_active: boolean;
  drop_opens_at: string | null;
  drop_title: string;
  drop_message: string;
}

async function getConfig(): Promise<StoreConfig | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("store_config")
    .select("*")
    .eq("id", 1)
    .single();
  return data ?? null;
}

export default async function DropPage() {
  const config = await getConfig();

  const title = config?.drop_title ?? "Nuevo drop en camino";
  const message = config?.drop_message ?? "Estamos preparando algo especial. Volvé pronto.";
  const opensAt = config?.drop_opens_at ?? null;

  // If drop mode is off, show a neutral message (user came here directly)
  const isActive = config?.drop_mode_active ?? false;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "var(--kloven-black)", color: "var(--kloven-white)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(217,4,41,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full gap-8">
        {/* Logo */}
        <span
          className="font-heading text-2xl tracking-tighter uppercase select-none"
          style={{ color: "var(--kloven-white)" }}
        >
          Kloven<span style={{ color: "var(--kloven-red)" }}>.</span>
        </span>

        {/* Divider */}
        <div className="w-12 h-px" style={{ background: "var(--kloven-smoke)" }} />

        {/* Title */}
        <h1
          className="font-heading text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-tight"
          style={{ color: "var(--kloven-white)" }}
        >
          {isActive ? title : "Volvemos pronto"}
        </h1>

        {/* Message */}
        <p
          className="text-base sm:text-lg max-w-md leading-relaxed"
          style={{ color: "var(--kloven-ash)" }}
        >
          {isActive ? message : "La tienda no está en modo drop en este momento."}
        </p>

        {/* Countdown */}
        {isActive && opensAt && (
          <div className="flex flex-col items-center gap-6 mt-4">
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--kloven-ash)" }}>
              Abre en
            </p>
            <DropCountdown opensAt={opensAt} />
          </div>
        )}

        {/* Bottom divider */}
        <div className="w-12 h-px mt-4" style={{ background: "var(--kloven-smoke)" }} />

        <p className="text-xs tracking-widest uppercase" style={{ color: "var(--kloven-ash)" }}>
          @kloven.ar
        </p>
      </div>
    </div>
  );
}
