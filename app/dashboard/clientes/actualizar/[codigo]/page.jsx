"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function ActualizarClientePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const codigo = params.codigo;

  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState(null);
  const notif = useNotification();

  const isAdmin = session?.user?.role === "Administrador";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    values: formData || {
      nombre_cli: "",
      telefono_cli: "",
      direccion_cli: "",
      rif_cli: "",
      email_cli: "",
    },
  });

  useEffect(() => {
    if (!codigo || status !== "authenticated" || !isAdmin) return;
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get(`/api/clientes/${codigo}`);
        if (!mounted) return;
        const c = res.data;
        setFormData({
          nombre_cli: c.nombre_cli,
          telefono_cli: c.telefono_cli,
          direccion_cli: c.direccion_cli,
          rif_cli: c.rif_cli,
          email_cli: c.email_cli,
        });
      } catch (err) {
        if (!mounted) return;
        if (err.response?.status === 404) setNotFound(true);
        else setError("Error al cargar datos del cliente");
      } finally {
        if (mounted) setPageLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [codigo, status, isAdmin]);

  const onSubmit = async (data) => {
    setError("");
    setSubmitLoading(true);
    try {
      await axios.put(`/api/clientes/${codigo}`, data);
      notif.show({
        type: "success",
        title: "Cliente Actualizado",
        message: `El cliente "${codigo}" ha sido actualizado correctamente.`,
        onConfirm: () => router.push("/dashboard/clientes"),
        showCancel: false,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (status === "loading" || pageLoading) {
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
        <p style={{ color: "var(--text-muted)" }}>No tienes permisos para actualizar clientes</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--text-muted)" }}>Cliente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/clientes")}
          className="p-2 rounded-lg btn-hover"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Actualizar Cliente</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Editando: <strong>{codigo}</strong>
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Código</label>
              <input
                type="number"
                value={codigo}
                disabled
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  opacity: 0.6,
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Nombre</label>
              <input
                type="text"
                {...register("nombre_cli", { required: "Obligatorio" })}
                placeholder="Nombre del cliente"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: `1px solid ${errors.nombre_cli ? "#ef4444" : "var(--border)"}`,
                  color: "var(--text-primary)",
                }}
              />
              {errors.nombre_cli && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.nombre_cli.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Teléfono</label>
              <input
                type="text"
                {...register("telefono_cli", { required: "Obligatorio" })}
                placeholder="Ej: 0412-1234567"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: `1px solid ${errors.telefono_cli ? "#ef4444" : "var(--border)"}`,
                  color: "var(--text-primary)",
                }}
              />
              {errors.telefono_cli && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.telefono_cli.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>RIF</label>
              <input
                type="text"
                {...register("rif_cli", { required: "Obligatorio" })}
                placeholder="Ej: J-12345678-9"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: `1px solid ${errors.rif_cli ? "#ef4444" : "var(--border)"}`,
                  color: "var(--text-primary)",
                }}
              />
              {errors.rif_cli && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.rif_cli.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Dirección</label>
            <input
              type="text"
              {...register("direccion_cli", { required: "Obligatorio" })}
              placeholder="Dirección del cliente"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: `1px solid ${errors.direccion_cli ? "#ef4444" : "var(--border)"}`,
                color: "var(--text-primary)",
              }}
            />
            {errors.direccion_cli && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.direccion_cli.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Correo Electrónico</label>
            <input
              type="email"
              {...register("email_cli", {
                required: "Obligatorio",
                pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" },
              })}
              placeholder="cliente@ejemplo.com"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: `1px solid ${errors.email_cli ? "#ef4444" : "var(--border)"}`,
                color: "var(--text-primary)",
              }}
            />
            {errors.email_cli && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.email_cli.message}</p>}
          </div>

          {error && <p className="text-sm animate-fade-in" style={{ color: "#ef4444" }}>{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/clientes")}
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
              disabled={submitLoading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white btn-hover disabled:opacity-60"
              style={{ background: "var(--accent)" }}
            >
              {submitLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>

      <NotificationModal {...notif.notification} />
    </div>
  );
}
