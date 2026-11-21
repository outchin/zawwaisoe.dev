#!/usr/bin/env bash
# Set a new admin password for the production site.
#
# Prompts for the password (hidden), bcrypt-hashes it locally, and stores
# only the hash as ADMIN_PASSWORD_HASH in Vercel (Production + Preview).
# The plain password never leaves this machine or lands in shell history.
#
# Run it from a normal terminal (it needs interactive input):
#   bash scripts/set-admin-password.sh
# Then redeploy so the new value takes effect.
set -euo pipefail
cd "$(dirname "$0")/.."

read -rsp "New admin password: " P1; echo
read -rsp "Type it again:      " P2; echo

if [ "$P1" != "$P2" ]; then
  echo "Passwords don't match." >&2
  exit 1
fi
if [ "${#P1}" -lt 12 ]; then
  echo "Use at least 12 characters." >&2
  exit 1
fi

HASH=$(P="$P1" node -e 'process.stdout.write(require("bcryptjs").hashSync(process.env.P, 12))')
unset P1 P2

for env in production preview; do
  printf '%s' "$HASH" | npx vercel env add ADMIN_PASSWORD_HASH \
    --environment "$env" --sensitive --force --yes
done

echo
echo "Done. ADMIN_PASSWORD_HASH updated for production and preview."
echo "Redeploy for it to take effect."
