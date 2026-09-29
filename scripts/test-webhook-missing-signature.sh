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
PROBE_ID="webhook-signature-probe-$(date +%s)"
BODY="$(cat <<JSON
{
  "apiVersion": "v1",
  "kind": "InstanceRemovedFromContext",
  "id": "${PROBE_ID}",
  "context": {
    "id": "${PROBE_ID}",
    "kind": "project"
  },
  "consentedScopes": [],
  "state": {
    "enabled": false
  },
  "meta": {
    "extensionId": "${EXTENSION_ID}",
    "contributorId": "00000000-0000-0000-0000-000000000000"
  },
  "variantKey": "signature-probe",
  "request": {
    "id": "${PROBE_ID}",
    "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "target": {
      "method": "POST",
      "url": "${WEBHOOK_URL}"
    }
  }
}
JSON
)"

STATUS="$(curl --output /dev/null --silent --write-out '%{http_code}' \
    --request POST \
    --header "Content-Type: application/json" \
    --data "${BODY}" \
    "${WEBHOOK_URL}")"

if [[ "${STATUS}" == "400" ]]; then
    printf 'PASS: missing signature headers were rejected with HTTP 400.\n'
    exit 0
fi

printf 'FAIL: expected HTTP 400 without signature headers, received HTTP %s.\n' "${STATUS}" >&2
printf 'Signature verification may be disabled in the running app.\n' >&2
exit 1