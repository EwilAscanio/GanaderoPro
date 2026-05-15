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
      `SELECT p.id_lec, p.codigo_ani, a.nombre_ani, p.fecha_lec, p.litros_lec, p.created_at
       FROM produccionleche p
       JOIN animal a ON p.codigo_ani = a.codigo_ani
       ORDER BY p.fecha_lec DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching produccion:", error);
    return NextResponse.json({ error: "Error al obtener producción" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { codigo_ani, fecha_lec, litros_lec } = body;

    if (!codigo_ani || !codigo_ani.trim()) {
      return NextResponse.json({ error: "El código del animal es obligatorio" }, { status: 400 });
    }
    if (!fecha_lec) {
      return NextResponse.json({ error: "La fecha es obligatoria" }, { status: 400 });
    }
    if (litros_lec === undefined || litros_lec === null || Number(litros_lec) <= 0) {
      return NextResponse.json({ error: "Los litros deben ser un valor positivo" }, { status: 400 });
    }

    const animal = await query("SELECT sexo_ani FROM animal WHERE codigo_ani = $1", [codigo_ani.trim().toUpperCase()]);
    if (animal.rows.length === 0) {
      return NextResponse.json({ error: "Animal no encontrado" }, { status: 404 });
    }
    if (animal.rows[0].sexo_ani !== "Hembra") {
      return NextResponse.json({ error: "Solo se puede registrar producción de leche para animales Hembra" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO produccionleche (codigo_ani, fecha_lec, litros_lec)
       VALUES ($1, $2, $3)
       RETURNING id_lec`,
      [codigo_ani.trim().toUpperCase(), fecha_lec, Number(litros_lec)]
    );

    return NextResponse.json({ success: true, id_lec: result.rows[0].id_lec });
  } catch (error) {
    console.error("Error creating produccion:", error);
    return NextResponse.json({ error: "Error al registrar producción" }, { status: 500 });
  }
}
