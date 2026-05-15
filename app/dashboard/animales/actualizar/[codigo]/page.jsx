"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function ActualizarAnimalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const codigo = params.codigo;

  const [grupos, setGrupos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState(null);
  const notif = useNotification();

  const isAdmin = session?.user?.role === "Administrador";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    values: formData || {
      nombre_ani: "",
      chip_ani: "",
      id_gru: "",
      codigo_fam: "",
      sexo_ani: "",
      fechapalpacion_ani: "",
      tiempogestacion_ani: 0,
      peso_ani: 0,
      arete_ani: "",
      fechanacimiento_ani: "",
      fechavacunacion_ani: "",
      status_ani: "",
      precio_ani: 0,
    },
  });

  const sexoSeleccionado = watch("sexo_ani");
  const esMacho = sexoSeleccionado === "Macho";

  useEffect(() => {
    if (!codigo || status !== "authenticated" || !isAdmin) return;
    let mounted = true;
    const load = async () => {
      try {
        const [aniRes, gruRes, famRes] = await Promise.all([
          axios.get(`/api/animal/${codigo}`),
          axios.get("/api/grupo"),
          axios.get("/api/familia"),
        ]);

        if (!mounted) return;
        const a = aniRes.data;
        setGrupos(gruRes.data);
        setFamilias(famRes.data);
        setSelectedGrupo(a.id_gru);

        const fmt = (d) => (d ? (d.includes("T") ? d.split("T")[0] : d) : "");
        setFormData({
          nombre_ani: a.nombre_ani,
          chip_ani: a.chip_ani,
          id_gru: a.id_gru,
          codigo_fam: a.codigo_fam,
          sexo_ani: a.sexo_ani,
          fechapalpacion_ani: fmt(a.fechapalpacion_ani),
          tiempogestacion_ani: a.tiempogestacion_ani,
          peso_ani: a.peso_ani,
          arete_ani: a.arete_ani,
          fechanacimiento_ani: fmt(a.fechanacimiento_ani),
          fechavacunacion_ani: fmt(a.fechavacunacion_ani),
          status_ani: a.status_ani || "",
          precio_ani: a.precio_ani,
        });
      } catch (err) {
        if (!mounted) return;
        if (err.response?.status === 404) setNotFound(true);
        else setError("Error al cargar datos del animal");
      } finally {
        if (mounted) setPageLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [codigo, status, isAdmin]);

  const filteredFamilias = familias.filter(
    (f) => String(f.id_gru) === String(selectedGrupo)
  );

  const onSubmit = async (data) => {
    setError("");
    setSubmitLoading(true);
    try {
      await axios.put(`/api/animal/${codigo}`, {
        ...data,
        id_gru: Number(data.id_gru),
        chip_ani: Number(data.chip_ani),
        peso_ani: Number(data.peso_ani),
        precio_ani: Number(data.precio_ani),
        existencia: 1,
        fechapalpacion_ani: esMacho ? "1900-01-01" : (data.fechapalpacion_ani || null),
        tiempogestacion_ani: esMacho ? 0 : Number(data.tiempogestacion_ani),
        fechanacimiento_ani: data.fechanacimiento_ani || null,
        fechavacunacion_ani: data.fechavacunacion_ani || null,
      });
      notif.show({
        type: "success",
        title: "Animal Actualizado",
        message: `El animal "${codigo}" ha sido actualizado correctamente.`,
        onConfirm: () => router.push("/dashboard/animales"),
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
        <p style={{ color: "var(--text-muted)" }}>No tienes permisos para actualizar animales</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--text-muted)" }}>Animal no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/animales")}
          className="p-2 rounded-lg btn-hover"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Actualizar Animal</h1>
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
                type="text"
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
                {...register("nombre_ani", { required: "Obligatorio" })}
                placeholder="Nombre del animal"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: `1px solid ${errors.nombre_ani ? "#ef4444" : "var(--border)"}`,
                  color: "var(--text-primary)",
                }}
              />
              {errors.nombre_ani && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.nombre_ani.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Chip</label>
              <input
                type="number"
                {...register("chip_ani", { required: "Obligatorio" })}
                placeholder="Número de chip"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: `1px solid ${errors.chip_ani ? "#ef4444" : "var(--border)"}`,
                  color: "var(--text-primary)",
                }}
              />
              {errors.chip_ani && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.chip_ani.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Arete</label>
              <input
                type="text"
                {...register("arete_ani", { required: "Obligatorio" })}
                placeholder="Número de arete"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: `1px solid ${errors.arete_ani ? "#ef4444" : "var(--border)"}`,
                  color: "var(--text-primary)",
                }}
              />
              {errors.arete_ani && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.arete_ani.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Grupo</label>
              <select
                {...register("id_gru", { required: "Selecciona un grupo" })}
                onChange={(e) => {
                  setSelectedGrupo(e.target.value);
                  setValue("codigo_fam", "");
                }}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Seleccionar...</option>
                {grupos.map((g) => (
                  <option key={g.id_gru} value={g.id_gru}>{g.name_gru}</option>
                ))}
              </select>
              {errors.id_gru && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.id_gru.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Familia</label>
              <select
                {...register("codigo_fam", { required: "Selecciona una familia" })}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Seleccionar...</option>
                {filteredFamilias.map((f) => (
                  <option key={f.codigo_fam} value={f.codigo_fam}>
                    {f.codigo_fam} - {f.name_fam}
                  </option>
                ))}
              </select>
              {errors.codigo_fam && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.codigo_fam.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Sexo</label>
              <select
                {...register("sexo_ani", { required: "Selecciona el sexo" })}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
              {errors.sexo_ani && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.sexo_ani.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Status</label>
              <select
                {...register("status_ani")}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="Activo">Activo</option>
                <option value="Vendido">Vendido</option>
                <option value="Fallecido">Fallecido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Peso (kg)</label>
              <input
                type="number"
                {...register("peso_ani")}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Precio ($)</label>
              <input
                type="number"
                step="0.01"
                {...register("precio_ani")}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Fecha Nacimiento</label>
              <input
                type="date"
                {...register("fechanacimiento_ani")}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Fecha Vacunación</label>
              <input
                type="date"
                {...register("fechavacunacion_ani")}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Fecha Palpación</label>
              <input
                type="date"
                disabled={esMacho}
                {...register("fechapalpacion_ani")}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  opacity: esMacho ? 0.4 : 1,
                  cursor: esMacho ? "not-allowed" : "auto",
                }}
              />
              {esMacho && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Solo aplica para hembras</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Gestación (días)</label>
              <input
                type="number"
                disabled={esMacho}
                {...register("tiempogestacion_ani")}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  opacity: esMacho ? 0.4 : 1,
                  cursor: esMacho ? "not-allowed" : "auto",
                }}
              />
              {esMacho && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Solo aplica para hembras</p>
              )}
            </div>
          </div>

          {error && <p className="text-sm animate-fade-in" style={{ color: "#ef4444" }}>{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/animales")}
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
