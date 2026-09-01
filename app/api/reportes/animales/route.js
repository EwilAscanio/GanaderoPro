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
    const familia = searchParams.get("familia");
    const orden = searchParams.get("orden");

    const ordenCols = {
      codigo: "a.codigo_ani",
      chip: "a.chip_ani",
      arete: "a.arete_ani",
      nombre: "a.nombre_ani",
    };
    const ordenCol = ordenCols[orden] || ordenCols.codigo;

    let sql = `SELECT a.codigo_ani, a.nombre_ani, a.chip_ani, a.arete_ani,
                      a.sexo_ani, a.peso_ani, a.status_ani, a.existencia,
                      a.fechaNacimiento_ani, a.fechaPalpacion_ani, a.fechaVacunacion_ani,
                      g.name_gru, f.name_fam
               FROM animal a
               JOIN grupo g ON a.id_gru = g.id_gru
               JOIN familia f ON a.codigo_fam = f.codigo_fam
               WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (grupo) {
      sql += ` AND a.id_gru = $${idx++}`;
      params.push(grupo);
    }
    if (familia) {
      sql += ` AND a.codigo_fam = $${idx++}`;
      params.push(familia);
    }

    sql += ` ORDER BY f.name_fam, ${ordenCol}`;

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error en reporte animales:", error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
