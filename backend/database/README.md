# backend/database

Transactional core schema, migrations, and seeds for the shared relational store (PostgreSQL, per the locked stack — ACID for booking/ledger correctness).

## Layout
- `migrations/NNNN_<name>/up.sql` + `down.sql` — ordered, **reversible** schema changes.
- `seeds/NNNN_<name>.sql` — idempotent reference data (`ON CONFLICT DO NOTHING`).

## Migration principles (Engineering Constitution)
- **Expand → migrate → contract.** Every change is backward-compatible and reversible; a compatible release precedes any destructive change. Zero-downtime is the standard.
- Data backfills run as controlled, resumable jobs — never a blocking migration.
- Migrations touching money/booking/auth require two reviewers (one senior).

## Runner
Migrations are plain SQL so they are runner-agnostic. Recommended runner: **node-pg-migrate** in SQL mode (first-class up/down, transaction-per-migration) — wired into `backend/package.json` and CI in the real environment (blocked in the authoring sandbox: no npm registry access). Each migration executes atomically (runner wraps it in a transaction; for manual runs use `psql --single-transaction -f up.sql`).

## Run (real environment)
```bash
# apply / rollback the latest migration, then seed
npm run db:migrate up        # forward
npm run db:migrate down      # reverse (verifies reversibility)
psql "$DATABASE_URL" -f backend/database/seeds/0001_tel_aviv_and_barber.sql
```
CI must run **forward then back then forward** to prove reversibility (DoD).

## Reserved placeholders (created WITH their tables in later epics — NOT here)
- **`UNIQUE (professional_id, slot)`** — barber-slot conflict prevention → Booking engine epic.
- **Money invariants** — amounts stored as **integer minor units** (agorot; ILS), `CHECK (amount >= 0)` where applicable, and a double-entry **append-only** ledger as source of truth → Payments/Ledger epic (see ADR-002).
- **Hot-path indexes** `(professional_id, start_time)`, `(customer_id, start_time)`, `(zone_id, date)`, review aggregates, address geo-index (PostGIS/GiST) → their respective epics.

## Backup / replication (S3.3)
- **Automated encrypted backups + PITR** are already provided by the E2 `database` Terraform module (`backup_retention_period = 7`, `storage_encrypted = true`) — no E2 reopen needed.
- **Read-replica baseline** and a **test-restore drill** are real-environment DevOps tasks (a replica is a small addition to the frozen `database` module, applied during real-env validation; a restore drill is inherently a live exercise). Documented, not executed here.
