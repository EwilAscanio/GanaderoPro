import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-secondary)" }}>
      <div className="text-center max-w-md animate-scale-in">
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#fef2f2" }}>
          <FileQuestion size={32} style={{ color: "#ef4444" }} />
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-2">P&aacute;gina no encontrada</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          La p&aacute;gina que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white btn-hover"
          style={{ background: "var(--accent)" }}
        >
          <Home size={16} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
