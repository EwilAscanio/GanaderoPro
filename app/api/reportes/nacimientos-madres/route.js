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
    const codigo_ani = searchParams.get("codigo_ani");

    let sql = `SELECT m.codigo_ani AS madre_codigo, m.nombre_ani AS madre_nombre,
                      m.arete_ani AS madre_arete, m.status_ani AS madre_status,
                      h.codigo_ani AS hijo_codigo, h.nombre_ani AS hijo_nombre,
                      h.sexo_ani AS hijo_sexo, h.arete_ani AS hijo_arete,
                      h.fechanacimiento_ani AS hijo_fechanacimiento, h.status_ani AS hijo_status
               FROM animal m
               INNER JOIN animal h ON h.codigomadre_ani = m.codigo_ani
               WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (codigo_ani && codigo_ani.trim()) {
      sql += ` AND m.codigo_ani ILIKE $${idx++}`;
      params.push(`%${codigo_ani.trim()}%`);
    }

    sql += " ORDER BY m.codigo_ani, h.codigo_ani";

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error en reporte nacimientos-madres:", error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
