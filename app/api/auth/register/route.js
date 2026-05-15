import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const { name, login, email, password } = await request.json();

    if (!name || !login || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existing = await query(
      "SELECT id_usr FROM users WHERE login_usr = $1 OR email_usr = $2",
      [login, email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "El usuario o email ya existe" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultRoleId = 1;

    const result = await query(
      `INSERT INTO users (name_usr, login_usr, email_usr, password_usr, id_rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usr`,
      [name, login, email, hashedPassword, defaultRoleId]
    );

    return NextResponse.json({
      success: true,
      userId: result.rows[0].id_usr,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
