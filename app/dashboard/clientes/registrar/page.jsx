"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { ArrowLeft, Briefcase } from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function RegistrarClientePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextCode, setNextCode] = useState(1);
  const notif = useNotification();

  const isAdmin = session?.user?.role === "Administrador";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre_cli: "",
      telefono_cli: "",
      direccion_cli: "",
      rif_cli: "",
      email_cli: "",
    },
  });

  useEffect(() => {
    axios.get("/api/configuracion").then((res) => {
      const ultimo = res.data.codigo_cli || 0;
      setNextCode(Number(ultimo) + 1);
    }).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/clientes", data);
      notif.show({
        type: "success",
        title: "Cliente Registrado",
        message: `El cliente "${data.nombre_cli}" ha sido registrado correctamente.`,
        onConfirm: () => router.push("/dashboard/clientes"),
        showCancel: false,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--text-muted)" }}>No tienes permisos para registrar clientes</p>
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
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Registrar Cliente</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Ingresa los datos del nuevo cliente
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
                value={nextCode}
                disabled
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  opacity: 0.6,
                }}
              />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Código asignado automáticamente</p>
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
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white btn-hover disabled:opacity-60"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Guardando..." : "Registrar Cliente"}
            </button>
          </div>
        </form>
      </div>

      <NotificationModal {...notif.notification} />
    </div>
  );
}
