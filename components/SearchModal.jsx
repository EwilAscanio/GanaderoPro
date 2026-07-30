"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import axios from "axios";
import { Search, X, Loader2, ArrowRight } from "lucide-react";

export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setLoading(true);
      axios.get("/api/animal")
        .then((r) => setAnimales(r.data))
        .catch(console.error)
        .finally(() => setLoading(false));
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  const handleSelect = (codigo) => {
    onClose();
    router.push(`/dashboard/animales/actualizar/${codigo}`);
  };

  const filtered = search.trim()
    ? animales.filter(
        (a) =>
          a.codigo_ani?.toLowerCase().includes(search.toLowerCase()) ||
          a.nombre_ani?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in" />

      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <Search size={18} style={{ color: "var(--text-muted)" }} />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="p-1 rounded-lg btn-hover"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg btn-hover"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
            </div>
          ) : search.trim() && filtered.length === 0 ? (
            <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
              No se encontraron animales con &ldquo;{search}&rdquo;
            </p>
          ) : !search.trim() ? (
            <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
              Escribe para comenzar a buscar
            </p>
          ) : (
            filtered.map((a, i) => (
              <button
                key={a.codigo_ani}
                onClick={() => handleSelect(a.codigo_ani)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors btn-hover"
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                  animation: `fadeInUp 0.2s ease ${i * 0.03}s forwards`,
                  opacity: 0,
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: "var(--accent)" }}
                >
                  {a.nombre_ani?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {a.nombre_ani}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {a.codigo_ani} · {a.name_gru}
                  </p>
                </div>
                <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
              </button>
            ))
          )}
        </div>

        <div
          className="px-4 py-2.5 border-t text-center text-xs"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          Presiona <kbd className="px-1 py-0.5 rounded font-mono" style={{ background: "var(--bg-secondary)" }}>ESC</kbd> para cerrar
        </div>
      </div>
    </div>,
    document.body
  );
}
