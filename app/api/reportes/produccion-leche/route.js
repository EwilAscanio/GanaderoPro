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

    let sql = `SELECT p.id_lec, p.codigo_ani, a.nombre_ani, a.sexo_ani,
                      p.fecha_lec, p.litros_lec, p.created_at
               FROM produccionleche p
               JOIN animal a ON p.codigo_ani = a.codigo_ani
               WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (fecha_desde) {
      sql += ` AND p.fecha_lec >= $${idx++}`;
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      sql += ` AND p.fecha_lec <= $${idx++}`;
      params.push(fecha_hasta);
    }

    sql += " ORDER BY p.fecha_lec DESC, p.created_at DESC";

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error en reporte produccion-leche:", error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
