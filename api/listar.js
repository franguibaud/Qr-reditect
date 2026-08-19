// Devuelve la lista de QR ya creados. Pide la contraseña del panel.

export default async function handler(req, res) {
  const password = req.query.password || (req.headers["x-admin-password"] ?? "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Contraseña incorrecta" });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/qr_codes?select=id,codigo,negocio,url_destino,clicks,creado_en&order=creado_en.desc`,
    {
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    res.status(500).json({ error: "No se pudo leer Supabase", detalle: err });
    return;
  }

  const data = await response.json();
  res.status(200).json({ ok: true, qrs: data });
}
