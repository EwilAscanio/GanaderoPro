"use client";

import { useState } from "react";
import axios from "axios";
import { Search, AlertCircle, Check, Heart } from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function PalpacionPage() {
  const [codigo, setCodigo] = useState("");
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [fechaPalpacion, setFechaPalpacion] = useState("");
  const [preñado, setPreñado] = useState(false);
  const [tiempoGestion, setTiempoGestion] = useState(0);
  const [saving, setSaving] = useState(false);
  const notif = useNotification();

  const buscarAnimal = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    setSearchError("");
    setAnimal(null);
    setFechaPalpacion("");
    setPreñado(false);
    setTiempoGestion(0);

    try {
      const res = await axios.get(`/api/animal/${codigo.trim()}`);
      const a = res.data;

      if (a.sexo_ani === "Macho") {
        setSearchError("El animal agregado es Macho. Solo se permiten animales Hembra.");
        setLoading(false);
        return;
      }

      setAnimal(a);
      setFechaPalpacion(
        a.fechapalpacion_ani && !a.fechapalpacion_ani.startsWith("1900-01-01")
          ? a.fechapalpacion_ani.split("T")[0]
          : ""
      );
      setPreñado(Number(a.tiempogestacion_ani) > 0);
      setTiempoGestion(Number(a.tiempogestacion_ani) || 0);
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchError("Animal no encontrado. Verifica el código.");
      } else {
        setSearchError("Error al buscar el animal.");
      }
    } finally {
      setLoading(false);
    }
  };

  const guardar = async () => {
    if (!animal) return;
    setSaving(true);

    try {
      await axios.put(`/api/animal/${animal.codigo_ani}`, {
        fechapalpacion_ani: fechaPalpacion || null,
        tiempogestacion_ani: preñado ? Number(tiempoGestion) : 0,
        status_ani: "Activo",
      });

      await axios.post("/api/palpacion", {
        codigo_ani: animal.codigo_ani,
        fecha_pal: fechaPalpacion,
        animalembarazado_pal: preñado,
        tiempogestacion_pal: preñado ? Number(tiempoGestion) : 0,
      });

      notif.show({
        type: "success",
        title: "Palpación Registrada",
        message: `Palpación guardada para ${animal.nombre_ani} (${animal.codigo_ani}).`,
        onConfirm: () => {
          setAnimal(null);
          setCodigo("");
          setFechaPalpacion("");
          setPreñado(false);
          setTiempoGestion(0);
          notif.close();
        },
        showCancel: false,
      });
    } catch (err) {
      notif.error(err.response?.data?.error || "Error al guardar la palpación.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent-bg)" }}
        >
          <Heart size={22} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Palpación</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Registro de palpación para animales hembra
          </p>
        </div>
      </div>

      {/* Search */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
          Buscar Animal por Código
        </label>
        <div className="flex gap-2">
          <div
            className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <Search size={18} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === "Enter") buscarAnimal(); }}
              placeholder="Ej: V001"
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <button
            onClick={buscarAnimal}
            disabled={loading || !codigo.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white btn-hover disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {searchError && (
          <div
            className="flex items-center gap-2 mt-3 p-3 rounded-lg text-sm animate-fade-in"
            style={{
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
            }}
          >
            <AlertCircle size={16} />
            {searchError}
          </div>
        )}
      </div>

      {/* Form */}
      {animal && (
        <div
          className="rounded-xl p-5 space-y-5 animate-fade-in"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: "var(--bg-secondary)" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: "var(--accent)" }}
            >
              {animal.nombre_ani?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {animal.nombre_ani}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {animal.codigo_ani} — {animal.name_gru} — Arete: {animal.arete_ani}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Fecha de Palpación
            </label>
            <input
              type="date"
              value={fechaPalpacion}
              onChange={(e) => setFechaPalpacion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className="relative w-5 h-5 rounded flex items-center justify-center transition-all duration-200"
              style={{
                background: preñado ? "var(--accent)" : "var(--bg-secondary)",
                border: `2px solid ${preñado ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {preñado && <Check size={14} className="text-white" />}
            </div>
            <input
              type="checkbox"
              checked={preñado}
              onChange={(e) => setPreñado(e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm font-medium select-none" style={{ color: "var(--text-primary)" }}>
              El Animal está Preñado
            </span>
          </label>

          {preñado && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Tiempo de Gestación (días)
              </label>
              <input
                type="number"
                value={tiempoGestion}
                onChange={(e) => setTiempoGestion(e.target.value)}
                placeholder="Ej: 120"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setAnimal(null);
                setCodigo("");
                setFechaPalpacion("");
                setPreñado(false);
                setTiempoGestion(0);
              }}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium btn-hover"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white btn-hover disabled:opacity-60"
              style={{ background: "var(--accent)" }}
            >
              {saving ? "Guardando..." : "Guardar Palpación"}
            </button>
          </div>
        </div>
      )}

      <NotificationModal {...notif.notification} />
    </div>
  );
}
