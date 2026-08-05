# ADR-002: Partition-readiness, money invariants, and category-first provider naming

## Status
Accepted (Epic E3). The provider-naming decision is flagged for explicit product/tech-lead confirmation at E3 approval.

## Context
Three foundational modeling decisions arise in the core schema.

## Decisions

### 1. Zone/category partition-readiness (not physical partitioning yet)
`zone_id` and `category_id` are **mandatory first-class columns** on all zone/category-scoped tables and **lead** the hot-path composite indexes (e.g. `professional_profiles (primary_zone_id, category_id)`). Physical declarative partitioning (`PARTITION BY LIST(zone_id)` / by time) is **deferred** — with one launch zone it adds complexity for no benefit. The schema is partition-*ready*, so a future re-partition is an operation, not a rewrite (blueprint principle #17).

### 2. Money invariants (reserved; realized in the Ledger epic)
Money is stored as **integer minor units** (agorot; ILS) — never floats. The double-entry ledger is **append-only** and the source of truth; balances are derived. No money tables exist in E3; these invariants are reserved conventions (see backend/database/README.md) applied when the Payments/Ledger epic lands.

### 3. Category-first provider naming — `professional_profiles`, not `barber_profiles`
The blueprint's conceptual entity list names `BarberProfile`, but its own principle #18 makes service **category** first-class ("barbers = one instance… later categories plug in without a rewrite"). Baking `barber` into the table/role name would violate that principle. The provider account is therefore modeled category-agnostically as **`professional_profiles`** with a mandatory `category_id` (seeded `barber` for V1), and the identity role is **`professional`** (aligning with E5's approved RBAC role set). This reconciles the two approved statements in favor of the stated architectural principle.

## Consequences
- No painful re-partition or category rewrite later.
- Ledger epic inherits explicit money invariants.
- **Flag:** if the product owner prefers the literal `barber_*` naming, this is a small pre-approval migration — raised in the E3 report for sign-off.
