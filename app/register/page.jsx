"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useTheme } from "@/contexts/ThemeContext";
import { UserPlus, Eye, EyeOff, Sun, Moon, Smartphone, Mail, Lock, User } from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { darkMode, toggleDark } = useTheme();
  const router = useRouter();
  const notif = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/register", {
        name: data.name,
        login: data.login,
        email: data.email,
        password: data.password,
      });

      if (res.data.success) {
        const result = await signIn("credentials", {
          login: data.login,
          password: data.password,
          redirect: false,
        });

        notif.show({
          type: "success",
          title: "Usuario Creado",
          message: "Tu cuenta ha sido creada exitosamente.",
          onConfirm: () => {
            if (result?.error) {
              router.push("/login");
            } else {
              router.push("/dashboard");
            }
          },
          showCancel: false,
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 animate-spin-slow"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full opacity-10 animate-spin-slow"
        style={{ background: "var(--accent-light)", animationDirection: "reverse" }}
      />

      <button
        onClick={toggleDark}
        className="fixed top-4 right-4 p-2.5 rounded-full z-50 btn-hover"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          boxShadow: "0 2px 8px rgba(0,0,0,.06)",
        }}
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="flex flex-col lg:flex-row items-stretch w-full max-w-4xl gap-0 animate-scale-in"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          boxShadow: "0 8px 32px rgba(0,0,0,.08)",
          overflow: "hidden",
        }}
      >
        {/* Image left */}
        <div className="hidden lg:block relative w-1/2 overflow-hidden group">
          <Image
            src="/IniciodeSesion.webp"
            alt="Ganadería"
            fill
            sizes="50vw"
            priority
            className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
            }}
          />
          <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
            style={{
              background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)",
            }}
          />
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              Sistema Ganadero
            </h2>
            <p className="text-sm text-white/80 mt-1 drop-shadow">
              Gestión inteligente para tu producción
            </p>
          </div>
        </div>

        {/* Form right */}
        <div className="w-full lg:w-1/2 p-8 space-y-6">
          <div className="text-center space-y-3">
            <div
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center animate-float"
              style={{ background: "var(--accent-bg)" }}
            >
              <UserPlus size={30} style={{ color: "var(--accent)" }} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold gradient-text">Crear Cuenta</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Regístrate para acceder al sistema
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Nombre completo
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="name"
                  type="text"
                  {...register("name", { required: "El nombre es obligatorio" })}
                  placeholder="Juan Pérez"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                  style={{
                    background: "var(--bg-secondary)",
                    border: `1px solid ${errors.name ? "#ef4444" : "var(--border)"}`,
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              {errors.name && (
                <p className="text-xs" style={{ color: "#ef4444" }}>{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login"
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Usuario
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="login"
                  type="text"
                  {...register("login", { required: "El usuario es obligatorio" })}
                  placeholder="tu_usuario"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                  style={{
                    background: "var(--bg-secondary)",
                    border: `1px solid ${errors.login ? "#ef4444" : "var(--border)"}`,
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              {errors.login && (
                <p className="text-xs" style={{ color: "#ef4444" }}>{errors.login.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "El correo es obligatorio",
                    pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" },
                  })}
                  placeholder="usuario@ejemplo.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                  style={{
                    background: "var(--bg-secondary)",
                    border: `1px solid ${errors.email ? "#ef4444" : "var(--border)"}`,
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              {errors.email && (
                <p className="text-xs" style={{ color: "#ef4444" }}>{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                  })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none input-focus"
                  style={{
                    background: "var(--bg-secondary)",
                    border: `1px solid ${errors.password ? "#ef4444" : "var(--border)"}`,
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs" style={{ color: "#ef4444" }}>{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Confirma tu contraseña",
                    validate: (value, formValues) => value === formValues.password || "Las contraseñas no coinciden",
                  })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none input-focus"
                  style={{
                    background: "var(--bg-secondary)",
                    border: `1px solid ${errors.confirmPassword ? "#ef4444" : "var(--border)"}`,
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs" style={{ color: "#ef4444" }}>{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-center animate-fade-in" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white btn-hover disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "var(--accent)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Registrando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus size={18} />
                  Registrarse
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      <NotificationModal {...notif.notification} />
    </div>
  );
}
