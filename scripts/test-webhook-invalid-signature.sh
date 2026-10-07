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
WEBHOOK_SIGNATURE_SERIAL="${WEBHOOK_SIGNATURE_SERIAL:?Copy X-Marketplace-Signature-Serial from a genuine webhook}"
WEBHOOK_SIGNATURE="${WEBHOOK_SIGNATURE:?Copy X-Marketplace-Signature from the same genuine webhook}"
WEBHOOK_SIGNATURE_ALGORITHM="${WEBHOOK_SIGNATURE_ALGORITHM:-ed25519}"
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
    --header "X-Marketplace-Signature-Serial: ${WEBHOOK_SIGNATURE_SERIAL}" \
    --header "X-Marketplace-Signature-Algorithm: ${WEBHOOK_SIGNATURE_ALGORITHM}" \
    --header "X-Marketplace-Signature: ${WEBHOOK_SIGNATURE}" \
    --data "${BODY}" \
    "${WEBHOOK_URL}")"

if [[ "${STATUS}" == "200" ]]; then
    printf 'VULNERABLE: mismatched webhook signature was accepted with HTTP 200.\n' >&2
    exit 1
fi

if [[ "${STATUS}" == "401" ]]; then
    printf 'PASS: mismatched webhook signature was rejected with HTTP 401.\n'
    exit 0
fi

printf 'INCONCLUSIVE: received HTTP %s; expected the uniform 401 of the webhook authentication middleware.\n' "${STATUS}" >&2
exit 2