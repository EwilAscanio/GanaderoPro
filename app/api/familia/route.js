import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const result = await query(
      `SELECT f.codigo_fam, f.name_fam, f.id_gru, g.name_gru, f.created_at
       FROM familia f
       JOIN grupo g ON f.id_gru = g.id_gru
       ORDER BY f.codigo_fam`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching familias:", error);
    return NextResponse.json({ error: "Error al obtener familias" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { codigo_fam, name_fam, id_gru } = await request.json();

    if (!codigo_fam || !codigo_fam.trim()) {
      return NextResponse.json({ error: "El código de familia es obligatorio" }, { status: 400 });
    }
    if (!name_fam || !name_fam.trim()) {
      return NextResponse.json({ error: "El nombre de familia es obligatorio" }, { status: 400 });
    }
    if (!id_gru) {
      return NextResponse.json({ error: "El grupo es obligatorio" }, { status: 400 });
    }

    const existing = await query(
      "SELECT codigo_fam FROM familia WHERE codigo_fam = $1",
      [codigo_fam.trim().toUpperCase()]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Ya existe una familia con ese código" }, { status: 400 });
    }

    const result = await query(
      "INSERT INTO familia (codigo_fam, name_fam, id_gru) VALUES ($1, $2, $3) RETURNING codigo_fam",
      [codigo_fam.trim().toUpperCase(), name_fam.trim(), id_gru]
    );

    return NextResponse.json({ success: true, codigo: result.rows[0].codigo_fam });
  } catch (error) {
    console.error("Error creating familia:", error);
    return NextResponse.json({ error: "Error al crear familia" }, { status: 500 });
  }
}
