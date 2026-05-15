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

    const result = await query("SELECT * FROM configuracion LIMIT 1");

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Configuración no encontrada" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching configuracion:", error);
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const fields = [];
    const values = [];
    let idx = 1;

    if (body.ultima_vacunacion !== undefined) {
      fields.push(`ultima_vacunacion = $${idx++}`);
      values.push(body.ultima_vacunacion);
    }
    if (body.numero_fac !== undefined) {
      fields.push(`numero_fac = $${idx++}`);
      values.push(body.numero_fac);
    }
    if (body.ultimo_codigo_cli !== undefined) {
      fields.push(`ultimo_codigo_cli = $${idx++}`);
      values.push(body.ultimo_codigo_cli);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    const result = await query(
      `UPDATE configuracion SET ${fields.join(", ")} WHERE id = 1 RETURNING *`,
      values
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating configuracion:", error);
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
  }
}
