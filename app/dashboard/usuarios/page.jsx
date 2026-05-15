"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  Plus, Pencil, Trash2, X, Search, Shield,
} from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function UsuariosPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const notif = useNotification();

  const isAdmin = session?.user?.role === "Administrador";
  const currentUserId = String(session?.user?.id);

  const reloadUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      setUsers(res.data);
    } catch {
      console.error("Error al recargar usuarios");
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          axios.get("/api/users"),
          axios.get("/api/roles"),
        ]);
        if (mounted) {
          setUsers(usersRes.data);
          setRoles(rolesRes.data);
        }
      } catch {
        console.error("Error al cargar datos");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name_usr?.toLowerCase().includes(search.toLowerCase()) ||
      u.login_usr?.toLowerCase().includes(search.toLowerCase()) ||
      u.email_usr?.toLowerCase().includes(search.toLowerCase())
  );

  const canModify = (userId) => isAdmin || String(userId) === currentUserId;
  const canDelete = (userId) => isAdmin && String(userId) !== currentUserId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Usuarios</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Gestión de usuarios del sistema
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditingUser(null); setModal("create"); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-hover"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={18} />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl animate-fade-in"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <Search size={18} style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {/* Users table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p style={{ color: "var(--text-muted)" }}>No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ background: "var(--bg-card)" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)" }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Usuario</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>Nombre</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: "var(--text-muted)" }}>Email</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Rol</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr
                  key={user.id_usr}
                  className="border-t transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    animation: `fadeInUp 0.3s ease ${i * 0.04}s forwards`,
                    opacity: 0,
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "var(--accent)" }}
                      >
                        {user.name_usr?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                        {user.login_usr}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                    {user.name_usr}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                    {user.email_usr}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: user.name_rol === "Administrador" ? "var(--accent-bg)" : "#f0fdf4",
                        color: user.name_rol === "Administrador" ? "var(--accent)" : "#16a34a",
                      }}
                    >
                      <Shield size={12} />
                      {user.name_rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canModify(user.id_usr) && (
                        <button
                          onClick={() => { setEditingUser(user); setModal("edit"); }}
                          className="p-2 rounded-lg btn-hover"
                          style={{ color: "var(--accent)" }}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {canDelete(user.id_usr) && (
                        <button
                          onClick={() =>
                            notif.show({
                              type: "delete",
                              title: "Eliminar Usuario",
                              message: `¿Estás seguro de eliminar a ${user.name_usr}? Esta acción no se puede deshacer.`,
                              onConfirm: async () => {
                                try {
                                  await axios.delete(`/api/users/${user.id_usr}`);
                                  reloadUsers();
                                  notif.success(`Usuario "${user.name_usr}" eliminado correctamente.`);
                                } catch (err) {
                                  notif.error(err.response?.data?.error || "Error al eliminar usuario");
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
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <UserFormModal
          user={editingUser}
          roles={roles}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onClose={() => setModal(null)}
          onSaved={(isEdit) => {
            setModal(null);
            reloadUsers();
            notif.success(
              isEdit
                ? `Usuario "${editingUser?.name_usr}" actualizado correctamente.`
                : "Usuario creado correctamente.",
              isEdit ? "Usuario Actualizado" : "Usuario Creado"
            );
          }}
        />
      )}

      <NotificationModal {...notif.notification} />
    </div>
  );
}

function UserFormModal({ user, roles, isAdmin, currentUserId, onClose, onSaved }) {
  const isEdit = !!user;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: isEdit ? {
      name: user.name_usr,
      login: user.login_usr,
      email: user.email_usr,
      password: "",
      id_rol: user.id_rol,
    } : {
      name: "",
      login: "",
      email: "",
      password: "",
      id_rol: 1,
    },
  });

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    try {
      if (isEdit) {
        const payload = {
          name: data.name,
          login: data.login,
          email: data.email,
        };
        if (data.password) payload.password = data.password;
        if (isAdmin && data.id_rol) payload.id_rol = Number(data.id_rol);

        await axios.put(`/api/users/${user.id_usr}`, payload);
      } else {
        await axios.post("/api/users", data);
      }
      onSaved(isEdit);
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const canChangeRole = isAdmin;

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
            {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg btn-hover" style={{ color: "var(--text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Nombre</label>
            <input
              type="text"
              {...register("name", { required: "Obligatorio" })}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: `1px solid ${errors.name ? "#ef4444" : "var(--border)"}`,
                color: "var(--text-primary)",
              }}
            />
            {errors.name && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Usuario</label>
            <input
              type="text"
              {...register("login", { required: "Obligatorio" })}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: `1px solid ${errors.login ? "#ef4444" : "var(--border)"}`,
                color: "var(--text-primary)",
              }}
            />
            {errors.login && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.login.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email</label>
            <input
              type="email"
              {...register("email", { required: "Obligatorio" })}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: `1px solid ${errors.email ? "#ef4444" : "var(--border)"}`,
                color: "var(--text-primary)",
              }}
            />
            {errors.email && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Contraseña {isEdit && <span className="text-xs" style={{ color: "var(--text-muted)" }}>(dejar vacío para mantener)</span>}
            </label>
            <input
              type="password"
              {...register("password", isEdit ? {} : { required: "Obligatorio", minLength: { value: 6, message: "Mínimo 6 caracteres" } })}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: `1px solid ${errors.password ? "#ef4444" : "var(--border)"}`,
                color: "var(--text-primary)",
              }}
            />
            {errors.password && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.password.message}</p>}
          </div>

          {canChangeRole && (
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Rol</label>
              <select
                {...register("id_rol", { required: true })}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                {roles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>{r.name_rol}</option>
                ))}
              </select>
            </div>
          )}

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
              {loading ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


