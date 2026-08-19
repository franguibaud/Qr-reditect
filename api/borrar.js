// Borra un código (por si te equivocaste al crearlo, o ya no lo vas a usar).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const { password, codigo } = req.body || {};

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Contraseña incorrecta" });
    return;
  }

  if (!codigo) {
    res.status(400).json({ error: "Falta el código a borrar" });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

  const del = await fetch(
    `${SUPABASE_URL}/rest/v1/qr_codes?codigo=eq.${encodeURIComponent(codigo)}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        Prefer: "return=representation",
      },
    }
  );

  if (!del.ok) {
    const err = await del.text();
    res.status(500).json({ error: "No se pudo borrar en Supabase", detalle: err });
    return;
  }

  const borrados = await del.json();
  res.status(200).json({ ok: true, borrados: borrados.length });
}
