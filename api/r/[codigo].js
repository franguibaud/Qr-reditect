export default async function handler(req, res) {
  const { codigo } = req.query;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/qr_codes?codigo=eq.${encodeURIComponent(codigo)}&select=id,url_destino,clicks`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  const data = await response.json();

  if (data.length > 0 && data[0].url_destino) {
    const row = data[0];

    // Suma la visita sin hacer esperar al usuario por la redirección.
    fetch(`${SUPABASE_URL}/rest/v1/qr_codes?id=eq.${row.id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ clicks: (row.clicks || 0) + 1 }),
    }).catch(() => {});

    res.redirect(302, row.url_destino);
  } else {
    res.status(404).send("Este cartelito todavía no está activado.");
  }
}
