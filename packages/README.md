# packages/

Shared internal packages — the ONLY sanctioned cross-cutting/shared code.

- `domain-contracts/` — shared entity/DTO definitions
- `event-contracts/` — versioned domain-event definitions
- `api-contracts/` — client↔server contract definitions (single source of truth)
- `validation/` — shared validation rules
- `i18n/` — Hebrew string catalog + RTL/Israeli-format utilities (no hard-coded user-facing strings anywhere else)
- `errors/` — shared error taxonomy
- `ui-kit/` — shared UI primitives (structure only)

Package contents are scaffolded in T1.1.3.
