import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { codigo_ani, fecha_pal, animalembarazado_pal, tiempogestacion_pal } = body;

    if (!codigo_ani || !codigo_ani.trim()) {
      return NextResponse.json({ error: "El código del animal es obligatorio" }, { status: 400 });
    }
    if (!fecha_pal) {
      return NextResponse.json({ error: "La fecha de palpación es obligatoria" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO palpacion (codigo_ani, fecha_pal, animalembarazado_pal, tiempogestacion_pal)
       VALUES ($1, $2, $3, $4)
       RETURNING id_pal`,
      [
        codigo_ani.trim().toUpperCase(),
        fecha_pal,
        Boolean(animalembarazado_pal),
        Number(tiempogestacion_pal) || 0,
      ]
    );

    return NextResponse.json({ success: true, id_pal: result.rows[0].id_pal });
  } catch (error) {
    console.error("Error creating palpacion:", error);
    return NextResponse.json({ error: "Error al registrar palpación" }, { status: 500 });
  }
}
