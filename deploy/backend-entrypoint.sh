#!/bin/sh
set -eu

CRED_FILE="${FIREBASE_ADMIN_CREDENTIALS_PATH:-/run/secrets/firebase-adminsdk.json}"

if [ -f "$CRED_FILE" ]; then
    echo "=== Verification du fichier Firebase Admin ($CRED_FILE) ==="
    echo "Taille du fichier : $(wc -c < "$CRED_FILE") caracteres"
    if python -c "import json,sys; json.load(open('$CRED_FILE'))" 2>/tmp/firebase_json_error.txt; then
        echo "=== OK : le JSON Firebase Admin est valide ==="
    else
        echo "=== ERREUR : le JSON Firebase Admin est INVALIDE ==="
        cat /tmp/firebase_json_error.txt
        echo "=== Corrigez le fichier monte via Dokploy (Advanced > Mounts) et redeployez ==="
    fi
else
    echo "=== ATTENTION : fichier Firebase Admin introuvable a $CRED_FILE ==="
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"
