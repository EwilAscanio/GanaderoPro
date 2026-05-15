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
    const { fecha_vacunacion } = body;

    if (!fecha_vacunacion) {
      return NextResponse.json({ error: "La fecha de vacunación es obligatoria" }, { status: 400 });
    }

    const animalResult = await query(
      `UPDATE animal SET fechavacunacion_ani = $1 RETURNING codigo_ani`,
      [fecha_vacunacion]
    );

    await query(
      `UPDATE configuracion SET ultima_vacunacion = $1 WHERE id = 1`,
      [fecha_vacunacion]
    );

    return NextResponse.json({
      success: true,
      animales_afectados: animalResult.rowCount,
      fecha_vacunacion,
    });
  } catch (error) {
    console.error("Error procesando vacunación:", error);
    return NextResponse.json({ error: "Error al procesar vacunación" }, { status: 500 });
  }
}
