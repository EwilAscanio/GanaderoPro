"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Download, Loader, Search, X } from "lucide-react";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: "#222" },
  headerLeft: { fontSize: 16, fontWeight: "bold", color: "#222" },
  headerRight: { fontSize: 8, color: "#666", textAlign: "right", paddingTop: 4 },
  title: { fontSize: 14, textAlign: "center", fontWeight: "bold", marginBottom: 4, color: "#222" },
  subtitle: { fontSize: 9, textAlign: "center", marginBottom: 16, color: "#555" },
  madreHeader: { backgroundColor: "#e8e8e8", padding: "6 8", marginTop: 10, marginBottom: 4, flexDirection: "row", justifyContent: "space-between", fontSize: 9, fontWeight: "bold", color: "#222" },
  table: { width: "100%" },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#444", paddingBottom: 4, marginBottom: 2, fontWeight: "bold", fontSize: 8, color: "#333" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ddd", paddingVertical: 3, fontSize: 7.5 },
  cellCodigo: { width: "15%" },
  cellNombre: { width: "25%" },
  cellSexo: { width: "10%" },
  cellArete: { width: "15%" },
  cellNacimiento: { width: "20%" },
  cellStatus: { width: "15%" },
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

function ReportDocument({ grupoMadres }) {
  const today = new Date().toLocaleDateString("es-VE");
  const totalMadres = grupoMadres.length;
  const totalHijos = grupoMadres.reduce((sum, g) => sum + g.hijos.length, 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <View style={pdfStyles.header} wrap={false}>
          <Text style={pdfStyles.headerLeft}>LOS CHORRERONES</Text>
          <Text style={pdfStyles.headerRight}>{`Fecha de generación: ${today}`}</Text>
        </View>

        <Text style={pdfStyles.title}>Reporte de Madres y Crías</Text>
        <Text style={pdfStyles.subtitle}>
          {`Total madres: ${totalMadres}`} | {`Total crías: ${totalHijos}`}
        </Text>

        {grupoMadres.map((madre) => (
          <View key={madre.madre_codigo} wrap={false}>
            <View style={pdfStyles.madreHeader}>
              <Text>{`Madre: ${madre.madre_codigo} - ${madre.madre_nombre}`}</Text>
              <Text>{`Arete: ${madre.madre_arete || ""}`}</Text>
              <Text>{`Crías: ${madre.hijos.length}`}</Text>
            </View>

            <View style={pdfStyles.table}>
              <View style={pdfStyles.headerRow}>
                <Text style={pdfStyles.cellCodigo}>Código</Text>
                <Text style={pdfStyles.cellNombre}>Nombre</Text>
                <Text style={pdfStyles.cellSexo}>Sexo</Text>
                <Text style={pdfStyles.cellArete}>Arete</Text>
                <Text style={pdfStyles.cellNacimiento}>Fec. Nacim.</Text>
                <Text style={pdfStyles.cellStatus}>Status</Text>
              </View>
              {madre.hijos.map((h) => (
                <View key={h.codigo} style={pdfStyles.row}>
                  <Text style={pdfStyles.cellCodigo}>{h.codigo}</Text>
                  <Text style={pdfStyles.cellNombre}>{h.nombre}</Text>
                  <Text style={pdfStyles.cellSexo}>{h.sexo || ""}</Text>
                  <Text style={pdfStyles.cellArete}>{h.arete || ""}</Text>
                  <Text style={pdfStyles.cellNacimiento}>{formatDate(h.fechanacimiento)}</Text>
                  <Text style={pdfStyles.cellStatus}>{h.status || ""}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={pdfStyles.totalRow}>{`Total madres: ${totalMadres} | Total crías: ${totalHijos}`}</Text>

        <Text style={pdfStyles.footer} fixed>
          <Text>LOS CHORRERONES</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </Text>
      </Page>
    </Document>
  );
}

function ReporteNacimientosMadresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codigo_ani = searchParams.get("codigo_ani") || "";

  const [data, setData] = useState(null);
  const [codigoFilter, setCodigoFilter] = useState(codigo_ani);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchData = (codigo) => {
    setLoading(true);
    const params = {};
    if (codigo) params.codigo_ani = codigo;

    axios.get("/api/reportes/nacimientos-madres", { params })
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(codigo_ani);
  }, [codigo_ani]);

  const grupoMadres = useMemo(() => {
    if (!data) return [];
    const map = {};
    for (const row of data) {
      if (!map[row.madre_codigo]) {
        map[row.madre_codigo] = {
          madre_codigo: row.madre_codigo,
          madre_nombre: row.madre_nombre,
          madre_arete: row.madre_arete,
          madre_status: row.madre_status,
          hijos: [],
        };
      }
      map[row.madre_codigo].hijos.push({
        codigo: row.hijo_codigo,
        nombre: row.hijo_nombre,
        sexo: row.hijo_sexo,
        arete: row.hijo_arete,
        fechanacimiento: row.hijo_fechanacimiento,
        status: row.hijo_status,
      });
    }
    return Object.values(map);
  }, [data]);

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (codigoFilter) params.set("codigo_ani", codigoFilter);
    router.push(`/dashboard/reportes/nacimientos-madres?${params.toString()}`);
  };

  const handleClear = () => {
    setCodigoFilter("");
    router.push("/dashboard/reportes/nacimientos-madres");
  };

  const handleDownloadPDF = async () => {
    if (!data || data.length === 0) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <ReportDocument grupoMadres={grupoMadres} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_MadresCrias_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando PDF:", err);
    } finally {
      setGenerating(false);
    }
  };

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
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Madres y Crías</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Reporte de madres con sus crías
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-4 animate-fade-in-up"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-end gap-3 flex-wrap">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Código de la madre
            </label>
            <input
              type="text"
              value={codigoFilter}
              onChange={(e) => setCodigoFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              placeholder="Dejar vacío para mostrar todas"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            />
          </div>
          <button
            onClick={handleFilter}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white btn-hover transition-all"
            style={{ background: "var(--accent)" }}
          >
            <Search size={16} />
            Buscar
          </button>
          {codigoFilter && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium btn-hover transition-all"
              style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
            >
              <X size={16} />
              Mostrar todas
            </button>
          )}
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
                {grupoMadres.length} madres encontradas
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {data ? `${data.length} crías registradas` : ""}
                {codigoFilter ? ` | Filtro: ${codigoFilter}` : " | Todas las madres"}
              </p>
            </div>
            {data?.length > 0 && (
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

          {!data || data.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
              No se encontraron madres con crías registradas.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
              {grupoMadres.map((madre) => (
                <div key={madre.madre_codigo} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <div
                    className="flex items-center justify-between px-4 py-3 sticky top-0"
                    style={{ background: "var(--bg-secondary)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex px-2 py-0.5 rounded text-xs font-mono font-bold"
                        style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                      >
                        {madre.madre_codigo}
                      </span>
                      <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {madre.madre_nombre}
                      </span>
                      {madre.madre_arete && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Arete: {madre.madre_arete}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      {madre.hijos.length} crías
                    </span>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-xs" style={{ color: "var(--text-muted)" }}>Código</th>
                        <th className="text-left px-4 py-2 font-medium text-xs" style={{ color: "var(--text-muted)" }}>Nombre</th>
                        <th className="text-left px-4 py-2 font-medium text-xs hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>Sexo</th>
                        <th className="text-left px-4 py-2 font-medium text-xs hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>Arete</th>
                        <th className="text-left px-4 py-2 font-medium text-xs hidden md:table-cell" style={{ color: "var(--text-muted)" }}>Fec. Nacim.</th>
                        <th className="text-left px-4 py-2 font-medium text-xs" style={{ color: "var(--text-muted)" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {madre.hijos.map((h) => (
                        <tr
                          key={h.codigo}
                          className="border-t transition-colors"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <td className="px-4 py-2">
                            <span
                              className="inline-flex px-2 py-0.5 rounded text-xs font-mono"
                              style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                            >
                              {h.codigo}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-medium" style={{ color: "var(--text-primary)" }}>
                            {h.nombre}
                          </td>
                          <td className="px-4 py-2 hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                            {h.sexo}
                          </td>
                          <td className="px-4 py-2 hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                            {h.arete}
                          </td>
                          <td className="px-4 py-2 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                            {formatDate(h.fechanacimiento)}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                h.status === "Activo" ? "text-green-600 bg-green-50" :
                                h.status === "Vendido" ? "text-orange-600 bg-orange-50" :
                                h.status === "Fallecido" ? "text-red-600 bg-red-50" :
                                ""
                              }`}
                            >
                              {h.status || ""}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReporteNacimientosMadresPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
        />
      </div>
    }>
      <ReporteNacimientosMadresContent />
    </Suspense>
  );
}
