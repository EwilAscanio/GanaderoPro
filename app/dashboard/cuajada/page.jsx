"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Milk, Search } from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function CuajadaPage() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [kg, setKg] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const notif = useNotification();

  const reload = async () => {
    try {
      const res = await axios.get("/api/cuajada");
      setRegistros(res.data);
    } catch {
      console.error("Error al cargar cuajada");
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get("/api/cuajada");
        if (mounted) setRegistros(res.data);
      } catch {
        console.error("Error al cargar cuajada");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const guardar = async () => {
    if (!fecha || !kg || Number(kg) <= 0) return;
    setSaving(true);
    try {
      await axios.post("/api/cuajada", { fecha_cua: fecha, kg_cua: Number(kg) });
      notif.show({
        type: "success",
        title: "Cuajada Registrada",
        message: `Se registraron ${kg} kg de cuajada.`,
        onConfirm: () => {
          reload();
          setFecha(new Date().toISOString().split("T")[0]);
          setKg("");
          notif.close();
        },
        showCancel: false,
      });
    } catch (err) {
      notif.error(err.response?.data?.error || "Error al registrar cuajada");
    } finally {
      setSaving(false);
    }
  };

  const filtered = registros.filter(
    (r) =>
      r.fecha_cua?.includes(search) ||
      String(r.kg_cua)?.includes(search)
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent-bg)" }}
        >
          <Milk size={22} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Cuajada</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Registro de producción de cuajada
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-5 space-y-5"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Fecha
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
              Cantidad (Kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              placeholder="Ej: 30.0"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        <button
          onClick={guardar}
          disabled={saving || !kg || Number(kg) <= 0}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white btn-hover disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {saving ? "Guardando..." : "Registrar Cuajada"}
        </button>
      </div>

      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <Search size={18} style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Buscar registros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <p style={{ color: "var(--text-muted)" }}>No se encontraron registros</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ background: "var(--bg-card)" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)" }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Fecha</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Kg</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r.id_cua}
                  className="border-t transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    animation: `fadeInUp 0.3s ease ${i * 0.04}s forwards`,
                    opacity: 0,
                  }}
                >
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                    {new Date(r.fecha_cua).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-primary)" }}>
                    {Number(r.kg_cua).toFixed(2)} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NotificationModal {...notif.notification} />
    </div>
  );
}
