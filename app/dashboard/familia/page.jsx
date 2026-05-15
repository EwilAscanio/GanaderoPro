"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  Users, Plus, Pencil, Trash2, X, Search,
} from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function FamiliaPage() {
  const { data: session } = useSession();
  const [familias, setFamilias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [editingFamilia, setEditingFamilia] = useState(null);
  const notif = useNotification();

  const isAdmin = session?.user?.role === "Administrador";

  const reload = async () => {
    try {
      const res = await axios.get("/api/familia");
      setFamilias(res.data);
    } catch {
      console.error("Error al recargar familias");
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [famRes, gruRes] = await Promise.all([
          axios.get("/api/familia"),
          axios.get("/api/grupo"),
        ]);
        if (mounted) {
          setFamilias(famRes.data);
          setGrupos(gruRes.data);
        }
      } catch {
        console.error("Error al cargar datos");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = familias.filter(
    (f) =>
      f.codigo_fam?.toLowerCase().includes(search.toLowerCase()) ||
      f.name_fam?.toLowerCase().includes(search.toLowerCase()) ||
      f.name_gru?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Familias</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Gestión de familias de animales
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditingFamilia(null); setModal("create"); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-hover"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={18} />
            Nueva Familia
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
          placeholder="Buscar familias..."
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
          <p style={{ color: "var(--text-muted)" }}>No se encontraron familias</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ background: "var(--bg-card)" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)" }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Código</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Nombre</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Grupo</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>Creado</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr
                  key={f.codigo_fam}
                  className="border-t transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    animation: `fadeInUp 0.3s ease ${i * 0.04}s forwards`,
                    opacity: 0,
                  }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex px-2 py-0.5 rounded text-xs font-mono font-bold"
                      style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                    >
                      {f.codigo_fam}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                    {f.name_fam}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {f.name_gru}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>
                    {f.created_at ? new Date(f.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditingFamilia(f); setModal("edit"); }}
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
                            title: "Eliminar Familia",
                            message: `¿Estás seguro de eliminar ${f.name_fam} (${f.codigo_fam})? Esta acción no se puede deshacer.`,
                            onConfirm: async () => {
                              try {
                                await axios.delete(`/api/familia/${f.codigo_fam}`);
                                reload();
                                notif.success(`Familia "${f.name_fam}" eliminada correctamente.`);
                              } catch (err) {
                                notif.error(err.response?.data?.error || "Error al eliminar familia");
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

      {(modal === "create" || modal === "edit") && (
        <FamiliaFormModal
          familia={editingFamilia}
          grupos={grupos}
          onClose={() => setModal(null)}
          onSaved={(isEdit) => {
            setModal(null);
            reload();
            notif.success(
              isEdit
                ? `Familia "${editingFamilia?.name_fam}" actualizada correctamente.`
                : "Familia creada correctamente.",
              isEdit ? "Familia Actualizada" : "Familia Creada"
            );
          }}
        />
      )}

      <NotificationModal {...notif.notification} />
    </div>
  );
}

function FamiliaFormModal({ familia, grupos, onClose, onSaved }) {
  const isEdit = !!familia;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: isEdit
      ? { codigo_fam: familia.codigo_fam, name_fam: familia.name_fam, id_gru: familia.id_gru }
      : { codigo_fam: "", name_fam: "", id_gru: "" },
  });

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await axios.put(`/api/familia/${familia.codigo_fam}`, {
          name_fam: data.name_fam,
          id_gru: Number(data.id_gru),
        });
      } else {
        await axios.post("/api/familia", {
          codigo_fam: data.codigo_fam,
          name_fam: data.name_fam,
          id_gru: Number(data.id_gru),
        });
      }
      onSaved(isEdit);
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 animate-fade-in" />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 space-y-5 animate-scale-in"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {isEdit ? "Editar Familia" : "Nueva Familia"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg btn-hover" style={{ color: "var(--text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Código</label>
            <input
              type="text"
              {...register("codigo_fam", { required: "Obligatorio" })}
              placeholder="Ej: A1"
              disabled={isEdit}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: `1px solid ${errors.codigo_fam ? "#ef4444" : "var(--border)"}`,
                color: "var(--text-primary)",
                opacity: isEdit ? 0.6 : 1,
              }}
            />
            {errors.codigo_fam && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.codigo_fam.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Nombre</label>
            <input
              type="text"
              {...register("name_fam", { required: "Obligatorio" })}
              placeholder="Ej: BUFALOS"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: `1px solid ${errors.name_fam ? "#ef4444" : "var(--border)"}`,
                color: "var(--text-primary)",
              }}
            />
            {errors.name_fam && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.name_fam.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Grupo</label>
            <select
              {...register("id_gru", { required: "Selecciona un grupo" })}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">Seleccionar grupo...</option>
              {grupos.map((g) => (
                <option key={g.id_gru} value={g.id_gru}>{g.name_gru}</option>
              ))}
            </select>
            {errors.id_gru && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.id_gru.message}</p>}
          </div>

          {error && <p className="text-sm text-center animate-fade-in" style={{ color: "#ef4444" }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white btn-hover disabled:opacity-60"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Familia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


