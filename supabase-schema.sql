-- Pegá esto en Supabase: tu proyecto -> SQL Editor -> New query -> Run

create table if not exists qr_codes (
  id bigint generated always as identity primary key,
  codigo text unique not null,
  negocio text,
  url_destino text not null,
  clicks bigint not null default 0,
  creado_en timestamptz not null default now()
);

alter table qr_codes enable row level security;

-- Cualquiera puede LEER (necesario para que el QR redirija cuando lo escanean).
-- Nadie puede crear ni editar directo a la base — eso solo lo hace el panel,
-- con la clave secreta y la contraseña del panel.
drop policy if exists "Lectura publica de qr_codes" on qr_codes;
create policy "Lectura publica de qr_codes"
on qr_codes for select
to anon
using (true);
