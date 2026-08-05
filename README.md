# barber-marketplace

At-home barber marketplace. **Israel-first, Hebrew-only, full RTL.** Appointment-based (scheduled + recurring) with a lean on-demand option. **TypeScript everywhere; modular monolith.**

## Getting started
```bash
# Node >= 20 (see .nvmrc)
npm run bootstrap   # installs all workspace dependencies (requires npm-registry access)
```
Then read **[docs/onboarding.md](docs/onboarding.md)**.

## Monorepo layout
| Path | Purpose |
|---|---|
| `apps/` | `customer-mobile`, `barber-mobile` (React Native/Expo), `admin-web` (Next.js + Refine) |
| `backend/` | Modular monolith: `modules/*` (bounded contexts — folders, not services), `workers/`, `app/` (composition root) |
| `packages/` | Shared internal packages (contracts, i18n, validation, errors, ui-kit) |
| `infrastructure/` | Infrastructure-as-code (Terraform) |
| `config/` | Environment-scoped configuration (no secrets) |
| `docs/` | ADRs (`docs/adr/`), onboarding, runbooks |
| `tests/` | Cross-module integration & e2e (unit tests co-located) |
| `scripts/` | Dev, migration, seed, ops scripts |
| `assets/` | Shared static assets |

## Authorities
Engineering Constitution → module TDDs → Engineering Blueprint / Software Architecture → Technology Stack → module READMEs & shared contracts. AI agents: read the **AI Engineering Playbook** first. Foundational decisions: **[docs/adr/000-repository-structure.md](docs/adr/000-repository-structure.md)**.
