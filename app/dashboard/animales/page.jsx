"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Plus, Pencil, Trash2, Search,
} from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function AnimalesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
      <NotificationModal {...notif.notification} />
    </div>
  );
}


