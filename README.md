# barber-marketplace

At-home barber marketplace. **Israel-first, Hebrew-only, full RTL.** Appointment-based (scheduled + recurring) with a lean on-demand option. **TypeScript everywhere; modular monolith.**

> This is the repository skeleton (Sprint 1, task T1.1.1). The full onboarding guide and ADR-000 (structure decision) are added in task T1.1.5. Tooling, CI/CD, and infrastructure are added in later Sprint-1 tasks (E1.2 / E2).

## Monorepo layout
| Path | Purpose |
|---|---|
| `apps/` | Client applications: `customer-mobile`, `barber-mobile` (React Native/Expo), `admin-web` (Next.js) |
| `backend/` | The modular monolith (`modules/*`, `workers/`, composition root `app/`) |
| `packages/` | Shared internal packages (contracts, i18n, validation, errors, ui-kit) |
| `infrastructure/` | Infrastructure-as-code (Terraform) |
| `config/` | Environment-scoped configuration (no secrets) |
| `docs/` | ADRs, module READMEs, runbooks, engineering docs |
| `tests/` | Cross-module integration & e2e suites (unit tests co-located) |
| `scripts/` | Dev, migration, seed, ops scripts |
| `assets/` | Shared static assets |

## Authorities
Engineering Constitution → module TDDs → Engineering Blueprint / Software Architecture → Technology Stack → module READMEs & shared contracts. See the **AI Engineering Playbook** before contributing.
