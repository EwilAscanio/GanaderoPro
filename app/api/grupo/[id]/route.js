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

    const { id } = await params;
    const result = await query(
      "SELECT id_gru, name_gru, created_at, ver_todas_familias FROM grupo WHERE id_gru = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching grupo:", error);
    return NextResponse.json({ error: "Error al obtener grupo" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const { name_gru } = await request.json();

    if (!name_gru || !name_gru.trim()) {
      return NextResponse.json({ error: "El nombre del grupo es obligatorio" }, { status: 400 });
    }

    const result = await query(
      "UPDATE grupo SET name_gru = $1 WHERE id_gru = $2 RETURNING id_gru",
      [name_gru.trim().toUpperCase(), id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating grupo:", error);
    return NextResponse.json({ error: "Error al actualizar grupo" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;

    const check = await query("SELECT id_gru FROM familia WHERE id_gru = $1 LIMIT 1", [id]);
    if (check.rows.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el grupo porque tiene familias asociadas" },
        { status: 400 }
      );
    }

    const result = await query(
      "DELETE FROM grupo WHERE id_gru = $1 RETURNING id_gru",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting grupo:", error);
    return NextResponse.json({ error: "Error al eliminar grupo" }, { status: 500 });
  }
}
