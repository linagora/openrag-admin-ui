#!/bin/sh
set -e

# Generate config.json from environment variables
cat <<EOF > /app/config.json
{
  "API_BASE_URL": "${API_BASE_URL}",
  "INCLUDE_CREDENTIALS": ${INCLUDE_CREDENTIALS:-false},
  "AUTH_MODE": "${AUTH_MODE:-token}"
}
EOF

exec "$@"
