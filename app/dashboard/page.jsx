"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Mars, Venus, Calendar, Droplets, Layers } from "lucide-react";
import axios from "axios";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar,
} from "recharts";

const defaultStats = [
  { icon: Users, label: "Total Animales", value: "Cargando..." },
  { icon: Mars, label: "Machos", value: "Cargando..." },
  { icon: Venus, label: "Hembras", value: "Cargando..." },
  { icon: Calendar, label: "Última Vacunación", value: "Cargando..." },
];

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#ca8a04", "#16a34a", "#0891b2", "#4f46e5", "#be185d", "#65a30d"];

export default function DashboardPage() {
  const [stats, setStats] = useState(defaultStats);
  const [familias, setFamilias] = useState([]);
  const [hoveredStat, setHoveredStat] = useState(null);

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

    axios.get("/api/reportes/familias").then((res) => {
      setFamilias(res.data);
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

      {/* Animales por Familia */}
      <div
        className="rounded-xl p-5 card-hover"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent-bg)" }}
          >
            <Layers size={20} style={{ color: "var(--accent)" }} />
          </div>
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Animales por Familia
          </h2>
        </div>
        {familias.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={familias} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name_fam"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border)" }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                }}
                formatter={(value, name) => [value, "Animales"]}
                labelFormatter={(label) => `Familia: ${label}`}
              />
              <Bar dataKey="total" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center py-10">
            <div
              className="w-6 h-6 rounded-full animate-spin"
              style={{ border: "2px solid var(--border)", borderTopColor: "var(--accent)" }}
            />
          </div>
        )}
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
