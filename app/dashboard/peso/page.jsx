"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Scale, Search, AlertTriangle, CheckCircle2, XCircle,
} from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function PesoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pesos, setPesos] = useState({});
  const [procesando, setProcesando] = useState(false);
  const notif = useNotification();

  const isAdmin = session?.user?.role === "Administrador";

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get("/api/animal");
        if (!mounted) return;
        setAnimales(res.data);
        const initial = {};
        res.data.forEach((a) => {
          initial[a.codigo_ani] = a.peso_ani ?? 0;
        });
        setPesos(initial);
      } catch {
        console.error("Error al cargar animales");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => {
    const total = animales.length;
    const conPeso = animales.filter((a) => a.peso_ani > 0).length;
    const sinPeso = total - conPeso;
    return { total, conPeso, sinPeso };
  }, [animales]);

  const filteredAnimales = useMemo(() => {
    if (!search.trim()) return animales;
    const q = search.toLowerCase();
    return animales.filter(
      (a) =>
        a.codigo_ani.toLowerCase().includes(q)
        
        //a.codigo_ani.toLowerCase().includes(q) ||
        //a.nombre_ani.toLowerCase().includes(q) ||
        //a.arete_ani.toLowerCase().includes(q)
    );
  }, [animales, search]);

  const cambios = useMemo(() => {
    const modified = [];
    animales.forEach((a) => {
      const original = a.peso_ani ?? 0;
      const nuevo = pesos[a.codigo_ani] ?? 0;
      if (Number(nuevo) !== Number(original)) {
        modified.push(a.codigo_ani);
      }
    });
    return modified;
  }, [animales, pesos]);

  const handlePesoChange = (codigo, value) => {
    const num = value === "" ? 0 : Number(value);
    setPesos((prev) => ({ ...prev, [codigo]: num }));
  };

  const handleGuardar = async () => {
    const cambiosList = [];
    animales.forEach((a) => {
      const original = a.peso_ani ?? 0;
      const nuevo = pesos[a.codigo_ani] ?? 0;
      if (Number(nuevo) !== Number(original)) {
        cambiosList.push({ codigo_ani: a.codigo_ani, peso_ani: Number(nuevo) });
      }
    });

    if (cambiosList.length === 0) {
      notif.info("No hay cambios de peso para guardar.", "Sin Cambios");
      return;
    }

    setProcesando(true);
    try {
      const res = await axios.post("/api/peso", { animales: cambiosList });

      setAnimales((prev) =>
        prev.map((a) => ({
          ...a,
          peso_ani: pesos[a.codigo_ani] !== undefined ? Number(pesos[a.codigo_ani]) : a.peso_ani,
        }))
      );

      notif.show({
        type: "success",
        title: "Pesos Actualizados",
        message: `Se actualizó el peso de ${res.data.animales_afectados} animales exitosamente.`,
        onConfirm: () => {
          notif.close();
          router.push("/dashboard");
        },
        showCancel: false,
      });
    } catch (err) {
      notif.error(
        err.response?.data?.error || "Error al actualizar pesos",
        "Error"
      );
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--text-muted)" }}>
          No tienes permisos para acceder a esta sección
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Peso</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Registro masivo de peso de animales
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{ background: "var(--accent-bg)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--accent)" }}
          >
            <Scale size={24} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Total Animales
            </p>
            <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>
              {stats.total}
            </p>
          </div>
        </div>
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{
            background: "color-mix(in srgb, #22c55e 10%, var(--bg-card))",
            border: "1px solid color-mix(in srgb, #22c55e 30%, transparent)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#22c55e" }}
          >
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Con Peso
            </p>
            <p className="text-lg font-bold" style={{ color: "#22c55e" }}>
              {stats.conPeso}
            </p>
          </div>
        </div>
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{
            background: "color-mix(in srgb, #ef4444 10%, var(--bg-card))",
            border: "1px solid color-mix(in srgb, #ef4444 30%, transparent)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#ef4444" }}
          >
            <XCircle size={24} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Sin Peso
            </p>
            <p className="text-lg font-bold" style={{ color: "#ef4444" }}>
              {stats.sinPeso}
            </p>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl p-6 space-y-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Buscar por código"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none input-focus"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Código</th>
                <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Nombre</th>
                <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Arete</th>
                <th className="text-right py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Peso Actual</th>
                <th className="text-right py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Nuevo Peso (kg)</th>
                <th className="text-center py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnimales.map((a) => {
                const original = a.peso_ani ?? 0;
                const nuevo = pesos[a.codigo_ani] ?? 0;
                const isModified = Number(nuevo) !== Number(original);
                return (
                  <tr key={a.codigo_ani} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-3 px-3 font-medium" style={{ color: "var(--text-primary)" }}>
                      {a.codigo_ani}
                    </td>
                    <td className="py-3 px-3" style={{ color: "var(--text-secondary)" }}>
                      {a.nombre_ani}
                    </td>
                    <td className="py-3 px-3" style={{ color: "var(--text-secondary)" }}>
                      {a.arete_ani}
                    </td>
                    <td className="py-3 px-3 text-right" style={{ color: "var(--text-secondary)" }}>
                      {original > 0 ? `${original} kg` : "—"}
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        value={pesos[a.codigo_ani] ?? 0}
                        onChange={(e) => handlePesoChange(a.codigo_ani, e.target.value)}
                        className="w-28 ml-auto block rounded-lg px-3 py-1.5 text-sm text-right outline-none input-focus"
                        style={{
                          background: "var(--bg-secondary)",
                          border: isModified ? "2px solid var(--accent)" : "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isModified ? (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                            color: "var(--accent)",
                          }}
                        >
                          MOD
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAnimales.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
              {search ? "No se encontraron animales con ese criterio de búsqueda" : "No hay animales registrados"}
            </p>
          )}
        </div>

        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: "color-mix(in srgb, var(--accent) 8%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
          <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--text-primary)" }}>Importante:</strong>{" "}
            Solo se actualizarán los animales cuyo peso haya sido modificado ({cambios.length} cambios detectados).
          </div>
        </div>

        <button
          onClick={handleGuardar}
          disabled={procesando || cambios.length === 0}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white btn-hover disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: "var(--accent)" }}
        >
          {procesando ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <Scale size={18} />
              Guardar Pesos ({cambios.length} cambios)
            </>
          )}
        </button>
      </div>

      <NotificationModal {...notif.notification} />
    </div>
  );
}
