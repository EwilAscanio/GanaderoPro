"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, LogOut, Bell, Search, Menu, User } from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import SearchModal from "@/components/SearchModal";
import { useNotification } from "@/hooks/useNotification";

export default function Topbar({ onMenuClick }) {
  const { darkMode, toggleDark } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const notif = useNotification();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    notif.show({
      type: "logout",
      title: "Cerrar sesión",
      message: "¿Estás seguro que deseas cerrar sesión?",
      onConfirm: async () => {
        notif.close();
        await signOut({ redirect: false });
        router.push("/login");
      },
    });
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-8 border-b shrink-0"
      style={{
        background: "var(--bg-primary)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg btn-hover"
          style={{ color: "var(--text-primary)" }}
        >
          <Menu size={22} />
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 btn-hover w-96" 
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-muted)",
          }}
        >
          <Search size={16} />
          <span>Buscar...</span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* User info */}
        {session?.user && (
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: "var(--bg-secondary)" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "var(--accent)" }}
            >
              {session.user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="text-xs leading-tight">
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {session.user.name}
              </p>
              <p className="font-medium" style={{ color: "var(--accent)" }}>
                {session.user.role}
              </p>
            </div>
          </div>
        )}

        <button
          className="relative p-2 rounded-lg btn-hover hidden sm:block"
          style={{ color: "var(--text-muted)" }}
        >
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse-glow"
            style={{ background: "var(--accent)" }}
          />
        </button>
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg btn-hover"
          style={{ color: "var(--text-muted)" }}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium btn-hover"
          style={{
            background: "var(--accent-bg)",
            color: "var(--accent)",
          }}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationModal {...notif.notification} />
    </header>
  );
}
