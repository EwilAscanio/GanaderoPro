// ==============================
// Reporte Nacimientos
// ==============================
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
  cellId: { width: "8%" },
  cellCodigo: { width: "14%" },
  cellNombre: { width: "20%" },
  cellFecha: { width: "18%" },
  cellHijos: { width: "10%" },
  cellObs: { width: "30%" },
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

function ReportDocument({ registros, fecha_desde, fecha_hasta }) {
  const today = new Date().toLocaleDateString("es-VE");
  const totalHijos = registros.reduce((sum, r) => sum + Number(r.cantidadhijos_nac), 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <View style={pdfStyles.header} wrap={false}>
          <Text style={pdfStyles.headerLeft}>{process.env.NEXT_PUBLIC_EMPRESA_NOMBRE || "LOS CHORRERONES"}</Text>
          <Text style={pdfStyles.headerRight}>{`Fecha de generación: ${today}`}</Text>
        </View>

        <Text style={pdfStyles.title}>Reporte de Nacimientos</Text>
        <Text style={pdfStyles.subtitle}>
          {`Período: ${fecha_desde || "Inicio"} - ${fecha_hasta || "Fin"}`} | {`Total registros: ${registros.length}`} | {`Total hijos: ${totalHijos}`}
        </Text>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.headerRow} wrap={false}>
            <Text style={pdfStyles.cellId}>ID</Text>
            <Text style={pdfStyles.cellCodigo}>Código Madre</Text>
            <Text style={pdfStyles.cellNombre}>Nombre</Text>
            <Text style={pdfStyles.cellFecha}>Fecha Parto</Text>
            <Text style={pdfStyles.cellHijos}>Hijos</Text>
            <Text style={pdfStyles.cellObs}>Observaciones</Text>
          </View>
          {registros.map((r) => (
            <View key={r.id_nac} style={pdfStyles.row}>
              <Text style={pdfStyles.cellId}>{r.id_nac}</Text>
              <Text style={pdfStyles.cellCodigo}>{r.codigo_ani}</Text>
              <Text style={pdfStyles.cellNombre}>{r.nombre_ani}</Text>
              <Text style={pdfStyles.cellFecha}>{formatDate(r.fecha_nac)}</Text>
              <Text style={pdfStyles.cellHijos}>{r.cantidadhijos_nac}</Text>
              <Text style={pdfStyles.cellObs}>{r.observaciones_nac || ""}</Text>
            </View>
          ))}
        </View>

        <Text style={pdfStyles.totalRow}>{`Total de hijos: ${totalHijos}`}</Text>

        <Text style={pdfStyles.footer} fixed>
          <Text>{process.env.NEXT_PUBLIC_EMPRESA_NOMBRE || "LOS CHORRERONES"}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </Text>
      </Page>
    </Document>
  );
}

function ReporteNacimientosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fecha_desde = searchParams.get("fecha_desde") || "";
  const fecha_hasta = searchParams.get("fecha_hasta") || "";

  const [registros, setRegistros] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const params = {};
    if (fecha_desde) params.fecha_desde = fecha_desde;
    if (fecha_hasta) params.fecha_hasta = fecha_hasta;

    axios.get("/api/reportes/nacimientos", { params })
      .then((r) => setRegistros(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fecha_desde, fecha_hasta]);

  const handleDownloadPDF = async () => {
    if (!registros || registros.length === 0) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <ReportDocument registros={registros} fecha_desde={fecha_desde} fecha_hasta={fecha_hasta} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Nacimientos_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando PDF:", err);
    } finally {
      setGenerating(false);
    }
  };

  const totalHijos = registros ? registros.reduce((sum, r) => sum + Number(r.cantidadhijos_nac), 0) : 0;

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
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Nacimientos</h1>
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
                {registros?.length || 0} registros encontrados
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {fecha_desde || "Inicio"} - {fecha_hasta || "Fin"} | Total hijos: {totalHijos}
              </p>
            </div>
            {registros?.length > 0 && (
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

          {!registros || registros.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
              No se encontraron registros con los filtros seleccionados.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--bg-secondary)" }}>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>ID</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Código Madre</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Nombre</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden sm:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Fecha Parto</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Hijos</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden md:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r, i) => (
                    <tr
                      key={r.id_nac}
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
                          {r.id_nac}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                        {r.codigo_ani}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {r.nombre_ani}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(r.fecha_nac)}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                        {r.cantidadhijos_nac}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: "var(--text-muted)" }}>
                        {r.observaciones_nac || ""}
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

export default function ReporteNacimientosPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
        />
      </div>
    }>
      <ReporteNacimientosContent />
    </Suspense>
  );
}
