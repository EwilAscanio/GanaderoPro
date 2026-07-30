import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const fecha_desde = searchParams.get("fecha_desde");
    const fecha_hasta = searchParams.get("fecha_hasta");
    const codigo_ani = searchParams.get("codigo_ani");

    if (!fecha_desde) {
      return NextResponse.json({ error: "La fecha desde es obligatoria" }, { status: 400 });
    }

    let sql = `SELECT p.codigo_ani, a.nombre_ani, p.fecha_lec, p.litros_lec
               FROM produccionleche p
               JOIN animal a ON p.codigo_ani = a.codigo_ani
               WHERE p.fecha_lec >= $1`;
    const params = [fecha_desde];
    let idx = 2;

    if (fecha_hasta) {
      sql += ` AND p.fecha_lec <= $${idx++}`;
      params.push(fecha_hasta);
    }
    if (codigo_ani) {
      sql += ` AND p.codigo_ani = $${idx++}`;
      params.push(codigo_ani);
    }

    sql += " ORDER BY a.codigo_ani, p.fecha_lec";

    const result = await query(sql, params);
    const rows = result.rows;

    const animalesSet = new Set();
    const fechasSet = new Set();
    const datos = {};
    const totalesPorFecha = {};
    const totalesPorAnimal = {};

    for (const r of rows) {
      const fechaStr = r.fecha_lec instanceof Date
        ? r.fecha_lec.toISOString().split("T")[0]
        : String(r.fecha_lec).split("T")[0];

      animalesSet.add(r.codigo_ani);
      fechasSet.add(fechaStr);

      if (!datos[r.codigo_ani]) datos[r.codigo_ani] = {};
      datos[r.codigo_ani][fechaStr] = (datos[r.codigo_ani][fechaStr] || 0) + Number(r.litros_lec);

      totalesPorFecha[fechaStr] = (totalesPorFecha[fechaStr] || 0) + Number(r.litros_lec);
      totalesPorAnimal[r.codigo_ani] = (totalesPorAnimal[r.codigo_ani] || 0) + Number(r.litros_lec);
    }

    const animales = [...animalesSet];
    const fechas = [...fechasSet].sort();
    const granTotal = Object.values(totalesPorAnimal).reduce((s, v) => s + v, 0);

    const nombresAnimales = {};
    for (const r of rows) {
      if (!nombresAnimales[r.codigo_ani]) nombresAnimales[r.codigo_ani] = r.nombre_ani;
    }

    return NextResponse.json({
      animales,
      fechas,
      datos,
      totalesPorAnimal,
      totalesPorFecha,
      granTotal,
      nombresAnimales,
    });
  } catch (error) {
    console.error("Error en reporte resumen-leche:", error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
