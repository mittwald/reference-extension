#!/usr/bin/env bash
set -euo pipefail

if [[ -f .env ]]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
fi

APP_BASE_URL="${APP_BASE_URL:-http://localhost:3000}"
WEBHOOK_URL="${WEBHOOK_URL:-${APP_BASE_URL%/}/api/webhooks/mittwald}"
EXTENSION_ID="${EXTENSION_ID:?Set EXTENSION_ID to the same value used by the extension app}"
CONTRIBUTOR_ID="${CONTRIBUTOR_ID:-00000000-0000-0000-0000-000000000000}"
MOCK_EXTENSION_INSTANCE_ID="${MOCK_EXTENSION_INSTANCE_ID:-MOCK_EXTENSION_INSTANCE_ID}"
MOCK_CONTEXT_ID="${MOCK_CONTEXT_ID:-MOCK_CONTEXT_ID}"
MOCK_SECRET="${MOCK_SECRET:-MOCK_EXTENSION_SECRET}"
MOCK_VARIANT_KEY="${MOCK_VARIANT_KEY:-local}"
MOCK_USER_ID="${MOCK_USER_ID:-MOCK_USER_ID}"
REQUEST_ID="${REQUEST_ID:-$(uuidgen 2>/dev/null || printf '00000000-0000-0000-0000-%012d' "$(date +%s)")}"
CREATED_AT="${CREATED_AT:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"

curl --fail-with-body --show-error --silent \
    --request POST \
    --header "Content-Type: application/json" \
    --data @- \
    "${WEBHOOK_URL}?dry-run=true&executing-user-id=${MOCK_USER_ID}" <<JSON
{
  "apiVersion": "v1",
  "kind": "ExtensionAddedToContext",
  "id": "${MOCK_EXTENSION_INSTANCE_ID}",
  "context": {
    "id": "${MOCK_CONTEXT_ID}",
    "kind": "project"
  },
  "consentedScopes": [],
  "state": {
    "enabled": true
  },
  "meta": {
    "extensionId": "${EXTENSION_ID}",
    "contributorId": "${CONTRIBUTOR_ID}"
  },
  "secret": "${MOCK_SECRET}",
  "variantKey": "${MOCK_VARIANT_KEY}",
  "request": {
    "id": "${REQUEST_ID}",
    "createdAt": "${CREATED_AT}",
    "target": {
      "method": "POST",
      "url": "${WEBHOOK_URL}"
    }
  }
}
JSON

printf '\n'