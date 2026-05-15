"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Trash2,
  LogOut,
  X,
  Loader2,
} from "lucide-react";

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    defaultTitle: "Operación Exitosa",
    defaultMessage: "La operación se completó correctamente.",
  },
  error: {
    icon: XCircle,
    defaultTitle: "Error",
    defaultMessage: "Ocurrió un error al procesar la solicitud.",
  },
  warning: {
    icon: AlertTriangle,
    defaultTitle: "Advertencia",
    defaultMessage: "Tenga cuidado con esta acción.",
  },
  info: {
    icon: Info,
    defaultTitle: "Información",
    defaultMessage: "",
  },
  confirm: {
    icon: AlertTriangle,
    defaultTitle: "¿Estás seguro?",
    defaultMessage: "Esta acción no se puede deshacer.",
  },
  delete: {
    icon: Trash2,
    defaultTitle: "Eliminar Registro",
    defaultMessage:
      "¿Estás seguro de eliminar este registro? Esta acción es irreversible.",
  },
  logout: {
    icon: LogOut,
    defaultTitle: "Cerrar Sesión",
    defaultMessage:
      "¿Desea salir del sistema? Su sesión se cerrará y será redirigido al inicio.",
  },
};

export default function NotificationModal({
  isOpen,
  onClose,
  type = "info",
  title,
  message,
  icon: CustomIcon,
  confirmText,
  cancelText = "Cancelar",
  onConfirm,
  showCancel = true,
  loading = false,
  children,
}) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const IconComp = CustomIcon || config.icon;
  const finalTitle = title ?? config.defaultTitle;
  const finalMessage = message ?? config.defaultMessage;

  const resolveConfirmText = () => {
    if (confirmText) return confirmText;
    if (type === "delete") return "Eliminar";
    if (type === "logout") return "Cerrar Sesión";
    if (type === "confirm") return "Confirmar";
    return "Aceptar";
  };

  const hasConfirm = !!onConfirm;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in" />

      <div
        className="relative w-full max-w-sm rounded-2xl p-6 space-y-4 animate-scale-in shadow-2xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg btn-hover"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-3 pt-2">
          <div
            className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "var(--accent-bg)" }}
          >
            <IconComp size={28} style={{ color: "var(--accent)" }} />
          </div>

          <div className="space-y-1">
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {finalTitle}
            </h2>
            {finalMessage && (
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {finalMessage}
              </p>
            )}
          </div>
        </div>

        {children}

        {hasConfirm ? (
          <div className="flex gap-3 pt-1">
            {showCancel && (
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium btn-hover disabled:opacity-50"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white btn-hover disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "var(--accent)" }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Procesando..." : resolveConfirmText()}
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white btn-hover"
            style={{ background: "var(--accent)" }}
          >
            {resolveConfirmText()}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
