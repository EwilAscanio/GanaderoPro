"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import ColorPicker from "@/components/ColorPicker";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Palette, Moon, Sun, User, FileText } from "lucide-react";

export default function ConfiguracionPage() {
  const { darkMode, toggleDark, accentColor, changeAccent } = useTheme();
  const { data: session } = useSession();
  const [configDB, setConfigDB] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get("/api/configuracion");
        
        if (mounted) setConfigDB(res.data);
      } catch {
        console.error("Error al cargar configuración del sistema");
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const sections = [
    {
      icon: User,
      title: "Perfil",
      desc: "Información personal y preferencias de cuenta",
      fields: [
        { label: "Nombre", value: session?.user?.name || "—" },
        { label: "Usuario", value: session?.user?.login || "—" },
        { label: "Correo", value: session?.user?.email || "—" },
        { label: "Rol", value: session?.user?.role || "—" },
      ],
    },
    {
      icon: FileText,
      title: "Sistema",
      desc: "Configuración general del sistema",
      fields: [
        { label: "Número de Factura", value: configDB?.numero_fac ?? "—" },
        {
          label: "Última Vacunación",
          value: configDB?.ultima_vacunacion
            ? new Date(configDB.ultima_vacunacion).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "—",
        },
        { label: "Último Código Cliente", value: configDB?.codigo_cli ?? "—" },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">
          Configuración
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Personaliza tu experiencia en el sistema
        </p>
      </div>

      {/* Theme & Colors */}
      <div
        className="rounded-xl p-5 card-hover"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-semibold mb-1 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Palette size={18} style={{ color: "var(--accent)" }} />
          Apariencia
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
          Cambia el tema y el color principal del dashboard
        </p>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Theme toggle */}
          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Modo
            </p>
            <button
              onClick={toggleDark}
              className="flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 btn-hover"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className="text-sm font-medium">
                {darkMode ? "Modo Claro" : "Modo Oscuro"}
              </span>
              <span
                className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--accent-bg)",
                  color: "var(--accent)",
                }}
              >
                {darkMode ? "Cambiar" : "Cambiar"}
              </span>
            </button>
          </div>

          {/* Accent color */}
          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Color de acento
            </p>
            <div
              className="p-4 rounded-xl"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
            >
              <ColorPicker accentColor={accentColor} onChange={changeAccent} />
            </div>
          </div>
        </div>
      </div>

      {/* Config sections */}
      {sections.map((section, i) => (
        <div
          key={section.title}
          className="rounded-xl p-5 card-hover"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            animation: `fadeInUp 0.4s ease ${0.15 + i * 0.1}s forwards`,
            opacity: 0,
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--accent-bg)" }}
            >
              <section.icon size={18} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {section.title}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {section.desc}
              </p>
            </div>
          </div>

          {section.fields && (
            <div className="space-y-2">
              {section.fields.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {f.label}
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {section.toggles && (
            <div className="space-y-2">
              {section.toggles.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {t.label}
                  </span>
                  <div
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-200`}
                    style={{
                      background: t.enabled ? "var(--accent)" : "var(--border)",
                    }}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200`}
                      style={{
                        left: t.enabled ? "22px" : "2px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
