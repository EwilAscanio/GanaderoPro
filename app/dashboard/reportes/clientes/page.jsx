"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
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
  cellCodigo: { width: "8%" },
  cellNombre: { width: "18%" },
  cellTelefono: { width: "13%" },
  cellDireccion: { width: "25%" },
  cellRif: { width: "15%" },
  cellEmail: { width: "13%" },
  cellFacturas: { width: "8%" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", color: "#999", fontSize: 7, borderTopWidth: 1, borderTopColor: "#ddd", paddingTop: 6 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", paddingTop: 6, fontSize: 9, fontWeight: "bold", color: "#222" },
});

function ReportDocument({ clientes }) {
  const today = new Date().toLocaleDateString("es-VE");
  const totalFacturas = clientes.reduce((sum, c) => sum + Number(c.total_facturas), 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <View style={pdfStyles.header} wrap={false}>
          <Text style={pdfStyles.headerLeft}>LOS CHORRERONES</Text>
          <Text style={pdfStyles.headerRight}>{`Fecha de generación: ${today}`}</Text>
        </View>

        <Text style={pdfStyles.title}>Reporte de Clientes</Text>
        <Text style={pdfStyles.subtitle}>
          {`Total clientes: ${clientes.length}`} | {`Total facturas emitidas: ${totalFacturas}`}
        </Text>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.headerRow} wrap={false}>
            <Text style={pdfStyles.cellCodigo}>Código</Text>
            <Text style={pdfStyles.cellNombre}>Nombre</Text>
            <Text style={pdfStyles.cellTelefono}>Teléfono</Text>
            <Text style={pdfStyles.cellDireccion}>Dirección</Text>
            <Text style={pdfStyles.cellRif}>RIF</Text>
            <Text style={pdfStyles.cellEmail}>Email</Text>
            <Text style={pdfStyles.cellFacturas}>Facturas</Text>
          </View>
          {clientes.map((c) => (
            <View key={c.codigo_cli} style={pdfStyles.row}>
              <Text style={pdfStyles.cellCodigo}>{c.codigo_cli}</Text>
              <Text style={pdfStyles.cellNombre}>{c.nombre_cli}</Text>
              <Text style={pdfStyles.cellTelefono}>{c.telefono_cli}</Text>
              <Text style={pdfStyles.cellDireccion}>{c.direccion_cli}</Text>
              <Text style={pdfStyles.cellRif}>{c.rif_cli}</Text>
              <Text style={pdfStyles.cellEmail}>{c.email_cli}</Text>
              <Text style={pdfStyles.cellFacturas}>{c.total_facturas}</Text>
            </View>
          ))}
        </View>

        <Text style={pdfStyles.totalRow}>{`Total de clientes: ${clientes.length}`}</Text>

        <Text style={pdfStyles.footer} fixed>
          <Text>LOS CHORRERONES</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </Text>
      </Page>
    </Document>
  );
}

function ReporteClientesContent() {
  const router = useRouter();

  const [clientes, setClientes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    axios.get("/api/reportes/clientes")
      .then((r) => setClientes(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPDF = async () => {
    if (!clientes || clientes.length === 0) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <ReportDocument clientes={clientes} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Clientes_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando PDF:", err);
    } finally {
      setGenerating(false);
    }
  };

  const totalFacturas = clientes ? clientes.reduce((sum, c) => sum + Number(c.total_facturas), 0) : 0;

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
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Clientes</h1>
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
                {clientes?.length || 0} clientes encontrados
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Total facturas emitidas: {totalFacturas}
              </p>
            </div>
            {clientes?.length > 0 && (
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

          {!clientes || clientes.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
              No hay clientes registrados.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--bg-secondary)" }}>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Código</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Nombre</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden sm:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Teléfono</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden md:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Dirección</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden sm:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>RIF</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden lg:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Email</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Facturas</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c, i) => (
                    <tr
                      key={c.codigo_cli}
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
                          {c.codigo_cli}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                        {c.nombre_cli}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {c.telefono_cli}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: "var(--text-secondary)" }}>
                        {c.direccion_cli}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {c.rif_cli}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {c.email_cli}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                        {c.total_facturas}
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

export default function ReporteClientesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
        />
      </div>
    }>
      <ReporteClientesContent />
    </Suspense>
  );
}
