# ADR-000: Repository Structure & Foundational Decisions

- **Status:** Accepted
- **Date:** Sprint 1
- **Deciders:** Engineering (per locked founding documents)

## Context
We are building an at-home barber marketplace, **Israel-first (Hebrew-only, full RTL)**, with a **small team** on a tight budget. The founding documents (Software Architecture, Engineering Blueprint, Technology Stack, Engineering Constitution) lock the shape of the system: an **appointment-based marketplace with lean on-demand**, built as a **modular monolith**, **TypeScript everywhere**. This ADR records the concrete repository decisions made while scaffolding the foundation (Epic E1).

## Decision
1. **Monorepo.** One repository holds `apps/` (customer-mobile, barber-mobile, admin-web), `backend/` (the modular monolith), `packages/` (shared internal packages), plus `infrastructure/`, `config/`, `docs/`, `tests/`, `scripts/`, `assets/`. Rationale: maximizes shared contracts/types/i18n reuse and atomic cross-cutting changes for a small team.
2. **Modular monolith; modules are folders, not services.** `backend/modules/*` are bounded-context folders assembled only at the composition root (`backend/app/`). One deployable at launch; a context is extracted into its own service only if scale demonstrably forces it.
3. **TypeScript everywhere**, strict mode from commit one (`tsconfig.base.json`).
4. **npm workspaces** as the workspace manager (built-in, boring). *Open item:* pnpm is a reasonable alternative for TS monorepos; revisit before heavy tooling investment.
5. **Package scope `@barber-marketplace/*`** for all internal packages and the backend workspace.
6. **Backend module system = CommonJS / Node resolution** (conventional, battle-tested NestJS), a deliberate, documented divergence from the shared base's `NodeNext`. Each workspace selects the module system appropriate to its runtime (RN/Next have their own bundlers).
7. **Cross-module access via published contracts only** (`packages/*`); no reaching into another module's internals.

## Consequences
- A new engineer clones one repo, runs one bootstrap command, and sees the whole system.
- Shared Hebrew/RTL/i18n utilities and API/event/domain contracts live in `packages/*` and are reused everywhere — critical for Hebrew-first consistency.
- The monolith stays operationally simple (one deployable) while the hard internal boundaries preserve the option to extract services later without a rewrite.
- Divergent per-workspace `tsconfig` (backend CommonJS vs base NodeNext) must be kept intentional and documented.

## Alternatives considered
- **Polyrepo** — rejected: fragments shared contracts and slows a small team.
- **Microservices from day one** — rejected: operational overhead a small team can't sustain; premature (appointment-based load is modest).
- **pnpm workspaces** — viable; deferred as an open item rather than adopted now.

## Notes
- Provenance note (Sprint 1): during E1, the backend composition-root and config files (`app.module.ts`, `main.ts`, `backend/package.json`, `tsconfig.json`, `nest-cli.json`) were found already present and were verified correct and adopted rather than rewritten. Provenance to be confirmed on first clone into the real environment.
