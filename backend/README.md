# backend/

The **modular monolith**. One deployable at launch; hard internal boundaries so contexts can be extracted only if scale forces it.

- `modules/` — bounded contexts (one folder each). **Modules are folders, not services.**
- `workers/` — async jobs (recurring materialization, payouts, notification dispatch, verification polling, reminders, archival)
- `app/` — composition root that wires modules into the deployable (scaffolded in T1.1.2)

Cross-module access goes through published contracts in `packages/` only — never by reaching into another module's internals.
