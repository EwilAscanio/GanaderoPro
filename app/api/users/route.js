import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const result = await query(
      `SELECT u.id_usr, u.name_usr, u.login_usr, u.email_usr, u.id_rol, r.name_rol, u.created_at
       FROM users u
       JOIN roles r ON u.id_rol = r.id_rol
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { name, login, email, password, id_rol } = await request.json();

    if (!name || !login || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const existing = await query(
      "SELECT id_usr FROM users WHERE login_usr = $1 OR email_usr = $2",
      [login, email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "El usuario o email ya existe" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleId = id_rol || 1;

    const result = await query(
      `INSERT INTO users (name_usr, login_usr, email_usr, password_usr, id_rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usr`,
      [name, login, email, hashedPassword, roleId]
    );

    return NextResponse.json({ success: true, userId: result.rows[0].id_usr });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
