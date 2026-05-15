"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Tractor, Droplets, Settings,
  Syringe, Scale, ShoppingCart, UserCircle, Briefcase, FileText,
  ChevronRight, X, Layers, GitFork, Heart, Baby,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Animales", href: "/dashboard/animales" },
  { icon: Layers, label: "Grupos", href: "/dashboard/grupo" },
  { icon: GitFork, label: "Familias", href: "/dashboard/familia" },
  { icon: Syringe, label: "Vacunacion", href: "/dashboard/vacunacion" },
  { icon: Heart, label: "Palpacion", href: "/dashboard/palpacion" },
  { icon: Baby, label: "Parto/Nacimiento", href: "/dashboard/nacimiento" },
  { icon: Scale, label: "Peso", href: "/dashboard/peso" },
  { icon: Droplets, label: "Prod. Leche", href: "/dashboard/produccion-leche" },
  { icon: ShoppingCart, label: "Ventas", href: "/dashboard/ventas" },
  { icon: UserCircle, label: "Usuarios", href: "/dashboard/usuarios" },
  { icon: Briefcase, label: "Clientes", href: "/dashboard/clientes" },
  { icon: FileText, label: "Reportes", href: "/dashboard/reportes" },
  { icon: Settings, label: "Configuracion", href: "/dashboard/configuracion" },
];

export default function Sidebar({ open, onClose }) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href) => pathname === href;

  const handleNavigate = (href) => {
    router.push(href);
    if (onClose) onClose();
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 w-52 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
        boxShadow: open ? "4px 0 24px rgba(0,0,0,.1)" : "none",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 h-16 border-b shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:rotate-12"
          style={{ background: "var(--accent)" }}
        >
          <Tractor size={20} className="text-white" />
        </div>
        <span className="font-semibold text-lg gradient-text">
          Ganadero
        </span>
        <button
          onClick={onClose}
          className="lg:hidden ml-auto btn-hover p-1 rounded-md"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, i) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.label}
              onClick={() => handleNavigate(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium sidebar-item ${
                active ? "sidebar-item-active" : ""
              }`}
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#fff" : "var(--text-secondary)",
                animation: `fadeInUp 0.4s ease ${i * 0.04}s forwards`,
                opacity: 0,
              }}
            >
              <item.icon size={18} />
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight size={14} />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
