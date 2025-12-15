#!/usr/bin/env bash

ask(){ read -p "$1" a; [ $a = "yes" ]; }

set -e

rmWebhooks() {
    rm -r ./src/routes/api/
    pnpm run build
}

rmDbRelation() {
    awk '!/references/' ./src/db/schema.ts > tmp.ts && mv tmp.ts ./src/db/schema.ts
}

rmDb() {
    rm ./src/db/schema.ts
    touch ./src/db/schema.ts
}

rmComments() {
    rm -fr src/components/comments src/domain/comments src/serverFunctions/comments
    awk '!/Comment/' ./src/components/Dashboard.tsx > tmp.tsx && mv tmp.tsx ./src/components/Dashboard.tsx
    pnpm format:fix
}

rmFragments() {
    awk '!/Dashboard/' ./src/routes/index.tsx > tmp.ts && mv tmp.ts ./src/routes/index.tsx
    rm -fr ./src/components/*
    pnpm format:fix
}

cleanup() {
    jq '.scripts |= with_entries(select(.key | startswith(\"cleanup\") | not))' package.json > tmp.json
    mv tmp.json package.json
}

rmGit() {
    ask 'cleanup git?[yes/no]' && rm -rf ./.git
}

all() {
    rmWebhooks
    rmDb
    rmComments
    rmFragments
    cleanup
    rmGit
    rm ./cleanup.sh
}

pnpm install

