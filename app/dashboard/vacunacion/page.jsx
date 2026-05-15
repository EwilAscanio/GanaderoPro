"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Syringe, Calendar, AlertTriangle, ShieldCheck, Users,
} from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function VacunacionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [totalAnimales, setTotalAnimales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState("");
  const [procesando, setProcesando] = useState(false);
  const notif = useNotification();

  const isAdmin = session?.user?.role === "Administrador";

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [configRes, animalRes] = await Promise.all([
          axios.get("/api/configuracion"),
          axios.get("/api/animal"),
        ]);
        if (!mounted) return;
        setConfig(configRes.data);
        setTotalAnimales(animalRes.data.length);
        setFecha(configRes.data.ultima_vacunacion || "");
      } catch {
        console.error("Error al cargar datos");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleProcesar = async () => {
    if (!fecha) {
      notif.error("Selecciona una fecha de vacunación.", "Fecha Requerida");
      return;
    }

    setProcesando(true);
    try {
      const res = await axios.post("/api/vacunacion", {
        fecha_vacunacion: fecha,
      });

      setConfig((prev) => ({ ...prev, ultima_vacunacion: fecha }));

      notif.show({
        type: "success",
        title: "Vacunación Procesada",
        message:
          `Se actualizó la fecha de vacunación de ${res.data.animales_afectados} animales exitosamente.`,
        onConfirm: () => {
          notif.close();
          router.push("/dashboard");
        },
        showCancel: false,
      });
    } catch (err) {
      notif.error(
        err.response?.data?.error || "Error al procesar vacunación",
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">
          Vacunación
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Proceso masivo de actualización de fecha de vacunación
        </p>
      </div>

      <div
        className="rounded-xl p-6 space-y-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: "var(--accent-bg)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--accent)" }}
            >
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Última Vacunación
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: "var(--accent)" }}
              >
                {config?.ultima_vacunacion
                  ? new Date(config.ultima_vacunacion).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Sin registro"}
              </p>
            </div>
          </div>

          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: "var(--accent-bg)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--accent)" }}
            >
              <Users size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Animales Registrados
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: "var(--accent)" }}
              >
                {totalAnimales}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <Syringe size={16} style={{ color: "var(--accent)" }} />
            Nueva Fecha de Vacunación
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none input-focus"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: "color-mix(in srgb, var(--accent) 8%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          <AlertTriangle
            size={20}
            className="shrink-0 mt-0.5"
            style={{ color: "var(--accent)" }}
          />
          <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--text-primary)" }}>Importante:</strong>{" "}
            Esta acción actualizará la fecha de vacunación de{" "}
            <strong>{totalAnimales} animales</strong> en el sistema. Una vez procesada, no se podrá
            revertir, puede cambiar la fecha individualmente desde la sección de gestión de animales.
          </div>
        </div>

        <button
          onClick={handleProcesar}
          disabled={procesando}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white btn-hover disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: "var(--accent)" }}
        >
          {procesando ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Procesando...
            </>
          ) : (
            <>
              <Syringe size={18} />
              Procesar Vacunación Masiva
            </>
          )}
        </button>
      </div>

      <NotificationModal {...notif.notification} />
    </div>
  );
}
