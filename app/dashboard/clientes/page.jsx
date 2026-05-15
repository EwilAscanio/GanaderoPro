"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Plus, Pencil, Trash2, Search, Briefcase,
} from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function ClientesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const notif = useNotification();

  const isAdmin = session?.user?.role === "Administrador";

  const reload = async () => {
    try {
      const res = await axios.get("/api/clientes");
      setClientes(res.data);
    } catch {
      console.error("Error al recargar clientes");
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get("/api/clientes");
        if (mounted) setClientes(res.data);
      } catch {
        console.error("Error al cargar datos");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = clientes.filter(
    (c) =>
      String(c.codigo_cli).includes(search) ||
      c.nombre_cli?.toLowerCase().includes(search.toLowerCase()) ||
      c.rif_cli?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent-bg)" }}
          >
            <Briefcase size={22} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Clientes</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Gestión de clientes del sistema
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => router.push("/dashboard/clientes/registrar")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-hover"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={18} />
            Nuevo Cliente
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
          placeholder="Buscar por código, nombre o RIF..."
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
          <p style={{ color: "var(--text-muted)" }}>No se encontraron clientes</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ background: "var(--bg-card)" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)" }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Código</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Nombre</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: "var(--text-muted)" }}>Teléfono</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: "var(--text-muted)" }}>RIF</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell" style={{ color: "var(--text-muted)" }}>Correo</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.codigo_cli}
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
                      {c.codigo_cli}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "var(--accent)" }}
                      >
                        {c.nombre_cli?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{c.nombre_cli}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.direccion_cli}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                    {c.telefono_cli}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                    {c.rif_cli}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell" style={{ color: "var(--text-secondary)" }}>
                    {c.email_cli}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/dashboard/clientes/actualizar/${c.codigo_cli}`)}
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
                            title: "Eliminar Cliente",
                            message: `¿Estás seguro de eliminar a ${c.nombre_cli} (${c.codigo_cli})? Esta acción no se puede deshacer.`,
                            onConfirm: async () => {
                              try {
                                await axios.delete(`/api/clientes/${c.codigo_cli}`);
                                reload();
                                notif.success(`Cliente "${c.nombre_cli}" eliminado correctamente.`);
                              } catch (err) {
                                notif.error(err.response?.data?.error || "Error al eliminar cliente");
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
