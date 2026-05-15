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
    const { codigo_cli, fecha_fac, observaciones_fac, detalles } = body;

    if (!codigo_cli) {
      return NextResponse.json({ error: "El cliente es obligatorio" }, { status: 400 });
    }
    if (!fecha_fac) {
      return NextResponse.json({ error: "La fecha es obligatoria" }, { status: 400 });
    }
    if (!detalles || detalles.length === 0) {
      return NextResponse.json({ error: "Debe agregar al menos un animal" }, { status: 400 });
    }

    // Validate animales exist and have existencia = 1
    for (const d of detalles) {
      const ani = await query(
        "SELECT existencia, sexo_ani FROM animal WHERE codigo_ani = $1",
        [d.codigo_ani]
      );
      if (ani.rows.length === 0) {
        return NextResponse.json({ error: `Animal ${d.codigo_ani} no encontrado` }, { status: 400 });
      }
      if (Number(ani.rows[0].existencia) < 1) {
        return NextResponse.json({ error: `El animal ${d.codigo_ani} no tiene existencia disponible` }, { status: 400 });
      }
    }

    // Get next invoice number from configuracion
    const config = await query("SELECT COALESCE(numero_fac, 0) AS numero_fac FROM configuracion LIMIT 1");
    const nextFac = (config.rows[0]?.numero_fac || 0) + 1;

    // Calculate totals
    let totalFactura = 0;
    for (const d of detalles) {
      const subtotal = Number(d.cantidad_fac) * Number(d.precio_fac);
      totalFactura += subtotal;
    }

    // Insert factura
    await query(
      `INSERT INTO factura (numero_fac, codigo_cli, fecha_fac, total_fac, observaciones_fac)
       VALUES ($1, $2, $3, $4, $5)`,
      [nextFac, codigo_cli, fecha_fac, totalFactura, observaciones_fac || ""]
    );

    // Insert detalles and update animal existencia
    for (const d of detalles) {
      const subtotal = Number(d.cantidad_fac) * Number(d.precio_fac);
      await query(
        `INSERT INTO detalle_factura (numero_fac, codigo_ani, cantidad_fac, precio_fac, total_fac)
         VALUES ($1, $2, $3, $4, $5)`,
        [nextFac, d.codigo_ani, Number(d.cantidad_fac), Number(d.precio_fac), subtotal]
      );

      await query(
        "UPDATE animal SET existencia = existencia - $1 WHERE codigo_ani = $2",
        [Number(d.cantidad_fac), d.codigo_ani]
      );
    }

    // Update configuracion
    await query(
      "UPDATE configuracion SET numero_fac = $1 WHERE id = 1",
      [nextFac]
    );

    return NextResponse.json({ success: true, numero_fac: nextFac, total: totalFactura });
  } catch (error) {
    console.error("Error creating factura:", error);
    return NextResponse.json({ error: "Error al registrar factura" }, { status: 500 });
  }
}
