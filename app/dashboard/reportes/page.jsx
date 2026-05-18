"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FileText, List, ArrowRight, Milk, Receipt, Users, Baby, Heart, Activity } from "lucide-react";

const reportes = [
  // ==============================
  // Reporte Familias por Grupo
  // ==============================
  {
    id: "familias",
    icon: List,
    titulo: "Familias por Grupo",
    descripcion: "Reporte de animales agrupados por familia",
    necesitaGrupo: true,
    necesitaFamilia: true,
    necesitaFechas: false,
    ruta: "animales",
  },
  // ==============================
  // Reporte Produccion de Leche
  // ==============================
  {
    id: "produccion-leche",
    icon: Milk,
    titulo: "Producción de Leche",
    descripcion: "Reporte de producción lechera por período",
    necesitaGrupo: false,
    necesitaFamilia: false,
    necesitaFechas: true,
    ruta: "produccion-leche",
  },
  // ==============================
  // Reporte Facturas
  // ==============================
  {
    id: "facturas",
    icon: Receipt,
    titulo: "Facturas",
    descripcion: "Reporte de facturas emitidas por período",
    necesitaGrupo: false,
    necesitaFamilia: false,
    necesitaFechas: true,
    ruta: "facturas",
  },
  
  // ==============================
  // Reporte Nacimientos
  // ==============================
  {
    id: "nacimientos",
    icon: Baby,
    titulo: "Nacimientos",
    descripcion: "Reporte de nacimientos por período",
    necesitaGrupo: false,
    necesitaFamilia: false,
    necesitaFechas: true,
    ruta: "nacimientos",
  },
  
  // ==============================
  // Reporte Palpaciones
  // ==============================
  {
    id: "palpaciones",
    icon: Activity,
    titulo: "Palpaciones",
    descripcion: "Reporte histórico de palpaciones por período",
    necesitaGrupo: false,
    necesitaFamilia: false,
    necesitaFechas: true,
    ruta: "palpaciones",
  },
  // ==============================
  // Reporte Madres y Crias
  // ==============================
  {
    id: "nacimientos-madres",
    icon: Heart,
    titulo: "Madres y Crías",
    descripcion: "Reporte de madres con sus crías",
    necesitaGrupo: false,
    necesitaFamilia: false,
    necesitaFechas: false,
    necesitaCodigoMadre: true,
    ruta: "nacimientos-madres",
  },
  // ==============================
  // Reporte Clientes
  // ==============================
  {
    id: "clientes",
    icon: Users,
    titulo: "Clientes",
    descripcion: "Reporte de clientes registrados",
    necesitaGrupo: false,
    necesitaFamilia: false,
    necesitaFechas: false,
    ruta: "clientes",
  },
];

export default function ReportesPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [grupo, setGrupo] = useState("");
  const [familia, setFamilia] = useState("");
  const [loadingFam, setLoadingFam] = useState(false);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [codigoMadre, setCodigoMadre] = useState("");

  useEffect(() => {
    axios.get("/api/grupo").then((r) => setGrupos(r.data)).catch(console.error);
  }, []);

  const loadFamilias = async (grupoId) => {
    setLoadingFam(true);
    try {
      const params = grupoId ? { grupo: grupoId } : {};
      const res = await axios.get("/api/reportes/familias", { params });
      setFamilias(res.data);
    } catch {
      console.error("Error al cargar familias");
    } finally {
      setLoadingFam(false);
    }
  };

  const handleGrupoChange = (e) => {
    const id = e.target.value;
    setGrupo(id);
    setFamilia("");
    if (id) loadFamilias(id);
    else setFamilias([]);
  };

  const handleGenerate = (reporte) => {
    if (reporte.id === "familias") {
      if (!grupo) return;
      const params = new URLSearchParams({ grupo });
      if (familia) params.set("familia", familia);
      router.push(`/dashboard/reportes/${reporte.ruta}?${params.toString()}`);
    } else if (reporte.necesitaFechas) {
      const params = new URLSearchParams();
      if (fechaDesde) params.set("fecha_desde", fechaDesde);
      if (fechaHasta) params.set("fecha_hasta", fechaHasta);
      router.push(`/dashboard/reportes/${reporte.ruta}?${params.toString()}`);
    } else if (reporte.necesitaCodigoMadre) {
      const params = new URLSearchParams();
      if (codigoMadre) params.set("codigo_ani", codigoMadre);
      router.push(`/dashboard/reportes/${reporte.ruta}?${params.toString()}`);
    } else {
      router.push(`/dashboard/reportes/${reporte.ruta}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Reportes</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Selecciona un reporte para generar
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {reportes.map((reporte, idx) => {
          const Icon = reporte.icon;
          return (
            <div
              key={reporte.id}
              className="rounded-xl p-6 transition-all duration-200 animate-fade-in-up"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                animationDelay: `${idx * 0.05}s`,
              }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--accent-bg)" }}
                >
                  <Icon size={24} style={{ color: "var(--accent)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                    {reporte.titulo}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    {reporte.descripcion}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {reporte.necesitaGrupo && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Grupo <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <select
                        value={grupo}
                        onChange={handleGrupoChange}
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <option value="">Selecciona un grupo</option>
                        {grupos.map((g) => (
                          <option key={g.id_gru} value={g.id_gru}>
                            {g.name_gru}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Familia
                      </label>
                      <select
                        value={familia}
                        onChange={(e) => setFamilia(e.target.value)}
                        disabled={!grupo || loadingFam}
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors disabled:opacity-50"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <option value="">Todas las familias</option>
                        {familias.map((f) => (
                          <option key={f.codigo_fam} value={f.codigo_fam}>
                            {f.name_fam} ({f.total})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {reporte.necesitaCodigoMadre && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      Código de la madre
                    </label>
                    <input
                      type="text"
                      value={codigoMadre}
                      onChange={(e) => setCodigoMadre(e.target.value)}
                      placeholder="Dejar vacío para mostrar todas"
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                      style={{
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border)",
                      }}
                    />
                  </div>
                )}

                {reporte.necesitaFechas && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Fecha desde
                      </label>
                      <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border)",
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Fecha hasta
                      </label>
                      <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border)",
                        }}
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={() => handleGenerate(reporte)}
                  disabled={reporte.necesitaGrupo && !grupo}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-hover transition-all disabled:opacity-50"
                  style={{ background: "var(--accent)" }}
                >
                  <FileText size={16} />
                  Generar Reporte
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
