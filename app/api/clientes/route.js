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
      "SELECT * FROM clientes ORDER BY nombre_cli"
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching clientes:", error);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { nombre_cli, telefono_cli, direccion_cli, rif_cli, email_cli } = body;

    if (!nombre_cli || !nombre_cli.trim()) {
      return NextResponse.json({ error: "El nombre del cliente es obligatorio" }, { status: 400 });
    }
    if (!telefono_cli || !telefono_cli.trim()) {
      return NextResponse.json({ error: "El teléfono es obligatorio" }, { status: 400 });
    }
    if (!direccion_cli || !direccion_cli.trim()) {
      return NextResponse.json({ error: "La dirección es obligatoria" }, { status: 400 });
    }
    if (!rif_cli || !rif_cli.trim()) {
      return NextResponse.json({ error: "El RIF es obligatorio" }, { status: 400 });
    }
    if (!email_cli || !email_cli.trim()) {
      return NextResponse.json({ error: "El correo es obligatorio" }, { status: 400 });
    }

    // Get next code from configuracion
    const config = await query("SELECT COALESCE(ultimo_codigo_cli, 0) AS ultimo_codigo_cli FROM configuracion LIMIT 1");
    const nextCode = (config.rows[0]?.ultimo_codigo_cli || 0) + 1;

    const result = await query(
      `INSERT INTO clientes (codigo_cli, nombre_cli, telefono_cli, direccion_cli, rif_cli, email_cli)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING codigo_cli`,
      [nextCode, nombre_cli.trim(), telefono_cli.trim(), direccion_cli.trim(), rif_cli.trim(), email_cli.trim()]
    );

    // Update configuracion with new code
    await query(
      "UPDATE configuracion SET ultimo_codigo_cli = $1 WHERE id = 1",
      [nextCode]
    );

    return NextResponse.json({ success: true, codigo: result.rows[0].codigo_cli });
  } catch (error) {
    console.error("Error creating cliente:", error);
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}
