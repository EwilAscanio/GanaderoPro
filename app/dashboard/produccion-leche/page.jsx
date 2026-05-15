"use client";

import { useState } from "react";
import axios from "axios";
import { Search, AlertCircle, Droplets } from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function ProduccionLechePage() {
  const [codigo, setCodigo] = useState("");
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [litros, setLitros] = useState("");
  const [saving, setSaving] = useState(false);
  const notif = useNotification();

  const buscarAnimal = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    setSearchError("");
    setAnimal(null);
    setLitros("");

    try {
      const res = await axios.get(`/api/animal/${codigo.trim()}`);
      const a = res.data;

      if (a.sexo_ani !== "Hembra") {
        setSearchError("El animal agregado es Macho. Solo se permite registrar producción de leche para Hembras.");
        setLoading(false);
        return;
      }

      setAnimal(a);
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
    if (!animal || !litros || Number(litros) <= 0) return;
    setSaving(true);

    try {
      await axios.post("/api/produccion-leche", {
        codigo_ani: animal.codigo_ani,
        fecha_lec: fecha,
        litros_lec: Number(litros),
      });

      notif.show({
        type: "success",
        title: "Producción Registrada",
        message: `Se registraron ${litros} L para ${animal.nombre_ani} (${animal.codigo_ani}).`,
        onConfirm: () => {
          setAnimal(null);
          setCodigo("");
          setFecha(new Date().toISOString().split("T")[0]);
          setLitros("");
          notif.close();
        },
        showCancel: false,
      });
    } catch (err) {
      notif.error(err.response?.data?.error || "Error al registrar producción.");
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
          <Droplets size={22} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Producción de Leche</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Registro de producción lechera por animal
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Fecha de Producción
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Cantidad (Litros)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={litros}
                onChange={(e) => setLitros(e.target.value)}
                placeholder="Ej: 25.5"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setAnimal(null);
                setCodigo("");
                setFecha(new Date().toISOString().split("T")[0]);
                setLitros("");
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
              disabled={saving || !litros || Number(litros) <= 0}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white btn-hover disabled:opacity-60"
              style={{ background: "var(--accent)" }}
            >
              {saving ? "Guardando..." : "Guardar Producción"}
            </button>
          </div>
        </div>
      )}

      <NotificationModal {...notif.notification} />
    </div>
  );
}
