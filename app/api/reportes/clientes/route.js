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
      `SELECT c.codigo_cli, c.nombre_cli, c.telefono_cli, c.direccion_cli,
              c.rif_cli, c.email_cli,
              (SELECT COUNT(*) FROM factura f WHERE f.codigo_cli = c.codigo_cli)::int AS total_facturas
       FROM clientes c
       ORDER BY c.nombre_cli`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error en reporte clientes:", error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
