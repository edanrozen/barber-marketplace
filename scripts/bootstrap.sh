#!/usr/bin/env bash
# One-command local bootstrap (Sprint 1, T1.1.4).
# Installs all workspace dependencies. REQUIRES npm-registry network access.
set -euo pipefail

echo "==> barber-marketplace bootstrap"
echo "node: $(node -v)  npm: $(npm -v)"
echo "==> Installing workspace dependencies (npm workspaces)..."
npm install
echo "==> Done. Next steps: see docs/onboarding.md"
