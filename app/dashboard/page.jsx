"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Mars, Venus, Calendar, Droplets } from "lucide-react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

const defaultStats = [
  { icon: Users, label: "Total Animales", value: "Cargando..." },
  { icon: Mars, label: "Machos", value: "Cargando..." },
  { icon: Venus, label: "Hembras", value: "Cargando..." },
  { icon: Calendar, label: "Última Vacunación", value: "Cargando..." },
];

const recentActivities = [
  { action: "Nuevo ternero registrado", time: "Hace 10 min" },
  { action: "Vacunación del lote #4 completada", time: "Hace 45 min" },
  { action: "Venta de 3 bovinos", time: "Hace 2 h" },
  { action: "Mantenimiento de tractor", time: "Hace 4 h" },
  { action: "Control de plagas en cultivo sur", time: "Hace 6 h" },
];

const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const barHeights = [52, 78, 62, 95, 110, 85, 68];

export default function DashboardPage() {
  const [stats, setStats] = useState(defaultStats);
  const [barsVisible, setBarsVisible] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    axios.get("/api/dashboard/stats").then((res) => {
      const { total, machos, hembras } = res.data;
      setStats((prev) =>
        prev.map((s) => {
          if (s.label === "Total Animales") return { ...s, value: total?.toLocaleString() ?? "0" };
          if (s.label === "Machos") return { ...s, value: machos?.toLocaleString() ?? "0" };
          if (s.label === "Hembras") return { ...s, value: hembras?.toLocaleString() ?? "0" };
          return s;
        })
      );
    }).catch(() => {});

    axios.get("/api/configuracion").then((res) => {
      const fecha = res.data.ultima_vacunacion;
      if (fecha) {
        const formatted = new Date(fecha).toLocaleDateString("es-MX", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        setStats((prev) =>
          prev.map((s) =>
            s.label === "Última Vacunación" ? { ...s, value: formatted } : s
          )
        );
      }
    }).catch(() => {});
  }, []);

  const [prodData, setProdData] = useState([]);
  const [prodYear, setProdYear] = useState(new Date().getFullYear());
  const prodYears = [...new Set(prodData.map((d) => new Date(d.fecha_lec).getFullYear()))].sort();

  useEffect(() => {
    axios.get("/api/produccion-leche").then((res) => {
      setProdData(res.data);
    }).catch(() => {});
  }, []);

  const prodByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const total = prodData
      .filter((d) => {
        const date = new Date(d.fecha_lec);
        return date.getFullYear() === prodYear && date.getMonth() === i;
      })
      .reduce((sum, d) => sum + Number(d.litros_lec), 0);
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return { month: months[i], litros: Math.round(total * 100) / 100 };
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setBarsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (chartRef.current) observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl lg:text-3xl font-bold gradient-text">
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Resumen general del sistema ganadero
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="rounded-xl p-5 space-y-2 card-hover cursor-default"
            style={{
              background: "var(--bg-card)",
              border: `1px solid ${
                hoveredStat === i ? "var(--accent-border)" : "var(--border)"
              }`,
              animation: `fadeInUp 0.5s ease ${0.1 + i * 0.1}s forwards`,
              opacity: 0,
            }}
            onMouseEnter={() => setHoveredStat(i)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                style={{
                  background: hoveredStat === i ? "var(--accent)" : "var(--accent-bg)",
                  transform: hoveredStat === i ? "scale(1.1) rotate(-6deg)" : "scale(1)",
                }}
              >
                <stat.icon
                  size={18}
                  style={{
                    color: hoveredStat === i ? "#fff" : "var(--accent)",
                    transition: "color 0.3s ease",
                  }}
                />
              </div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </p>
            </div>
            <div>
              <p
                className="text-2xl font-bold transition-all duration-300"
                style={{
                  color: "var(--text-primary)",
                  transform: hoveredStat === i ? "scale(1.04)" : "scale(1)",
                  transformOrigin: "left",
                }}
              >
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div
          ref={chartRef}
          className="lg:col-span-2 rounded-xl p-5 card-hover"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <h2 className="font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
            Producción Semanal
          </h2>
          <div className="flex items-end justify-between gap-2 h-44 pt-2">
            {days.map((day, i) => {
              const h = barHeights[i];
              return (
                <div
                  key={day}
                  className="flex-1 flex flex-col items-center gap-1.5 group relative"
                >
                  {hoveredBar === i && (
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap z-10 animate-scale-in"
                      style={{ background: "var(--accent)", color: "#fff" }}
                    >
                      {h} L
                    </div>
                  )}
                  <div
                    className="w-full rounded-md transition-all duration-300 cursor-pointer"
                    style={{
                      height: `${h}px`,
                      background:
                        hoveredBar === i
                          ? "var(--accent-light)"
                          : "var(--accent)",
                      opacity: barsVisible ? 0.65 + i * 0.05 : 0,
                      transform: barsVisible ? "scaleY(1)" : "scaleY(0)",
                      transformOrigin: "bottom",
                      transition: `opacity 0.5s ease ${0.1 + i * 0.08}s, transform 0.5s ease ${0.1 + i * 0.08}s, background 0.25s ease`,
                      boxShadow:
                        hoveredBar === i
                          ? `0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent)`
                          : "none",
                    }}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div
          className="rounded-xl p-5 card-hover"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <h2 className="font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
            Actividad Reciente
          </h2>
          <div className="space-y-1">
            {recentActivities.map((act, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2 rounded-lg transition-all duration-200 cursor-default group"
                style={{
                  animation: `fadeInUp 0.4s ease ${0.3 + i * 0.08}s forwards`,
                  opacity: 0,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0 transition-all duration-200 group-hover:scale-150"
                  style={{ background: "var(--accent)" }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm truncate transition-colors duration-200 group-hover:translate-x-0.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {act.action}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {act.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production chart */}
      <div
        className="rounded-xl p-5 card-hover"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-bg)" }}
            >
              <Droplets size={20} style={{ color: "var(--accent)" }} />
            </div>
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Producción de Leche por Mes
            </h2>
          </div>
          <select
            value={prodYear}
            onChange={(e) => setProdYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg text-sm outline-none input-focus"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            {prodYears.length > 0
              ? prodYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))
              : <option value={prodYear}>{prodYear}</option>
            }
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={prodByMonth}>
            <defs>
              <linearGradient id="colorLitros" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} unit=" L" />
            <Tooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-primary)",
              }}
              formatter={(value) => [`${value} L`, "Producción"]}
            />
            <Area type="monotone" dataKey="litros" stroke="var(--accent)" fill="url(#colorLitros)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
