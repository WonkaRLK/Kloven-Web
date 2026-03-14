"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Loader2, Link2, Unlink, CheckCircle, AlertCircle, Copy, Check, Save } from "lucide-react";

function MpConnectContent() {
  const { token } = useAdminAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [feePercent, setFeePercent] = useState(0);
  const [appIdConfigured, setAppIdConfigured] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [editFee, setEditFee] = useState("");
  const [savingFee, setSavingFee] = useState(false);
  const [feeSaved, setFeeSaved] = useState(false);

  // OAuth callback params
  const success = searchParams.get("success");
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const sellerId = searchParams.get("user_id");
  const error = searchParams.get("error");

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/mp-config", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setConnected(data.connected);
        setFeePercent(data.fee_percent);
        setEditFee(String(data.fee_percent));
        setAppIdConfigured(data.app_id_configured);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveFee = async () => {
    const val = parseFloat(editFee);
    if (isNaN(val) || val < 0 || val > 100) return;
    setSavingFee(true);
    try {
      const res = await fetch("/api/admin/mp-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fee_percent: val }),
      });
      if (res.ok) {
        setFeePercent(val);
        setFeeSaved(true);
        setTimeout(() => setFeeSaved(false), 2000);
      }
    } catch {
      // ignore
    }
    setSavingFee(false);
  };

  const errorMessages: Record<string, string> = {
    no_code: "No se recibio el codigo de autorizacion de MercadoPago.",
    config: "MP_APP_ID o MP_CLIENT_SECRET no estan configurados.",
    oauth_failed: "Fallo la autorizacion con MercadoPago. Intenta de nuevo.",
    server: "Error del servidor al procesar la autorizacion.",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Split de Pagos</h1>
      <p className="text-gray-500 text-sm mb-8">
        Conecta la cuenta de cobro de Kloven para dividir los pagos automaticamente entre proveedor y vendedor.
      </p>

      {/* Error from OAuth */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-red-800">Error de conexion</p>
            <p className="text-sm text-red-600 mt-1">
              {errorMessages[error] || "Error desconocido."}
            </p>
          </div>
        </div>
      )}

      {/* Success from OAuth — show tokens to copy */}
      {success && accessToken && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-green-800">
                Cuenta de cobro conectada exitosamente
              </p>
              <p className="text-sm text-green-600 mt-1">
                Copia estos tokens a tus variables de entorno (.env.local en
                desarrollo, o en Vercel para produccion).
              </p>

              {sellerId && (
                <p className="text-xs text-green-600 mt-2">
                  Seller MP User ID: {sellerId}
                </p>
              )}

              <div className="mt-4 space-y-3">
                <TokenField
                  label="MP_SELLER_ACCESS_TOKEN"
                  value={accessToken}
                  copied={copied}
                  onCopy={handleCopy}
                />
                {refreshToken && (
                  <TokenField
                    label="MP_SELLER_REFRESH_TOKEN"
                    value={refreshToken}
                    copied={copied}
                    onCopy={handleCopy}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {connected ? (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Unlink className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div>
              <p className="font-semibold">
                {connected ? "Cuenta conectada" : "Cuenta no conectada"}
              </p>
              <p className="text-sm text-gray-500">
                {connected
                  ? "Los pagos se dividen automaticamente entre proveedor y vendedor."
                  : "El split de pagos no esta activo. Conecta la cuenta de cobro para activarlo."}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              connected
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {connected ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Fee editor */}
        {connected && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium mb-1">Comision proveedor</p>
            <p className="text-xs text-gray-500 mb-3">
              Porcentaje que recibe el proveedor de cada venta. Se aplica en tiempo real.
            </p>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={editFee}
                  onChange={(e) => setEditFee(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold text-center pr-8 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
              <button
                onClick={handleSaveFee}
                disabled={savingFee || parseFloat(editFee) === feePercent}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingFee ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : feeSaved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {feeSaved ? "Guardado" : "Guardar"}
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        {connected && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium mb-2">Como funciona</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                Ejemplo: Producto de <strong>$10.000</strong> con{" "}
                <strong>{feePercent}%</strong> para el proveedor:
              </p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>
                  Proveedor recibe: <strong>${(10000 * feePercent / 100).toLocaleString("es-AR")}</strong>
                </li>
                <li>
                  MercadoPago cobra: <strong>~$410</strong> (comision ~4,1%)
                </li>
                <li>
                  Kloven recibe: <strong>~${(10000 - 10000 * feePercent / 100 - 410).toLocaleString("es-AR")}</strong>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Connect button */}
        {!connected && (
          <div className="border-t border-gray-100 pt-4">
            {!appIdConfigured ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  Configuracion requerida
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Primero configura MP_APP_ID y MP_CLIENT_SECRET en tus
                  variables de entorno. Estos datos se obtienen al crear una
                  aplicacion tipo Marketplace en{" "}
                  <a
                    href="https://www.mercadopago.com.ar/developers/panel/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    el panel de MercadoPago
                  </a>
                  .
                </p>
              </div>
            ) : (
              <a
                href="/api/mp/oauth"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#009EE3] text-white font-medium rounded-lg hover:bg-[#0086c3] transition-colors"
              >
                <Link2 className="w-4 h-4" />
                Conectar cuenta de cobro
              </a>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Pasos para conectar:</p>
              <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                <li>
                  El proveedor crea la aplicacion tipo <strong>Marketplace</strong> en
                  el panel de MercadoPago Developers (con su cuenta de MP)
                </li>
                <li>
                  Configurar <code className="bg-gray-200 px-1 rounded">MP_APP_ID</code> y{" "}
                  <code className="bg-gray-200 px-1 rounded">MP_CLIENT_SECRET</code> en variables
                  de entorno
                </li>
                <li>
                  El dueño de Kloven hace click en &quot;Conectar cuenta de cobro&quot;
                </li>
                <li>
                  El dueño de Kloven autoriza con su cuenta de MercadoPago
                </li>
                <li>
                  Copiar los tokens generados a las variables de entorno
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TokenField({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: string | null;
  onCopy: (text: string, label: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-green-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-white border border-green-200 rounded px-3 py-2 overflow-x-auto break-all">
          {value}
        </code>
        <button
          onClick={() => onCopy(value, label)}
          className="shrink-0 p-2 rounded-lg border border-green-200 bg-white hover:bg-green-50 transition-colors"
          title="Copiar"
        >
          {copied === label ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-green-600" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function MpConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      }
    >
      <MpConnectContent />
    </Suspense>
  );
}
