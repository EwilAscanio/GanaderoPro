import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const fecha_desde = searchParams.get("fecha_desde");
    const fecha_hasta = searchParams.get("fecha_hasta");

    let sql = `SELECT f.numero_fac, f.codigo_cli, c.nombre_cli, c.rif_cli,
                      f.fecha_fac, f.total_fac, f.observaciones_fac,
                      (SELECT COUNT(*) FROM detalle_factura d WHERE d.numero_fac = f.numero_fac)::int AS items
               FROM factura f
               JOIN clientes c ON f.codigo_cli = c.codigo_cli
               WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (fecha_desde) {
      sql += ` AND f.fecha_fac >= $${idx++}`;
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      sql += ` AND f.fecha_fac <= $${idx++}`;
      params.push(fecha_hasta);
    }

    sql += " ORDER BY f.fecha_fac DESC, f.numero_fac DESC";

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error en reporte facturas:", error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
