// Genera la imagen del QR para un código, apuntando a /api/r/<codigo> de este mismo sitio.
// Uso: /api/qr?codigo=cafe-martinez           -> PNG (para ver/descargar)
//      /api/qr?codigo=cafe-martinez&format=svg -> SVG (mejor calidad para imprimir)

import QRCode from "qrcode";

export default async function handler(req, res) {
  const { codigo, format } = req.query;

  if (!codigo) {
    res.status(400).json({ error: "Falta el código" });
    return;
  }

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const urlRedirect = `${proto}://${host}/api/r/${encodeURIComponent(codigo)}`;

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(urlRedirect, {
        type: "svg",
        errorCorrectionLevel: "H",
        margin: 1,
      });
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.status(200).send(svg);
      return;
    }

    const png = await QRCode.toBuffer(urlRedirect, {
      type: "png",
      errorCorrectionLevel: "H",
      margin: 1,
      width: 600,
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).send(png);
  } catch (e) {
    res.status(500).json({ error: "No se pudo generar el QR", detalle: String(e) });
  }
}
