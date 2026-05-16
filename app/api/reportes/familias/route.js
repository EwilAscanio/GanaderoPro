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
    const grupo = searchParams.get("grupo");

    let sql = `SELECT f.codigo_fam, f.name_fam, COUNT(a.codigo_ani)::int AS total
               FROM familia f
               LEFT JOIN animal a ON f.codigo_fam = a.codigo_fam`;
    const params = [];
    let idx = 1;

    if (grupo) {
      sql += ` WHERE f.id_gru = $${idx++}`;
      params.push(grupo);
    }

    sql += ` GROUP BY f.codigo_fam, f.name_fam ORDER BY f.name_fam`;

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching familias con conteo:", error);
    return NextResponse.json({ error: "Error al obtener familias" }, { status: 500 });
  }
}
