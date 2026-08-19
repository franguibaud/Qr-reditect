// Cambia a dónde apunta un código ya creado (sin tener que reimprimir el cartel).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const { password, codigo, destino } = req.body || {};

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Contraseña incorrecta" });
    return;
  }

  if (!codigo || !destino) {
    res.status(400).json({ error: "Falta el código o el nuevo destino" });
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

  const update = await fetch(
    `${SUPABASE_URL}/rest/v1/qr_codes?codigo=eq.${encodeURIComponent(codigo)}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ url_destino: destino }),
    }
  );

  if (!update.ok) {
    const err = await update.text();
    res.status(500).json({ error: "No se pudo actualizar en Supabase", detalle: err });
    return;
  }

  const actualizados = await update.json();
  if (actualizados.length === 0) {
    res.status(404).json({ error: "No existe ese código" });
    return;
  }

  res.status(200).json({ ok: true, qr: actualizados[0] });
}
