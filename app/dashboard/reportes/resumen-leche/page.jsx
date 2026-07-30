"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Table2, Download, Loader } from "lucide-react";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const fmtFecha = (f) => {
  const parts = f.split("-");
  return `${parts[2]}-${parts[1]}`;
};

const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontSize: 7 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: "#222" },
  headerLeft: { fontSize: 14, fontWeight: "bold", color: "#222" },
  headerRight: { fontSize: 7, color: "#666", textAlign: "right", paddingTop: 2 },
  title: { fontSize: 12, textAlign: "center", fontWeight: "bold", marginBottom: 2, color: "#222" },
  subtitle: { fontSize: 8, textAlign: "center", marginBottom: 12, color: "#555" },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#444", paddingBottom: 3, marginBottom: 1, backgroundColor: "#f5f5f5" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 3 },
  totalRow: { flexDirection: "row", borderTopWidth: 1.5, borderTopColor: "#333", paddingTop: 3 },
  footer: { position: "absolute", bottom: 20, left: 30, right: 30, flexDirection: "row", justifyContent: "space-between", color: "#999", fontSize: 6, borderTopWidth: 1, borderTopColor: "#ddd", paddingTop: 4 },
});

function ResumenPDFDocument({ data, fecha_desde, fecha_hasta }) {
  const today = new Date().toLocaleDateString("es-VE");
  const codigoWidth = 90;
  const totalWidthCol = 50;
  const totalWidth = 781;
  const fechaWidth = Math.max(35, Math.min(55, (totalWidth - codigoWidth - totalWidthCol) / data.fechas.length));

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <View style={pdfStyles.header} wrap={false}>
          <Text style={pdfStyles.headerLeft}>{process.env.NEXT_PUBLIC_EMPRESA_NOMBRE || "LOS CHORRERONES"}</Text>
          <Text style={pdfStyles.headerRight}>{`Fecha de generación: ${today}`}</Text>
        </View>

        <Text style={pdfStyles.title}>Resumen de Leche</Text>
        <Text style={pdfStyles.subtitle}>
          {`Período: ${fecha_desde || "Inicio"} - ${fecha_hasta || fecha_desde || "Fin"}`} | {`Animales: ${data.animales.length}`}
          {` | Total: ${data.granTotal.toFixed(2)} L`}
        </Text>

        <View style={pdfStyles.headerRow}>
          <Text style={{ width: codigoWidth, fontWeight: "bold", fontSize: 7, paddingLeft: 4 }}>Código Animal</Text>
          {data.fechas.map((f) => (
            <Text key={f} style={{ width: fechaWidth, textAlign: "right", fontWeight: "bold", fontSize: 7, paddingRight: 4 }}>
              {fmtFecha(f)}
            </Text>
          ))}
          <Text style={{ width: totalWidthCol, textAlign: "right", fontWeight: "bold", fontSize: 7, paddingRight: 4 }}>Total</Text>
        </View>

        {data.animales.map((codigo) => (
          <View key={codigo} style={pdfStyles.row}>
            <Text style={{ width: codigoWidth, fontSize: 6.5, paddingLeft: 4 }}>
              {codigo} {data.nombresAnimales[codigo] || ""}
            </Text>
            {data.fechas.map((f) => (
              <Text key={f} style={{ width: fechaWidth, textAlign: "right", fontSize: 6.5, paddingRight: 4 }}>
                {data.datos[codigo]?.[f] ? Number(data.datos[codigo][f]).toFixed(1) : "-"}
              </Text>
            ))}
            <Text style={{ width: totalWidthCol, textAlign: "right", fontSize: 6.5, fontWeight: "bold", paddingRight: 4 }}>
              {Number(data.totalesPorAnimal[codigo]).toFixed(1)}
            </Text>
          </View>
        ))}

        <View style={pdfStyles.totalRow}>
          <Text style={{ width: codigoWidth, fontSize: 7, paddingLeft: 4 }}>Total</Text>
          {data.fechas.map((f) => (
            <Text key={f} style={{ width: fechaWidth, textAlign: "right", fontSize: 7, paddingRight: 4 }}>
              {Number(data.totalesPorFecha[f] || 0).toFixed(1)}
            </Text>
          ))}
          <Text style={{ width: totalWidthCol, textAlign: "right", fontSize: 7, fontWeight: "bold", paddingRight: 4 }}>
            {data.granTotal.toFixed(1)}
          </Text>
        </View>

        <Text style={pdfStyles.footer} fixed>
          <Text>{process.env.NEXT_PUBLIC_EMPRESA_NOMBRE || "LOS CHORRERONES"}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </Text>
      </Page>
    </Document>
  );
}

function ResumenLecheContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fecha_desde = searchParams.get("fecha_desde") || "";
  const fecha_hasta = searchParams.get("fecha_hasta") || "";
  const codigo_ani = searchParams.get("codigo_ani") || "";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!fecha_desde) {
      router.replace("/dashboard/reportes");
      return;
    }
    const params = { fecha_desde };
    if (fecha_hasta) params.fecha_hasta = fecha_hasta;
    if (codigo_ani) params.codigo_ani = codigo_ani;

    axios.get("/api/reportes/resumen-leche", { params })
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fecha_desde, fecha_hasta, codigo_ani, router]);

  const handleDownloadPDF = async () => {
    if (!data || data.animales.length === 0) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <ResumenPDFDocument data={data} fecha_desde={fecha_desde} fecha_hasta={fecha_hasta} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resumen_Leche_${new Date().toISOString().slice(0, 10)}.pdf`;
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
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Resumen de Leche</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Reporte resumido de producción por animal y día
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
      ) : !data || data.animales.length === 0 ? (
        <div className="text-center py-20">
          <p style={{ color: "var(--text-muted)" }}>No se encontraron registros con los filtros seleccionados.</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Período: <strong>{fecha_desde}</strong> - <strong>{fecha_hasta || fecha_desde}</strong>
              {codigo_ani && <> | Animal: <strong>{codigo_ani}</strong></>}
              {!codigo_ani && <> | Animales: <strong>{data.animales.length}</strong></>}
              <> | Total: <strong>{data.granTotal.toFixed(2)} L</strong></>
            </p>
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
          </div>

          <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg-secondary)" }}>
                  <th className="text-left px-4 py-3 font-medium sticky top-0 min-w-[120px]" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)", zIndex: 1 }}>
                    Código Animal
                  </th>
                  {data.fechas.map((f) => (
                    <th key={f} className="text-right px-3 py-3 font-medium sticky top-0 min-w-[70px]" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>
                      {fmtFecha(f)}
                    </th>
                  ))}
                  <th className="text-right px-4 py-3 font-medium sticky top-0 min-w-[80px]" style={{ color: "var(--accent)", background: "var(--bg-secondary)" }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.animales.map((codigo, i) => (
                  <tr
                    key={codigo}
                    className="border-t transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      animation: `fadeInUp 0.3s ease ${i * 0.02}s forwards`,
                      opacity: 0,
                    }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                      <span className="font-mono">{codigo}</span>
                      {data.nombresAnimales[codigo] && (
                        <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                          {data.nombresAnimales[codigo]}
                        </span>
                      )}
                    </td>
                    {data.fechas.map((f) => (
                      <td key={f} className="px-3 py-3 text-right font-mono" style={{ color: "var(--text-secondary)" }}>
                        {data.datos[codigo]?.[f] ? Number(data.datos[codigo][f]).toFixed(1) : "-"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right font-bold font-mono" style={{ color: "var(--accent)" }}>
                      {Number(data.totalesPorAnimal[codigo]).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "var(--accent-bg)" }}>
                  <td className="px-4 py-3 font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    Total
                  </td>
                  {data.fechas.map((f) => (
                    <td key={f} className="px-3 py-3 text-right font-bold font-mono" style={{ color: "var(--accent)" }}>
                      {Number(data.totalesPorFecha[f] || 0).toFixed(1)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-bold font-mono" style={{ color: "var(--accent)" }}>
                    {data.granTotal.toFixed(1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumenLechePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
        />
      </div>
    }>
      <ResumenLecheContent />
    </Suspense>
  );
}
