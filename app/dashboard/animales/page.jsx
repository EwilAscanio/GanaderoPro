"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Plus, Pencil, Trash2, Search, Sparkles, X,
} from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function AnimalesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [criasModal, setCriasModal] = useState(null);
  const [criasList, setCriasList] = useState([]);
  const [criasLoading, setCriasLoading] = useState(false);
  const notif = useNotification();

  const isAdmin = session?.user?.role === "Administrador";

  const reload = async () => {
    try {
      const res = await axios.get("/api/animal");
      setAnimales(res.data);
    } catch {
      console.error("Error al recargar animales");
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get("/api/animal");

        console.log("Animales cargados:", res.data);
        
        if (mounted) setAnimales(res.data);
      } catch {
        console.error("Error al cargar datos");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = animales.filter(
    (a) =>
      a.codigo_ani?.toLowerCase().includes(search.toLowerCase()) ||
      a.nombre_ani?.toLowerCase().includes(search.toLowerCase()) ||
      a.arete_ani?.toLowerCase().includes(search.toLowerCase()) ||
      a.name_gru?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Animales</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Gestión de animales del sistema
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => router.push("/dashboard/animales/registrar")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-hover"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={18} />
            Nuevo Animal
          </button>
        )}
      </div>

      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl animate-fade-in"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <Search size={18} style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Buscar por código, nombre, arete o grupo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p style={{ color: "var(--text-muted)" }}>No se encontraron animales</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ background: "var(--bg-card)" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)" }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Código</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Nombre</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: "var(--text-muted)" }}>Grupo</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: "var(--text-muted)" }}>Familia</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>Sexo</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell" style={{ color: "var(--text-muted)" }}>Peso</th>
                <th className="text-left px-4 py-3 font-medium hidden xl:table-cell" style={{ color: "var(--text-muted)" }}>Fecha Palpación</th>
                <th className="text-left px-4 py-3 font-medium hidden xl:table-cell" style={{ color: "var(--text-muted)" }}>Fecha Vacunación</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr
                  key={a.codigo_ani}
                  className="border-t transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    animation: `fadeInUp 0.3s ease ${i * 0.03}s forwards`,
                    opacity: 0,
                  }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex px-2 py-0.5 rounded text-xs font-mono font-bold"
                      style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                    >
                      {a.codigo_ani}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "var(--accent)" }}
                      >
                        {a.nombre_ani?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{a.nombre_ani}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Arete: {a.arete_ani}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                    {a.name_gru}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                    {a.name_fam}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: a.sexo_ani === "Macho" ? "#eff6ff" : "#fdf2f8",
                        color: a.sexo_ani === "Macho" ? "#2563eb" : "#db2777",
                      }}
                    >
                      {a.sexo_ani}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell" style={{ color: "var(--text-secondary)" }}>
                    {a.peso_ani} kg
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell" style={{ color: "var(--text-secondary)" }}>
                    {a.fechapalpacion_ani && !a.fechapalpacion_ani.startsWith("1900-01-01")
                      ? new Date(a.fechapalpacion_ani).toLocaleDateString("es-VE")
                      : "Sin Registro"}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell" style={{ color: "var(--text-secondary)" }}>
                    {a.fechavacunacion_ani
                      ? new Date(a.fechavacunacion_ani).toLocaleDateString("es-VE")
                      : "Sin Registro"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          if (a.sexo_ani === "Macho") {
                            notif.show({
                              type: "info",
                              title: "Animal Macho",
                              message: `"${a.nombre_ani}" (${a.codigo_ani}) es macho, no tiene crías registradas.`,
                              onConfirm: () => notif.close(),
                              showCancel: false,
                            });
                            return;
                          }
                          setCriasModal(a);
                          setCriasLoading(true);
                          setCriasList([]);
                          axios.get(`/api/animal/${a.codigo_ani}/crias`).then((res) => {
                            setCriasList(res.data);
                            setCriasLoading(false);
                          }).catch(() => {
                            setCriasLoading(false);
                          });
                        }}
                        className="p-2 rounded-lg btn-hover"
                        style={{ color: "var(--accent)" }}
                        title="Ver crías"
                      >
                        <Sparkles size={16} />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/animales/actualizar/${a.codigo_ani}`)}
                        className="p-2 rounded-lg btn-hover"
                        style={{ color: "var(--accent)" }}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() =>
                          notif.show({
                            type: "delete",
                            title: "Eliminar Animal",
                            message: `¿Estás seguro de eliminar a ${a.nombre_ani} (${a.codigo_ani})? Esta acción no se puede deshacer.`,
                            onConfirm: async () => {
                              try {
                                await axios.delete(`/api/animal/${a.codigo_ani}`);
                                reload();
                                notif.success(`Animal "${a.nombre_ani}" eliminado correctamente.`);
                              } catch (err) {
                                notif.error(err.response?.data?.error || "Error al eliminar animal");
                              }
                            },
                          })
                        }
                        className="p-2 rounded-lg btn-hover"
                        style={{ color: "#ef4444" }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {criasModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setCriasModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl p-5 space-y-4 animate-fade-in-up max-h-[80vh] flex flex-col"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--accent-bg)" }}
                >
                  <Sparkles size={18} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    Crías de {criasModal.nombre_ani}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {criasModal.codigo_ani}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCriasModal(null)}
                className="p-1.5 rounded-lg btn-hover"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 -mx-5 px-5 space-y-2">
              {criasLoading ? (
                <div className="flex justify-center py-10">
                  <div
                    className="w-6 h-6 rounded-full animate-spin"
                    style={{ border: "2px solid var(--border)", borderTopColor: "var(--accent)" }}
                  />
                </div>
              ) : criasList.length === 0 ? (
                <p className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
                  Este animal no tiene crías registradas.
                </p>
              ) : (
                criasList.map((c) => (
                  <div
                    key={c.codigo_ani}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: "var(--bg-secondary)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: "var(--accent)" }}
                    >
                      {c.nombre_ani?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                        {c.nombre_ani}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {c.codigo_ani} — {c.name_gru} — {c.sexo_ani}
                      </p>
                    </div>
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                      style={{
                        background: c.status_ani === "Activo" ? "#f0fdf4" : "#fef2f2",
                        color: c.status_ani === "Activo" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {c.status_ani}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setCriasModal(null)}
              className="w-full py-2.5 rounded-lg text-sm font-medium btn-hover"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <NotificationModal {...notif.notification} />
    </div>
  );
}


