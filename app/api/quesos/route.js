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
      "SELECT id_que, fecha_que, kg_que, created_at FROM quesos ORDER BY fecha_que DESC"
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching quesos:", error);
    return NextResponse.json({ error: "Error al obtener quesos" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { fecha_que, kg_que } = await request.json();

    if (!fecha_que) {
      return NextResponse.json({ error: "La fecha es obligatoria" }, { status: 400 });
    }
    if (kg_que === undefined || kg_que === null || Number(kg_que) <= 0) {
      return NextResponse.json({ error: "Los kg deben ser un valor positivo" }, { status: 400 });
    }

    const result = await query(
      "INSERT INTO quesos (fecha_que, kg_que) VALUES ($1, $2) RETURNING id_que",
      [fecha_que, Number(kg_que)]
    );

    return NextResponse.json({ success: true, id_que: result.rows[0].id_que });
  } catch (error) {
    console.error("Error creating queso:", error);
    return NextResponse.json({ error: "Error al registrar queso" }, { status: 500 });
  }
}
