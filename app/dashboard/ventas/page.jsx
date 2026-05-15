"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  ShoppingCart, Search, Plus, Trash2, User, FileText, Printer, Save,
} from "lucide-react";
import NotificationModal from "@/components/NotificationModal";
import { useNotification } from "@/hooks/useNotification";

export default function VentasPage() {
  const { data: session } = useSession();
  const [config, setConfig] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState("");
  const [searchCliente, setSearchCliente] = useState("");
  const [showClientes, setShowClientes] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [observaciones, setObservaciones] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [searchAnimal, setSearchAnimal] = useState("");
  const [saving, setSaving] = useState(false);
  const notif = useNotification();
  const facturaRef = useRef(null);

  const isAdmin = session?.user?.role === "Administrador";

  useEffect(() => {
    const load = async () => {
      try {
        const [cfg, cli, ani] = await Promise.all([
          axios.get("/api/configuracion"),
          axios.get("/api/clientes"),
          axios.get("/api/animal"),
        ]);
        setConfig(cfg.data);
        setClientes(cli.data);
        setAnimales(ani.data.filter((a) => Number(a.existencia) >= 1));
      } catch {
        console.error("Error al cargar datos");
      }
    };
    load();
  }, []);

  const animalesDisponibles = animales.filter(
    (a) =>
      !detalles.some((d) => d.codigo_ani === a.codigo_ani) &&
      (a.codigo_ani?.toLowerCase().includes(searchAnimal.toLowerCase()) ||
        a.nombre_ani?.toLowerCase().includes(searchAnimal.toLowerCase()) ||
        a.arete_ani?.toLowerCase().includes(searchAnimal.toLowerCase()))
  );

  const agregarAnimal = (a) => {
    setDetalles((prev) => [
      ...prev,
      {
        codigo_ani: a.codigo_ani,
        nombre_ani: a.nombre_ani,
        arete_ani: a.arete_ani,
        cantidad_fac: 1,
        precio_fac: Number(a.precio_ani) || 0,
      },
    ]);
    setSearchAnimal("");
    notif.info(`Animal "${a.nombre_ani}" agregado a la factura.`);
  };

  const eliminarDetalle = (codigo) => {
    setDetalles((prev) => prev.filter((d) => d.codigo_ani !== codigo));
    notif.info("Animal eliminado de la factura.");
  };

  const actualizarDetalle = (codigo, field, value) => {
    setDetalles((prev) =>
      prev.map((d) =>
        d.codigo_ani === codigo ? { ...d, [field]: Number(value) || 0 } : d
      )
    );
  };

  const totalFactura = detalles.reduce(
    (sum, d) => sum + Number(d.cantidad_fac) * Number(d.precio_fac),
    0
  );

  const guardarFactura = async () => {
    if (!selectedCliente) {
      notif.error("Debe seleccionar un cliente.");
      return;
    }
    if (detalles.length === 0) {
      notif.error("Debe agregar al menos un animal.");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post("/api/factura", {
        codigo_cli: Number(selectedCliente),
        fecha_fac: fecha,
        observaciones_fac: observaciones,
        detalles: detalles.map((d) => ({
          codigo_ani: d.codigo_ani,
          cantidad_fac: d.cantidad_fac,
          precio_fac: d.precio_fac,
        })),
      });

      setConfig((prev) => ({
        ...prev,
        numero_fac: res.data.numero_fac,
      }));

      notif.show({
        type: "success",
        title: "Factura Registrada",
        message: `Factura N° ${res.data.numero_fac} creada exitosamente. Total: $${totalFactura.toFixed(2)}`,
        onConfirm: () => {
          setSelectedCliente("");
          setSearchCliente("");
          setObservaciones("");
          setDetalles([]);
          notif.close();
        },
        showCancel: false,
      });
    } catch (err) {
      notif.error(err.response?.data?.error || "Error al registrar factura.");
    } finally {
      setSaving(false);
    }
  };

  const imprimirFactura = () => {
    const cliente = clientes.find((c) => String(c.codigo_cli) === selectedCliente);
    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html>
        <head>
          <title>Factura N° ${config?.numero_fac ? Number(config.numero_fac) + 1 : "—"}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 40px; color: #000; }
            h1 { text-align: center; font-size: 24px; margin-bottom: 4px; }
            .header { text-align: center; margin-bottom: 32px; }
            .header p { margin: 2px 0; color: #555; font-size: 14px; }
            .info-table { width: 100%; margin-bottom: 24px; }
            .info-table td { padding: 4px 8px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { border: 1px solid #333; padding: 8px 12px; text-align: left; font-size: 14px; background: #f0f0f0; }
            td { border: 1px solid #333; padding: 8px 12px; text-align: left; font-size: 14px; }
            .text-right { text-align: right; }
            .total-row td { font-weight: bold; font-size: 16px; }
            .footer { margin-top: 48px; text-align: center; color: #555; font-size: 12px; border-top: 1px solid #ccc; padding-top: 16px; }
            .obs { margin-top: 16px; font-size: 13px; color: #555; }
          </style>
        </head>
        <body>
          <h1>SISTEMA GANADERO</h1>
          <div class="header">
            <p>Factura de Venta</p>
          </div>
          <table class="info-table">
            <tr>
              <td><strong>Factura N°:</strong> ${config?.numero_fac ? Number(config.numero_fac) + 1 : "—"}</td>
              <td><strong>Fecha:</strong> ${new Date(fecha).toLocaleDateString("es-VE")}</td>
            </tr>
            <tr>
              <td><strong>Cliente:</strong> ${cliente ? cliente.nombre_cli : "—"}</td>
              <td><strong>RIF:</strong> ${cliente ? cliente.rif_cli : "—"}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Dirección:</strong> ${cliente ? cliente.direccion_cli : "—"}</td>
            </tr>
          </table>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Animal</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Precio</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${detalles.map((d) => {
                const subtotal = Number(d.cantidad_fac) * Number(d.precio_fac);
                return `
                  <tr>
                    <td>${d.codigo_ani}</td>
                    <td>${d.nombre_ani}</td>
                    <td class="text-right">${d.cantidad_fac}</td>
                    <td class="text-right">$${Number(d.precio_fac).toFixed(2)}</td>
                    <td class="text-right">$${subtotal.toFixed(2)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="4" class="text-right">TOTAL:</td>
                <td class="text-right">$${totalFactura.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          ${observaciones ? `<div class="obs"><strong>Observaciones:</strong> ${observaciones}</div>` : ""}
          <div class="footer">Sistema Ganadero — Factura generada electrónicamente</div>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
    notif.info("Factura enviada a impresión.");
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent-bg)" }}
          >
            <ShoppingCart size={22} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Nueva Venta</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Registro de factura de venta
            </p>
          </div>
        </div>
        <div
          className="px-4 py-2 rounded-lg text-sm font-bold"
          style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
        >
          Factura N° {config?.numero_fac ? Number(config.numero_fac) + 1 : "—"}
        </div>
      </div>

      {/* Header data */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 relative">
            <label className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
              <User size={14} /> Cliente
            </label>
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
            >
              <User size={16} style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={searchCliente}
                onChange={(e) => {
                  setSearchCliente(e.target.value);
                  setSelectedCliente("");
                  setShowClientes(true);
                }}
                onFocus={() => setShowClientes(true)}
                onBlur={() => setTimeout(() => setShowClientes(false), 200)}
                placeholder="Buscar cliente por nombre, RIF..."
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              {selectedCliente && (
                <button
                  onClick={() => { setSelectedCliente(""); setSearchCliente(""); }}
                  className="text-xs btn-hover"
                  style={{ color: "var(--text-muted)" }}
                >
                  ✕
                </button>
              )}
            </div>

            {showClientes && !selectedCliente && (
              <div
                className="absolute z-20 w-full mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                {(() => {
                  const filtrados = clientes.filter((c) =>
                    !searchCliente ||
                    c.nombre_cli?.toLowerCase().includes(searchCliente.toLowerCase()) ||
                    c.rif_cli?.toLowerCase().includes(searchCliente.toLowerCase()) ||
                    String(c.codigo_cli).includes(searchCliente)
                  );
                  return filtrados.length === 0 ? (
                    <p className="px-3 py-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      No se encontraron clientes
                    </p>
                  ) : (
                    filtrados.map((c) => (
                      <button
                        key={c.codigo_cli}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedCliente(String(c.codigo_cli));
                          setSearchCliente(`${c.nombre_cli} — ${c.rif_cli}`);
                          setShowClientes(false);
                          notif.info(`Cliente seleccionado: ${c.nombre_cli}`);
                        }}
                        className="w-full text-left px-3 py-2 text-sm btn-hover"
                        style={{
                          color: "var(--text-primary)",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <span className="font-medium">{c.nombre_cli}</span>
                        <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                          {c.rif_cli}
                        </span>
                      </button>
                    ))
                  );
                })()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
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
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas opcionales..."
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none input-focus"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Add animals */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Search size={16} /> Agregar Animales
        </h2>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg mb-4"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          <Search size={18} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={searchAnimal}
            onChange={(e) => setSearchAnimal(e.target.value)}
            placeholder="Buscar animal por código, nombre o arete..."
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {searchAnimal && animalesDisponibles.length === 0 && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            No se encontraron animales disponibles
          </p>
        )}

        {searchAnimal && animalesDisponibles.length > 0 && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {animalesDisponibles.map((a) => (
              <button
                key={a.codigo_ani}
                type="button"
                onClick={() => agregarAnimal(a)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm btn-hover"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold" style={{ color: "var(--accent)" }}>
                    {a.codigo_ani}
                  </span>
                  <span>{a.nombre_ani}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Arete: {a.arete_ani}
                  </span>
                </div>
                <Plus size={16} style={{ color: "var(--accent)" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detalles table */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <FileText size={16} /> Detalles de la Factura
        </h2>

        {detalles.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
            No hay animales agregados. Busque y agregue animales arriba.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg-secondary)" }}>
                  <th className="text-left px-3 py-2 font-medium" style={{ color: "var(--text-muted)" }}>Animal</th>
                  <th className="text-center px-3 py-2 font-medium" style={{ color: "var(--text-muted)" }}>Cantidad</th>
                  <th className="text-right px-3 py-2 font-medium" style={{ color: "var(--text-muted)" }}>Precio</th>
                  <th className="text-right px-3 py-2 font-medium" style={{ color: "var(--text-muted)" }}>Subtotal</th>
                  <th className="text-center px-3 py-2 font-medium" style={{ color: "var(--text-muted)" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((d) => {
                  const subtotal = Number(d.cantidad_fac) * Number(d.precio_fac);
                  return (
                    <tr key={d.codigo_ani} className="border-t" style={{ borderColor: "var(--border)" }}>
                      <td className="px-3 py-2">
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{d.nombre_ani}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{d.codigo_ani}</p>
                      </td>
                      <td className="px-3 py-2 text-center font-medium" style={{ color: "var(--text-primary)" }}>
                        1
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={d.precio_fac}
                          onChange={(e) => actualizarDetalle(d.codigo_ani, "precio_fac", e.target.value)}
                          className="w-24 px-2 py-1 rounded text-sm text-right outline-none input-focus"
                          style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border)",
                            color: "var(--text-primary)",
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium" style={{ color: "var(--text-primary)" }}>
                        ${subtotal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => eliminarDetalle(d.codigo_ani)}
                          className="p-1.5 rounded-lg btn-hover"
                          style={{ color: "#ef4444" }}
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 mt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {detalles.length} animal(es) en la factura
          </span>
          <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Total: ${totalFactura.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={imprimirFactura}
          disabled={detalles.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium btn-hover disabled:opacity-50"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <Printer size={18} />
          Imprimir
        </button>
        <button
          onClick={guardarFactura}
          disabled={saving || detalles.length === 0 || !selectedCliente}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white btn-hover disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar Factura"}
        </button>
      </div>

      <NotificationModal {...notif.notification} />
    </div>
  );
}
