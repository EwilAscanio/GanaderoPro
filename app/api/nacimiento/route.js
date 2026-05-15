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
      `SELECT n.id_nac, n.codigo_ani, a.nombre_ani, a.sexo_ani,
              n.fecha_nac, n.cantidadHijos_nac, n.observaciones_nac, n.created_at
       FROM nacimiento n
       JOIN animal a ON n.codigo_ani = a.codigo_ani
       ORDER BY n.created_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching nacimientos:", error);
    return NextResponse.json({ error: "Error al obtener nacimientos" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { codigo_ani, fecha_nac, cantidadHijos_nac, observaciones_nac } = body;

    if (!codigo_ani || !codigo_ani.trim()) {
      return NextResponse.json({ error: "El código del animal es obligatorio" }, { status: 400 });
    }
    if (!fecha_nac) {
      return NextResponse.json({ error: "La fecha de parto es obligatoria" }, { status: 400 });
    }
    if (cantidadHijos_nac === undefined || cantidadHijos_nac === null || Number(cantidadHijos_nac) < 0) {
      return NextResponse.json({ error: "La cantidad de hijos debe ser un número válido" }, { status: 400 });
    }

    const animal = await query(
      "SELECT sexo_ani FROM animal WHERE codigo_ani = $1",
      [codigo_ani.trim().toUpperCase()]
    );
    if (animal.rows.length === 0) {
      return NextResponse.json({ error: "Animal no encontrado" }, { status: 404 });
    }
    if (animal.rows[0].sexo_ani === "Macho") {
      return NextResponse.json({ error: "No se puede registrar un parto en un animal macho" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO nacimiento (codigo_ani, fecha_nac, cantidadHijos_nac, observaciones_nac)
       VALUES ($1, $2, $3, $4)
       RETURNING id_nac`,
      [
        codigo_ani.trim().toUpperCase(),
        fecha_nac,
        Number(cantidadHijos_nac),
        observaciones_nac?.trim() || null,
      ]
    );

    return NextResponse.json({ success: true, id_nac: result.rows[0].id_nac });
  } catch (error) {
    console.error("Error creating nacimiento:", error);
    return NextResponse.json({ error: "Error al registrar nacimiento" }, { status: 500 });
  }
}
