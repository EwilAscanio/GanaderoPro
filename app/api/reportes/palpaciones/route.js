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

    let sql = `SELECT p.id_pal, p.codigo_ani, a.nombre_ani, a.sexo_ani,
       f.name_fam,
       p.fecha_pal, p.animalembarazado_pal, p.tiempogestacion_pal, p.created_at
FROM palpacion p
JOIN animal a ON p.codigo_ani = a.codigo_ani
JOIN familia f ON a.codigo_fam = f.codigo_fam
WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (fecha_desde) {
      sql += ` AND p.fecha_pal >= $${idx++}`;
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      sql += ` AND p.fecha_pal <= $${idx++}`;
      params.push(fecha_hasta);
    }

    sql += " ORDER BY p.fecha_pal DESC, p.created_at DESC";

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error en reporte palpaciones:", error);
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 },
    );
  }
}
