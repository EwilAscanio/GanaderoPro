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
      `SELECT a.codigo_ani, a.nombre_ani, a.chip_ani, a.id_gru, g.name_gru,
              a.codigo_fam, f.name_fam, a.sexo_ani, a.fechaPalpacion_ani,
              a.tiempoGestacion_ani, a.peso_ani, a.arete_ani,
              a.fechaNacimiento_ani, a.fechaVacunacion_ani, a.status_ani,
              a.precio_ani, a.existencia, a.created_at
       FROM animal a
       JOIN grupo g ON a.id_gru = g.id_gru
       JOIN familia f ON a.codigo_fam = f.codigo_fam
       ORDER BY a.codigo_ani`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching animales:", error);
    return NextResponse.json({ error: "Error al obtener animales" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const {
      codigo_ani, nombre_ani, chip_ani, id_gru, codigo_fam, sexo_ani,
      fechaPalpacion_ani, tiempoGestacion_ani, peso_ani, arete_ani,
      fechaNacimiento_ani, fechaVacunacion_ani, status_ani, precio_ani, existencia
    } = body;

    if (!codigo_ani || !codigo_ani.trim()) {
      return NextResponse.json({ error: "El código del animal es obligatorio" }, { status: 400 });
    }
    if (!nombre_ani || !nombre_ani.trim()) {
      return NextResponse.json({ error: "El nombre del animal es obligatorio" }, { status: 400 });
    }
    if (chip_ani === undefined || chip_ani === null) {
      return NextResponse.json({ error: "El chip es obligatorio" }, { status: 400 });
    }
    if (!id_gru) {
      return NextResponse.json({ error: "El grupo es obligatorio" }, { status: 400 });
    }
    if (!codigo_fam || !codigo_fam.trim()) {
      return NextResponse.json({ error: "La familia es obligatoria" }, { status: 400 });
    }
    if (!sexo_ani || !sexo_ani.trim()) {
      return NextResponse.json({ error: "El sexo es obligatorio" }, { status: 400 });
    }
    if (!arete_ani || !arete_ani.trim()) {
      return NextResponse.json({ error: "El arete es obligatorio" }, { status: 400 });
    }

    const existing = await query(
      "SELECT codigo_ani FROM animal WHERE codigo_ani = $1",
      [codigo_ani.trim().toUpperCase()]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Ya existe un animal con ese código" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO animal (codigo_ani, nombre_ani, chip_ani, id_gru, codigo_fam, sexo_ani,
        fechaPalpacion_ani, tiempoGestacion_ani, peso_ani, arete_ani,
        fechaNacimiento_ani, fechaVacunacion_ani, status_ani, precio_ani, existencia)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING codigo_ani`,
      [
        codigo_ani.trim().toUpperCase(), nombre_ani.trim(), chip_ani, id_gru,
        codigo_fam.trim().toUpperCase(), sexo_ani.trim(),
        fechaPalpacion_ani || null, tiempoGestacion_ani || 0, peso_ani || 0,
        arete_ani.trim(), fechaNacimiento_ani || null, fechaVacunacion_ani || null,
        status_ani || null, precio_ani || 0, existencia || 0
      ]
    );

    return NextResponse.json({ success: true, codigo: result.rows[0].codigo_ani });
  } catch (error) {
    console.error("Error creating animal:", error);
    return NextResponse.json({ error: "Error al crear animal" }, { status: 500 });
  }
}
