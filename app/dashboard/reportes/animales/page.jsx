// ==============================
// Reporte Familias Por Grupo
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
  familyHeader: { backgroundColor: "#e8e8e8", padding: "6 8", marginTop: 10, marginBottom: 6, flexDirection: "row", justifyContent: "space-between", fontSize: 9, fontWeight: "bold", color: "#222" },
  table: { width: "100%" },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#444", paddingBottom: 4, marginBottom: 2, fontWeight: "bold", fontSize: 8, color: "#333" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ddd", paddingVertical: 3, fontSize: 7.5 },
  cellCodigo: { width: "11%" },
  cellNombre: { width: "16%" },
  cellArete: { width: "10%" },
  cellSexo: { width: "9%" },
  cellNacimiento: { width: "13%" },
  cellPeso: { width: "10%" },
  cellPalpacion: { width: "15%" },
  cellVacunacion: { width: "16%" },
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

function ReportDocument({ animales, grupoName, familiaName, grupo, familia }) {
  const grouped = {};
  for (const a of animales) {
    const key = a.name_fam || "Sin familia";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  }

  const today = new Date().toLocaleDateString("es-VE");

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <View style={pdfStyles.header} wrap={false}>
          <Text style={pdfStyles.headerLeft}>{process.env.NEXT_PUBLIC_EMPRESA_NOMBRE || "LOS CHORRERONES"}</Text>
          <Text style={pdfStyles.headerRight}>{`Fecha de generación: ${today}`}</Text>
        </View>

        <Text style={pdfStyles.title}>Reporte de Familias por Grupo</Text>
        <Text style={pdfStyles.subtitle}>
          {`Grupo: ${grupoName}`} | {familiaName ? `Familia: ${familiaName}` : "Todas las familias"} | {`Total animales: ${animales.length}`}
        </Text>

        {Object.entries(grouped).map(([famName, animals]) => (
          <View key={famName}>
            <View style={pdfStyles.familyHeader} wrap={false}>
              <Text>{famName}</Text>
              <Text>{`Grupo: ${grupoName.toUpperCase()}`}</Text>
              <Text>{`Animales: ${animals.length}`}</Text>
            </View>

            <View style={pdfStyles.table}>
              <View style={pdfStyles.headerRow} wrap={false}>
                <Text style={pdfStyles.cellCodigo}>Código</Text>
                <Text style={pdfStyles.cellNombre}>Nombre</Text>
                <Text style={pdfStyles.cellArete}>Arete</Text>
                <Text style={pdfStyles.cellSexo}>Sexo</Text>
                <Text style={pdfStyles.cellNacimiento}>Fec. Nacim.</Text>
                <Text style={pdfStyles.cellPeso}>Peso (kg)</Text>
                <Text style={pdfStyles.cellPalpacion}>Fecha Palpacion</Text>
                <Text style={pdfStyles.cellVacunacion}>Fecha Vacunacion</Text>
              </View>
              {animals.map((a) => (
                <View key={a.codigo_ani} style={pdfStyles.row}>
                  <Text style={pdfStyles.cellCodigo}>{a.codigo_ani}</Text>
                  <Text style={pdfStyles.cellNombre}>{a.nombre_ani}</Text>
                  <Text style={pdfStyles.cellArete}>{a.arete_ani}</Text>
                  <Text style={pdfStyles.cellSexo}>{a.sexo_ani || ""}</Text>
                  <Text style={pdfStyles.cellNacimiento}>{formatDate(a.fechanacimiento_ani)}</Text>
                  <Text style={pdfStyles.cellPeso}>{a.peso_ani != null ? String(a.peso_ani) : ""}</Text>
                  <Text style={pdfStyles.cellPalpacion}>{formatDate(a.fechapalpacion_ani)}</Text>
                  <Text style={pdfStyles.cellVacunacion}>{formatDate(a.fechavacunacion_ani)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={pdfStyles.totalRow}>{`Total de animales: ${animales.length}`}</Text>

        <Text style={pdfStyles.footer} fixed>
          <Text>{process.env.NEXT_PUBLIC_EMPRESA_NOMBRE || "LOS CHORRERONES"}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </Text>
      </Page>
    </Document>
  );
}

function ReporteAnimalesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const grupo = searchParams.get("grupo") || "";
  const familia = searchParams.get("familia") || "";

  const [animales, setAnimales] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!grupo) {
      router.replace("/dashboard/reportes");
      return;
    }
    Promise.all([
      axios.get("/api/grupo").then((r) => setGrupos(r.data)),
      axios.get("/api/reportes/familias", { params: { grupo } }).then((r) => setFamilias(r.data)),
      axios.get("/api/reportes/animales", { params: { grupo, ...(familia && { familia }) } }).then((r) => setAnimales(r.data)),
    ]).catch(console.error).finally(() => setLoading(false));
  }, [grupo, familia, router]);

  const handleDownloadPDF = async () => {
    if (!animales || animales.length === 0) return;
    setGenerating(true);
    try {
      const grupoName = grupos.find((g) => String(g.id_gru) === String(grupo))?.name_gru || "";
      const familiaName = familias.find((f) => String(f.codigo_fam) === String(familia))?.name_fam || "";

      const blob = await pdf(
        <ReportDocument animales={animales} grupoName={grupoName} familiaName={familiaName} grupo={grupo} familia={familia} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_FamiliasPorGrupo_${grupoName}_${familiaName || "Todas"}_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando PDF:", err);
    } finally {
      setGenerating(false);
    }
  };

  const grupoName = grupos.find((g) => String(g.id_gru) === String(grupo))?.name_gru || "";
  const familiaName = familias.find((f) => String(f.codigo_fam) === String(familia))?.name_fam || "";

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
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Familias por Grupo</h1>
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
                {animales?.length || 0} animales encontrados
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {grupoName}
                {familiaName ? `  |  ${familiaName}` : "  |  Todas las familias"}
              </p>
            </div>
            {animales?.length > 0 && (
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

          {!animales || animales.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
              No se encontraron animales con los filtros seleccionados.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--bg-secondary)" }}>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Código</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Nombre</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden sm:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Arete</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden sm:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Sexo</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden md:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Fec. Nacim.</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden md:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>Peso</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden lg:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>F. Palpación</th>
                    <th className="text-left px-4 py-3 font-medium sticky top-0 hidden lg:table-cell" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>F. Vacunación</th>
                  </tr>
                </thead>
                <tbody>
                  {animales.map((a, i) => (
                    <tr
                      key={a.codigo_ani}
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
                          {a.codigo_ani}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                        {a.nombre_ani}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {a.arete_ani}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {a.sexo_ani}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(a.fechanacimiento_ani)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {a.peso_ani} kg
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(a.fechapalpacion_ani)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(a.fechavacunacion_ani)}
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

export default function ReporteAnimalesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
        />
      </div>
    }>
      <ReporteAnimalesContent />
    </Suspense>
  );
}
