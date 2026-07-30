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

    let sql = `SELECT id_cua, fecha_cua, kg_cua, created_at
               FROM cuajada
               WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (fecha_desde) {
      sql += ` AND fecha_cua >= $${idx++}`;
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      sql += ` AND fecha_cua <= $${idx++}`;
      params.push(fecha_hasta);
    }

    sql += " ORDER BY fecha_cua DESC, created_at DESC";

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error en reporte cuajada:", error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
