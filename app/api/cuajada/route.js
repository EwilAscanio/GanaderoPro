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
      "SELECT id_cua, fecha_cua, kg_cua, created_at FROM cuajada ORDER BY fecha_cua DESC"
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching cuajada:", error);
    return NextResponse.json({ error: "Error al obtener cuajada" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { fecha_cua, kg_cua } = await request.json();

    if (!fecha_cua) {
      return NextResponse.json({ error: "La fecha es obligatoria" }, { status: 400 });
    }
    if (kg_cua === undefined || kg_cua === null || Number(kg_cua) <= 0) {
      return NextResponse.json({ error: "Los kg deben ser un valor positivo" }, { status: 400 });
    }

    const result = await query(
      "INSERT INTO cuajada (fecha_cua, kg_cua) VALUES ($1, $2) RETURNING id_cua",
      [fecha_cua, Number(kg_cua)]
    );

    return NextResponse.json({ success: true, id_cua: result.rows[0].id_cua });
  } catch (error) {
    console.error("Error creating cuajada:", error);
    return NextResponse.json({ error: "Error al registrar cuajada" }, { status: 500 });
  }
}
