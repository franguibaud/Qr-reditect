// Crea un QR nuevo (un negocio + a dónde tiene que apuntar).
// Solo funciona si mandás la contraseña correcta del panel.

function normalizarCodigo(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const { password, negocio, destino, codigo } = req.body || {};

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Contraseña incorrecta" });
    return;
  }

  if (!negocio || !destino) {
    res.status(400).json({ error: "Falta el nombre del negocio o el link de destino" });
    return;
  }

  try {
    new URL(destino);
  } catch {
    res.status(400).json({ error: "El link de destino no es una URL válida (tiene que empezar con https://)" });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

  let codigoFinal = normalizarCodigo(codigo || negocio);
  if (!codigoFinal) {
    res.status(400).json({ error: "No se pudo generar un código a partir del nombre del negocio" });
    return;
  }

  // Si el código ya existe, le agrega un sufijo numérico hasta encontrar uno libre.
  for (let intento = 0; intento < 20; intento++) {
    const candidato = intento === 0 ? codigoFinal : `${codigoFinal}-${intento + 1}`;

    const check = await fetch(
      `${SUPABASE_URL}/rest/v1/qr_codes?codigo=eq.${encodeURIComponent(candidato)}&select=id`,
      {
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        },
      }
    );
    const existentes = await check.json();

    if (existentes.length === 0) {
      codigoFinal = candidato;
      break;
    }
    if (intento === 19) {
      res.status(409).json({ error: "No encontré un código libre, probá con uno manual" });
      return;
    }
  }

  const insert = await fetch(`${SUPABASE_URL}/rest/v1/qr_codes`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      codigo: codigoFinal,
      negocio,
      url_destino: destino,
      clicks: 0,
    }),
  });

  if (!insert.ok) {
    const err = await insert.text();
    res.status(500).json({ error: "No se pudo guardar en Supabase", detalle: err });
    return;
  }

  const [creado] = await insert.json();
  res.status(200).json({ ok: true, qr: creado });
}
