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
    const { animales } = body;

    if (!animales || !Array.isArray(animales) || animales.length === 0) {
      return NextResponse.json({ error: "Lista de animales inválida" }, { status: 400 });
    }

    for (const a of animales) {
      if (!a.codigo_ani || a.peso_ani === undefined) continue;
      await query(
        `UPDATE animal SET peso_ani = $1 WHERE codigo_ani = $2`,
        [a.peso_ani, a.codigo_ani]
      );
    }

    return NextResponse.json({ success: true, animales_afectados: animales.length });
  } catch (error) {
    console.error("Error actualizando pesos:", error);
    return NextResponse.json({ error: "Error al actualizar pesos" }, { status: 500 });
  }
}
