export default async function handler(req, res) {
  const { codigo } = req.query;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/qr_codes?codigo=eq.${codigo}&select=url_destino`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  const data = await response.json();

  if (data.length > 0 && data[0].url_destino) {
    res.redirect(302, data[0].url_destino);
  } else {
    res.status(404).send("Este cartelito todavía no está activado.");
  }
}
