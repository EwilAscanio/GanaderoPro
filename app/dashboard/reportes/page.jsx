"use client";

import { Construction } from "lucide-react";

export default function ReportesPage() {
  return <UnderConstruction title="Reportes" />;
}

function UnderConstruction({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in-up">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 animate-float"
        style={{ background: "var(--accent-bg)" }}
      >
        <Construction size={40} style={{ color: "var(--accent)" }} />
      </div>
      <h1 className="text-3xl font-bold gradient-text mb-3">{title}</h1>
      <p className="text-lg mb-2" style={{ color: "var(--text-secondary)" }}>
        Página en construcción
      </p>
      <p className="text-sm max-w-md" style={{ color: "var(--text-muted)" }}>
        Esta sección pronto será desarrollada. Estamos trabajando para brindarte
        la mejor experiencia de gestión ganadera.
      </p>
    </div>
  );
}
