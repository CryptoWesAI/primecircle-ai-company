#!/bin/sh
set -eu

target="${1:?Geef het .env-doelpad op}"

if [ -e "$target" ]; then
  echo "Doelbestand bestaat al; niets gewijzigd." >&2
  exit 1
fi

umask 077
random_hex() {
  node -e "console.log(require('node:crypto').randomBytes(Number(process.argv[1])).toString('hex'))" "$1"
}
postgres_password="$(random_hex 32)"
session_secret="$(random_hex 48)"
ingest_key="$(random_hex 48)"
admin_password="Bv!$(random_hex 16)"

printf '%s\n' \
  "POSTGRES_PASSWORD=$postgres_password" \
  "SESSION_SECRET=$session_secret" \
  "INGEST_KEY=$ingest_key" \
  "BOOTSTRAP_TENANT_SLUG=belvanger" \
  "BOOTSTRAP_TENANT_NAME=Belvanger" \
  "BOOTSTRAP_ADMIN_EMAIL=info@belvanger.nl" \
  "BOOTSTRAP_ADMIN_PASSWORD=$admin_password" \
  "COOKIE_SECURE=false" > "$target"

echo "Omgevingsbestand veilig aangemaakt."
