"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Download, Loader } from "lucide-react";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: "#222" },
  headerLeft: { fontSize: 16, fontWeight: "bold", color: "#222" },
  headerRight: { fontSize: 8, color: "#666", textAlign: "right", paddingTop: 4 },
  title: { fontSize: 14, textAlign: "center", fontWeight: "bold", marginBottom: 4, color: "#222" },
  subtitle: { fontSize: 9, textAlign: "center", marginBottom: 16, color: "#555" },
  table: { width: "100%" },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#444", paddingBottom: 4, marginBottom: 2, fontWeight: "bold", fontSize: 8, color: "#333" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ddd", paddingVertical: 3, fontSize: 7.5 },
  cellNumero: { width: "10%" },
  cellCliente: { width: "20%" },
  cellRif: { width: "15%" },
  cellFecha: { width: "15%" },
  cellItems: { width: "8%" },
  cellTotal: { width: "12%" },
  cellObs: { width: "20%" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", color: "#999", fontSize: 7, borderTopWidth: 1, borderTopColor: "#ddd", paddingTop: 6 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", paddingTop: 6, fontSize: 9, fontWeight: "bold", color: "#222" },
});

function formatDate(dateStr) {
  if (!dateStr || dateStr.startsWith("1900-01-01")) return "";
  try {
    return new Date(dateStr).toLocaleDateString("es-VE");
  } catch {
    return "";
  }
}

function formatCurrency(val) {
  return Number(val).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ReportDocument({ facturas, fecha_desde, fecha_hasta }) {
  const today = new Date().toLocaleDateString("es-VE");
  const totalGeneral = facturas.reduce((sum, f) => sum + Number(f.total_fac), 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <View style={pdfStyles.header} wrap={false}>
          <Text style={pdfStyles.headerLeft}>LOS CHORRERONES</Text>
          <Text style={pdfStyles.headerRight}>{`Fecha de generación: ${today}`}</Text>
        </View>

        <Text style={pdfStyles.title}>Reporte de Facturas</Text>
        <Text style={pdfStyles.subtitle}>
          {`Período: ${fecha_desde || "Inicio"} - ${fecha_hasta || "Fin"}`} | {`Total facturas: ${facturas.length}`} | {`Total Bs. ${formatCurrency(totalGeneral)}`}
        </Text>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.headerRow} wrap={false}>
            <Text style={pdfStyles.cellNumero}>N° Factura</Text>
            <Text style={pdfStyles.cellCliente}>Cliente</Text>
            <Text style={pdfStyles.cellRif}>RIF</Text>
            <Text style={pdfStyles.cellFecha}>Fecha</Text>
            <Text style={pdfStyles.cellItems}>Items</Text>
            <Text style={pdfStyles.cellTotal}>Total Bs.</Text>
            <Text style={pdfStyles.cellObs}>Observaciones</Text>
          </View>
          {facturas.map((f) => (
            <View key={f.numero_fac} style={pdfStyles.row}>
              <Text style={pdfStyles.cellNumero}>{f.numero_fac}</Text>
              <Text style={pdfStyles.cellCliente}>{f.nombre_cli}</Text>
              <Text style={pdfStyles.cellRif}>{f.rif_cli || ""}</Text>
              <Text style={pdfStyles.cellFecha}>{formatDate(f.fecha_fac)}</Text>
              <Text style={pdfStyles.cellItems}>{f.items}</Text>
              <Text style={pdfStyles.cellTotal}>{formatCurrency(f.total_fac)}</Text>
              <Text style={pdfStyles.cellObs}>{f.observaciones_fac || ""}</Text>
            </View>
          ))}
        </View>

        <Text style={pdfStyles.totalRow}>{`Total general: Bs. ${formatCurrency(totalGeneral)}`}</Text>

        <Text style={pdfStyles.footer} fixed>
          <Text>LOS CHORRERONES</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </Text>
      </Page>
    </Document>
  );
}

function ReporteFacturasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fecha_desde = searchParams.get("fecha_desde") || "";
  const fecha_hasta = searchParams.get("fecha_hasta") || "";

  const [facturas, setFacturas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const params = {};
    if (fecha_desde) params.fecha_desde = fecha_desde;
    if (fecha_hasta) params.fecha_hasta = fecha_hasta;

    axios.get("/api/reportes/facturas", { params })
      .then((r) => setFacturas(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fecha_desde, fecha_hasta]);

  const handleDownloadPDF = async () => {
    if (!facturas || facturas.length === 0) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <ReportDocument facturas={facturas} fecha_desde={fecha_desde} fecha_hasta={fecha_hasta} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Facturas_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando PDF:", err);
    } finally {
      setGenerating(false);
    }
  };

  const totalGeneral = facturas ? facturas.reduce((sum, f) => sum + Number(f.total_fac), 0) : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/reportes")}
          className="p-2 rounded-lg btn-hover"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Facturas</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Resultados del reporte
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
          />
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div>
              <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {facturas?.length || 0} facturas encontradas
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {fecha_desde || "Inicio"} - {fecha_hasta || "Fin"} | Total: Bs. {formatCurrency(totalGeneral)}
              </p>
            </div>
            {facturas?.length > 0 && (
              <button
                onClick={handleDownloadPDF}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white btn-hover transition-all disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                {generating ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {generating ? "Generando PDF..." : "Descargar PDF"}
              </button>
            )}
          </div>

          {!facturas || facturas.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
              No se encontraron facturas con los filtros seleccionados.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--bg-secondary)" }}>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>N° Factura</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Cliente</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden sm:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>RIF</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Fecha</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden md:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Items</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Total Bs.</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden lg:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((f, i) => (
                    <tr
                      key={f.numero_fac}
                      className="border-t transition-colors"
                      style={{
                        borderColor: "var(--border)",
                        animation: `fadeInUp 0.3s ease ${i * 0.02}s forwards`,
                        opacity: 0,
                      }}
                    >
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex px-2 py-0.5 rounded text-xs font-mono font-bold"
                          style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                        >
                          {f.numero_fac}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                        {f.nombre_cli}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {f.rif_cli}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(f.fecha_fac)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {f.items}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(f.total_fac)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: "var(--text-muted)" }}>
                        {f.observaciones_fac || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReporteFacturasPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
        />
      </div>
    }>
      <ReporteFacturasContent />
    </Suspense>
  );
}
