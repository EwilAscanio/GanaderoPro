"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FileText, List, ArrowRight } from "lucide-react";

export default function ReportesPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [grupo, setGrupo] = useState("");
  const [familia, setFamilia] = useState("");
  const [loadingFam, setLoadingFam] = useState(false);

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

  const handleGenerate = () => {
    if (!grupo) return;
    const params = new URLSearchParams({ grupo });
    if (familia) params.set("familia", familia);
    router.push(`/dashboard/reportes/animales?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Reportes</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Selecciona un reporte para generar
        </p>
      </div>

      <div className="max-w-xl">
        <div
          className="rounded-xl p-6 transition-all duration-200 animate-fade-in-up"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--accent-bg)" }}
            >
              <List size={24} style={{ color: "var(--accent)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                Familias por Grupo
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Reporte de animales agrupados por familia
              </p>
            </div>
          </div>

          <div className="space-y-4">
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

            <button
              onClick={handleGenerate}
              disabled={!grupo}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-hover transition-all disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              <FileText size={16} />
              Generar Reporte
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
