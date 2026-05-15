"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({ error, unstable_retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-secondary)" }}>
      <div className="text-center max-w-md animate-scale-in">
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#fef2f2" }}>
          <AlertTriangle size={32} style={{ color: "#ef4444" }} />
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-2">Algo sali&oacute; mal</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Ocurri&oacute; un error inesperado. Puedes intentar de nuevo o volver al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => unstable_retry()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white btn-hover"
            style={{ background: "var(--accent)" }}
          >
            <RefreshCw size={16} />
            Intentar de nuevo
          </button>
          <a
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium btn-hover"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <Home size={16} />
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
