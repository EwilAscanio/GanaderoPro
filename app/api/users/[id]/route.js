import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const result = await query(
      `SELECT u.id_usr, u.name_usr, u.login_usr, u.email_usr, u.id_rol, r.name_rol, u.created_at
       FROM users u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.id_usr = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const currentUserId = String(session.user.id);
    const isAdmin = session.user?.role === "Administrador";
    const isOwnProfile = currentUserId === id;

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ error: "No tienes permisos para modificar este usuario" }, { status: 403 });
    }

    const { name, login, email, password, id_rol } = await request.json();

    const updateFields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      updateFields.push(`name_usr = $${idx++}`);
      values.push(name);
    }
    if (login !== undefined) {
      updateFields.push(`login_usr = $${idx++}`);
      values.push(login);
    }
    if (email !== undefined) {
      updateFields.push(`email_usr = $${idx++}`);
      values.push(email);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateFields.push(`password_usr = $${idx++}`);
      values.push(hashed);
    }
    if (id_rol !== undefined && isAdmin) {
      updateFields.push(`id_rol = $${idx++}`);
      values.push(id_rol);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id_usr = $${idx} RETURNING id_usr`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado. Solo administradores pueden eliminar usuarios" }, { status: 403 });
    }

    const { id } = await params;

    if (String(session.user.id) === id) {
      return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
    }

    const result = await query("DELETE FROM users WHERE id_usr = $1 RETURNING id_usr", [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}
