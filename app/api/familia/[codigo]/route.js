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
      `SELECT f.codigo_fam, f.name_fam, f.id_gru, g.name_gru, f.created_at
       FROM familia f
       JOIN grupo g ON f.id_gru = g.id_gru
       WHERE f.codigo_fam = $1`,
      [codigo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching familia:", error);
    return NextResponse.json({ error: "Error al obtener familia" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { codigo } = await params;
    const { name_fam, id_gru } = await request.json();

    if (!name_fam || !name_fam.trim()) {
      return NextResponse.json({ error: "El nombre de familia es obligatorio" }, { status: 400 });
    }
    if (!id_gru) {
      return NextResponse.json({ error: "El grupo es obligatorio" }, { status: 400 });
    }

    const result = await query(
      "UPDATE familia SET name_fam = $1, id_gru = $2 WHERE codigo_fam = $3 RETURNING codigo_fam",
      [name_fam.trim(), id_gru, codigo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating familia:", error);
    return NextResponse.json({ error: "Error al actualizar familia" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { codigo } = await params;

    const check = await query(
      "SELECT codigo_ani FROM animal WHERE codigo_fam = $1 LIMIT 1",
      [codigo]
    );
    if (check.rows.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar la familia porque tiene animales asociados" },
        { status: 400 }
      );
    }

    const result = await query(
      "DELETE FROM familia WHERE codigo_fam = $1 RETURNING codigo_fam",
      [codigo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting familia:", error);
    return NextResponse.json({ error: "Error al eliminar familia" }, { status: 500 });
  }
}
