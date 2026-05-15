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
      "SELECT * FROM clientes WHERE codigo_cli = $1",
      [Number(codigo)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching cliente:", error);
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 });
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
    const { nombre_cli, telefono_cli, direccion_cli, rif_cli, email_cli } = body;

    const updateFields = [];
    const values = [];
    let idx = 1;

    if (nombre_cli !== undefined) {
      updateFields.push(`nombre_cli = $${idx++}`);
      values.push(nombre_cli.trim());
    }
    if (telefono_cli !== undefined) {
      updateFields.push(`telefono_cli = $${idx++}`);
      values.push(telefono_cli.trim());
    }
    if (direccion_cli !== undefined) {
      updateFields.push(`direccion_cli = $${idx++}`);
      values.push(direccion_cli.trim());
    }
    if (rif_cli !== undefined) {
      updateFields.push(`rif_cli = $${idx++}`);
      values.push(rif_cli.trim());
    }
    if (email_cli !== undefined) {
      updateFields.push(`email_cli = $${idx++}`);
      values.push(email_cli.trim());
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    values.push(Number(codigo));
    const result = await query(
      `UPDATE clientes SET ${updateFields.join(", ")} WHERE codigo_cli = $${idx} RETURNING codigo_cli`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cliente:", error);
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 });
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
      "DELETE FROM clientes WHERE codigo_cli = $1 RETURNING codigo_cli",
      [Number(codigo)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cliente:", error);
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 });
  }
}
