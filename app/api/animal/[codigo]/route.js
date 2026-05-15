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

    const { codigo } = await params;
    const result = await query(
      `SELECT a.codigo_ani, a.nombre_ani, a.chip_ani, a.id_gru, g.name_gru,
              a.codigo_fam, f.name_fam, a.sexo_ani, a.fechapalpacion_ani,
              a.tiempogestacion_ani, a.peso_ani, a.arete_ani,
              a.fechanacimiento_ani, a.fechavacunacion_ani, a.status_ani,
              a.precio_ani, a.existencia, a.created_at
       FROM animal a
       JOIN grupo g ON a.id_gru = g.id_gru
       JOIN familia f ON a.codigo_fam = f.codigo_fam
       WHERE a.codigo_ani = $1`,
      [codigo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Animal no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching animal:", error);
    return NextResponse.json({ error: "Error al obtener animal" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { codigo } = await params;
    const body = await request.json();
    const {
      nombre_ani, chip_ani, id_gru, codigo_fam, sexo_ani,
      fechapalpacion_ani, tiempogestacion_ani, peso_ani, arete_ani,
      fechanacimiento_ani, fechavacunacion_ani, status_ani, precio_ani, existencia
    } = body;

    const updateFields = [];
    const values = [];
    let idx = 1;

    if (nombre_ani !== undefined) {
      updateFields.push(`nombre_ani = $${idx++}`);
      values.push(nombre_ani.trim());
    }
    if (chip_ani !== undefined) {
      updateFields.push(`chip_ani = $${idx++}`);
      values.push(chip_ani);
    }
    if (id_gru !== undefined) {
      updateFields.push(`id_gru = $${idx++}`);
      values.push(id_gru);
    }
    if (codigo_fam !== undefined) {
      updateFields.push(`codigo_fam = $${idx++}`);
      values.push(codigo_fam.trim().toUpperCase());
    }
    if (sexo_ani !== undefined) {
      updateFields.push(`sexo_ani = $${idx++}`);
      values.push(sexo_ani.trim());
    }
    if (fechapalpacion_ani !== undefined) {
      updateFields.push(`fechapalpacion_ani = $${idx++}`);
      values.push(fechapalpacion_ani || null);
    }
    if (tiempogestacion_ani !== undefined) {
      updateFields.push(`tiempogestacion_ani = $${idx++}`);
      values.push(tiempogestacion_ani);
    }
    if (peso_ani !== undefined) {
      updateFields.push(`peso_ani = $${idx++}`);
      values.push(peso_ani);
    }
    if (arete_ani !== undefined) {
      updateFields.push(`arete_ani = $${idx++}`);
      values.push(arete_ani.trim());
    }
    if (fechanacimiento_ani !== undefined) {
      updateFields.push(`fechanacimiento_ani = $${idx++}`);
      values.push(fechanacimiento_ani || null);
    }
    if (fechavacunacion_ani !== undefined) {
      updateFields.push(`fechavacunacion_ani = $${idx++}`);
      values.push(fechavacunacion_ani || null);
    }
    if (status_ani !== undefined) {
      updateFields.push(`status_ani = $${idx++}`);
      values.push(status_ani || null);
    }
    if (precio_ani !== undefined) {
      updateFields.push(`precio_ani = $${idx++}`);
      values.push(precio_ani);
    }
    if (existencia !== undefined) {
      updateFields.push(`existencia = $${idx++}`);
      values.push(existencia);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    values.push(codigo);
    const result = await query(
      `UPDATE animal SET ${updateFields.join(", ")} WHERE codigo_ani = $${idx} RETURNING codigo_ani`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Animal no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating animal:", error);
    return NextResponse.json({ error: "Error al actualizar animal" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { codigo } = await params;

    const result = await query(
      "DELETE FROM animal WHERE codigo_ani = $1 RETURNING codigo_ani",
      [codigo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Animal no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting animal:", error);
    return NextResponse.json({ error: "Error al eliminar animal" }, { status: 500 });
  }
}
