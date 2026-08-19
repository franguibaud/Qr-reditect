# Qr-reditect — QR dinámicos

Cada cartelito imprime un QR que apunta a **este sitio** (no directo a Google/al menú).
Este sitio busca en Supabase a dónde tiene que mandar a esa persona y la redirige ahí.
La ventaja: si algún día cambiás el link de destino, no hace falta reimprimir el cartel —
lo cambiás en el panel y listo.

## Cómo queda armado

- `api/r/[codigo].js` — cuando alguien escanea el QR entra acá, busca el código en
  Supabase y redirige al link de destino. Suma 1 al contador de escaneos.
- `api/crear.js` — crea un código nuevo (lo usa el panel).
- `api/editar.js` — cambia el destino de un código que ya existe (lo usa el panel).
- `api/listar.js` — trae la lista de todos los códigos (lo usa el panel).
- `api/qr.js` — genera la imagen del QR (PNG o SVG) para un código.
- `public/index.html` — el panel: crear QR, ver los que hay, cambiarles el destino.

## Puesta en marcha (una sola vez)

### 1. Crear la tabla en Supabase

Andá a tu proyecto de Supabase → **SQL Editor** → pegá el contenido de
`supabase-schema.sql` de esta carpeta → **Run**.

### 2. Conseguir las claves de Supabase

En Supabase: **Project Settings → API**. Vas a necesitar:

- La **URL** del proyecto (`SUPABASE_URL`).
- La clave **publishable** (antes "anon key") — es pública, solo permite leer.
- La clave **secret** (antes "service_role key") — es privada, permite escribir.
  **No la compartas ni la subas a un repo público.**

### 3. Cargar las variables en Vercel

En tu proyecto de Vercel: **Settings → Environment Variables**, agregá:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | la URL de tu proyecto Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | la clave publishable/anon |
| `SUPABASE_SECRET_KEY` | la clave secret/service_role |
| `ADMIN_PASSWORD` | la contraseña que quieras para entrar al panel |

Después de cargarlas, hacé un **Redeploy** para que se apliquen.

### 4. Usar el panel

Entrá a `https://tu-sitio.vercel.app/`, poné la contraseña, y ya podés:

- Crear un QR nuevo (nombre del negocio + link de destino).
- Ver todos los QR creados, con su imagen lista para descargar (botón "Descargar SVG",
  mejor calidad para imprimir que el PNG).
- Cambiarle el destino a uno que ya imprimiste, sin tener que reimprimir el cartel.

El link que lleva impreso cada cartelito es siempre:
`https://tu-sitio.vercel.app/api/r/EL-CODIGO`
