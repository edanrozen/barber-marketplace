# ADR-001: Database migration framework

## Status
Accepted (Epic E3).

## Context
The stack locks PostgreSQL and mandates expand-migrate-contract, reversible, zero-downtime schema changes, but pins no ORM or migration tool. Payments/booking correctness requires explicit, reviewable, reversible migrations (two-reviewer gate for money/booking/auth changes).

## Decision
Author migrations as **plain, ordered SQL** with explicit `up.sql` + `down.sql` per change (`migrations/NNNN_<name>/`). Adopt **node-pg-migrate** (SQL mode) as the runner. **No ORM is adopted** in E3 — the data-access layer stays an open decision for a later epic; keeping migrations as raw SQL avoids coupling the schema to an ORM prematurely.

## Consequences
- Reversibility is first-class and explicit (hand-authored down), satisfying the constitution and the E3 DoD (CI runs forward→back→forward).
- Runner is a thin dependency; migrations remain portable if the runner changes.
- Cost: hand-authored down migrations require discipline (offset by the two-reviewer gate).
- Runner wiring (`backend/package.json` script + `pg`/`node-pg-migrate`) is completed in the real environment (npm registry blocked in the authoring sandbox).
