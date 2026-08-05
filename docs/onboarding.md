# Onboarding Guide

Welcome. This repository is a **locked, heavily-designed system**. Your job is to **implement within the design**, not to redesign it. Read this, then read the authorities below before writing code.

## What we're building
An at-home barber marketplace. **Israel-first: Hebrew-only, full RTL.** Appointment-based (scheduled + recurring) with a **lean on-demand** option (broadcast → first-accept-wins; no optimizer/surge/ML). **TypeScript everywhere; modular monolith.**

## Get started
1. Clone the repo.
2. Ensure Node ≥ 20 (see `.nvmrc`).
3. Run `npm run bootstrap` (installs all workspace dependencies — requires npm-registry access).
4. Read the authorities (below) for the area you'll touch.

> Note: full build/test/lint verification runs in the real dev environment and CI/CD. The initial scaffold was authored in an offline sandbox where framework packages could not be installed — see per-task notes and ADRs.

## Repository layout
| Path | Purpose |
|---|---|
| `apps/` | `customer-mobile`, `barber-mobile` (React Native/Expo), `admin-web` (Next.js + Refine) — all Hebrew/RTL |
| `backend/` | Modular monolith: `modules/*` (bounded contexts, **folders not services**), `workers/`, `app/` (composition root) |
| `packages/` | Shared internal packages: `domain-contracts`, `event-contracts`, `api-contracts`, `validation`, `i18n`, `errors`, `ui-kit` |
| `infrastructure/` `config/` `docs/` `tests/` `scripts/` `assets/` | IaC · config (no secrets) · ADRs & docs · cross-module tests · scripts · static assets |

## The authorities (obey in this order)
1. **Engineering Constitution** — how we build.
2. The relevant **module TDD** (e.g., Booking Engine TDD).
3. **Engineering Blueprint** / **Software Architecture**.
4. **Technology Stack** (locked).
5. The module's **README** and the shared **contracts** in `packages/`.
6. The **AI Engineering Playbook** (required reading for AI agents).

## The rules you will never break
Correctness over cleverness for money & scheduling · idempotency on every write · modules are folders (cross only via contracts) · zone/category on everything · **no hard-coded user-facing strings (i18n only, Hebrew)** · money in integer minor units, only through the ledger · no new dependency or infrastructure without justification · no scope beyond the current sprint · security by default.

## Workflow
Read → reuse → smallest correct change → test (incl. concurrency for writes, Hebrew/RTL where user-facing) → self-check the PR checklist → small, single-purpose PR (Conventional Commits). Two senior reviewers for Payments/Booking/On-Demand/Auth/migrations; no self-merge there.

## If code conflicts with the design
Stop. Don't work around it. Follow the design, and escalate — especially for money, ledger, booking, auth, or safety. When unsure, ask. Never guess or fabricate.
