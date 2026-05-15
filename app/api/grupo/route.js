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
      "SELECT id_gru, name_gru, created_at FROM grupo ORDER BY id_gru"
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching grupos:", error);
    return NextResponse.json({ error: "Error al obtener grupos" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { name_gru } = await request.json();

    if (!name_gru || !name_gru.trim()) {
      return NextResponse.json({ error: "El nombre del grupo es obligatorio" }, { status: 400 });
    }

    const result = await query(
      "INSERT INTO grupo (name_gru) VALUES ($1) RETURNING id_gru",
      [name_gru.trim().toUpperCase()]
    );

    return NextResponse.json({ success: true, id: result.rows[0].id_gru });
  } catch (error) {
    console.error("Error creating grupo:", error);
    return NextResponse.json({ error: "Error al crear grupo" }, { status: 500 });
  }
}
