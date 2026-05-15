import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { codigo } = await params;

    const result = await query(
      `SELECT a.codigo_ani, a.nombre_ani, a.chip_ani, a.id_gru, g.name_gru,
              a.codigo_fam, f.name_fam, a.sexo_ani, a.peso_ani, a.arete_ani,
              a.fechanacimiento_ani, a.status_ani
       FROM animal a
       JOIN grupo g ON a.id_gru = g.id_gru
       JOIN familia f ON a.codigo_fam = f.codigo_fam
       WHERE a.codigomadre_ani = $1
       ORDER BY a.codigo_ani`,
      [codigo]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching crias:", error);
    return NextResponse.json({ error: "Error al obtener crías" }, { status: 500 });
  }
}
