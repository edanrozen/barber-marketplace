# backend/modules/

One folder per **bounded context** (Engineering Blueprint §1). Each module exposes a stable contract and hides its internals.

identity · users · professionals · verification · availability (Capacity — keystone) · scheduling · booking · on-demand · presence · payments (+ ledger) · visit-lifecycle · reviews · portfolio-media · notifications · admin-support · audit · fraud-signals · messaging · search · maps · analytics

Per-module scaffolding and READMEs are added in T1.1.2. Booking Engine has a full TDD; consult a module's TDD/README before writing code in it.
