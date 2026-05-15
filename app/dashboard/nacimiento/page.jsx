"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Search, AlertCircle, Baby, ArrowRight, Check } from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

const STORAGE_KEY = "nacimiento_pendiente";

function NacimientoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [codigo, setCodigo] = useState("");
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [cantidadHijos, setCantidadHijos] = useState(1);
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedBirth, setSavedBirth] = useState(null);
  const notif = useNotification();

  useEffect(() => {
    const nacimientoId = searchParams.get("nacimiento_id");
    const registrada = searchParams.get("registrada");

    if (nacimientoId && registrada) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (String(data.id_nac) === nacimientoId) {
          data.registradas = [...new Set([...data.registradas, Number(registrada)])];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setAnimal({ codigo_ani: data.codigo_ani, nombre_ani: data.nombre_ani });
          setFechaNac(data.fecha_nac || "");
          setSavedBirth(data);
        }
      }
      router.replace("/dashboard/nacimiento");
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.registradas.length < data.cantidadHijos) {
        setAnimal({ codigo_ani: data.codigo_ani, nombre_ani: data.nombre_ani });
        setFechaNac(data.fecha_nac || "");
        setSavedBirth(data);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const buscarAnimal = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    setSearchError("");
    setAnimal(null);
    setFechaNac("");
    setCantidadHijos(1);
    setObservaciones("");
    setSavedBirth(null);

    try {
      const res = await axios.get(`/api/animal/${codigo.trim()}`);
      const a = res.data;

      if (a.sexo_ani === "Macho") {
        setSearchError("El animal es Macho. Solo se permiten animales Hembra.");
        setLoading(false);
        return;
      }

      setAnimal(a);
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchError("Animal no encontrado. Verifica el código.");
      } else {
        setSearchError("Error al buscar el animal.");
      }
    } finally {
      setLoading(false);
    }
  };

  const guardar = async () => {
    if (!animal) return;
    setSaving(true);

    try {
      const res = await axios.post("/api/nacimiento", {
        codigo_ani: animal.codigo_ani,
        fecha_nac: fechaNac,
        cantidadHijos_nac: Number(cantidadHijos),
        observaciones_nac: observaciones || null,
      });

      const data = {
        id_nac: res.data.id_nac,
        cantidadHijos: Number(cantidadHijos),
        codigo_ani: animal.codigo_ani,
        nombre_ani: animal.nombre_ani,
        fecha_nac: fechaNac,
        registradas: [],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSavedBirth(data);

      notif.show({
        type: "success",
        title: "Parto Registrado",
        message: `Parto registrado para ${animal.nombre_ani} (${animal.codigo_ani}) con ${cantidadHijos} cría(s).`,
        onConfirm: () => notif.close(),
        showCancel: false,
      });
    } catch (err) {
      notif.error(err.response?.data?.error || "Error al registrar el parto.");
    } finally {
      setSaving(false);
    }
  };

  const todasRegistradas = savedBirth && savedBirth.registradas?.length >= savedBirth.cantidadHijos;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent-bg)" }}
        >
          <Baby size={22} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Parto / Nacimiento</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Registro de parto para animales hembra
          </p>
        </div>
      </div>

      {!savedBirth && (
        <>
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
              Buscar Animal por Código
            </label>
            <div className="flex gap-2">
              <div
                className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
              >
                <Search size={18} style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === "Enter") buscarAnimal(); }}
                  placeholder="Ej: V001"
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
              <button
                onClick={buscarAnimal}
                disabled={loading || !codigo.trim()}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white btn-hover disabled:opacity-60"
                style={{ background: "var(--accent)" }}
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {searchError && (
              <div
                className="flex items-center gap-2 mt-3 p-3 rounded-lg text-sm animate-fade-in"
                style={{
                  background: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                }}
              >
                <AlertCircle size={16} />
                {searchError}
              </div>
            )}
          </div>

          {animal && (
            <div
              className="rounded-xl p-5 space-y-5 animate-fade-in"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: "var(--bg-secondary)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: "var(--accent)" }}
                >
                  {animal.nombre_ani?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {animal.nombre_ani}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {animal.codigo_ani} — {animal.name_gru} — Arete: {animal.arete_ani}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Fecha de Parto
                </label>
                <input
                  type="date"
                  value={fechaNac}
                  onChange={(e) => setFechaNac(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Cantidad de Crías
                </label>
                <input
                  type="number"
                  min={1}
                  value={cantidadHijos}
                  onChange={(e) => setCantidadHijos(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Parto sin complicaciones"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus resize-none"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setAnimal(null);
                    setCodigo("");
                    setFechaNac("");
                    setCantidadHijos(1);
                    setObservaciones("");
                  }}
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
                  onClick={guardar}
                  disabled={saving || !fechaNac}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white btn-hover disabled:opacity-60"
                  style={{ background: "var(--accent)" }}
                >
                  {saving ? "Guardando..." : "Guardar Parto"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {savedBirth && (
        <div
          className="rounded-xl p-5 space-y-4 animate-fade-in"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-bg)" }}
            >
              <Baby size={20} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Parto registrado correctamente
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {savedBirth.nombre_ani} — {savedBirth.cantidadHijos} cría(s)
              </p>
            </div>
          </div>

          {todasRegistradas ? (
            <div
              className="flex items-center gap-2 p-3 rounded-lg text-sm"
              style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
            >
              <Check size={18} />
              Todas las crías han sido registradas.
            </div>
          ) : (
            <>
              <div
                className="p-3 rounded-lg text-sm"
                style={{ background: "var(--bg-secondary)" }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  Progreso:{" "}
                </span>
                <strong style={{ color: "var(--text-primary)" }}>
                  {savedBirth.registradas?.length || 0}/{savedBirth.cantidadHijos}
                </strong>
                <span style={{ color: "var(--text-secondary)" }}>
                  {" "}crías registradas
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {Array.from({ length: savedBirth.cantidadHijos }, (_, i) => {
                  const num = i + 1;
                  const registrada = savedBirth.registradas?.includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() =>
                        router.push(
                          `/dashboard/animales/registrar?madre=${savedBirth.codigo_ani}&cría=${num}&nacimiento_id=${savedBirth.id_nac}`
                        )
                      }
                      disabled={registrada}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: registrada ? "var(--bg-secondary)" : "var(--accent)",
                        color: registrada ? "var(--text-muted)" : "#fff",
                        border: registrada ? "1px solid var(--border)" : "none",
                      }}
                    >
                      {registrada ? (
                        <Check size={16} />
                      ) : (
                        <ArrowRight size={16} />
                      )}
                      Cría #{num} {registrada ? "registrada" : ""}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {todasRegistradas && (
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setSavedBirth(null);
                setAnimal(null);
                setCodigo("");
                setFechaNac("");
                setCantidadHijos(1);
                setObservaciones("");
              }}
              className="w-full py-2.5 rounded-lg text-sm font-medium btn-hover"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Registrar otro parto
            </button>
          )}

          {!todasRegistradas && (
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setSavedBirth(null);
                setAnimal(null);
                setCodigo("");
                setFechaNac("");
                setCantidadHijos(1);
                setObservaciones("");
              }}
              className="w-full py-2.5 rounded-lg text-sm font-medium btn-hover"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Omitir y registrar otro parto
            </button>
          )}
        </div>
      )}

      <NotificationModal {...notif.notification} />
    </div>
  );
}

export default function NacimientoPage() {
  return (
    <Suspense fallback={<div className="text-center py-20" style={{ color: "var(--text-muted)" }}>Cargando...</div>}>
      <NacimientoContent />
    </Suspense>
  );
}
