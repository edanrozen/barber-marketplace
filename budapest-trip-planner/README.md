# 🇭🇺 Budapest AI Trip Planner

A real-time **decision engine** for the trip, not a list of attractions. Given
where you are, what time it is, how much free time you have, and how you
feel, it picks **one** place and tells you why — not twenty.

This is a standalone app inside the `barber-marketplace` repo (unrelated
product, own dependencies, own `npm install`) so it doesn't inherit that
repo's Hebrew-string-in-JSX CI gate or its workspace lockfile. It lives at
the repo root, outside `apps/`, on purpose.

## Status: architecture phase

Per the brief, **no real places or itinerary are in this build yet.** What's
here is the full skeleton — data models, state, navigation, UI, and a
working recommendation engine — ready for real data to be dropped in.

- `src/data/places.seed.ts` — empty `Place[]`. Add real places here (see the
  shape comment in that file), or push them into `usePlacesStore` at runtime.
- `src/data/trip.seed.ts` — one empty day. Add real days/schedule items here.

Everything else — catalog, filters, the "מה עושים?" flow, the recommendation
engine — activates automatically once real `Place`/`TripDay` data exists;
nothing else needs to change.

## Stack

Vite + React 18 + TypeScript (strict, `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`) + Tailwind CSS + Zustand (state, persisted to
`localStorage`) + React Router + Framer Motion + Lucide icons. RTL/Hebrew is
the fixed default (`<html lang="he" dir="rtl">`), not a locale switch — this
app has one audience.

Chosen for "easy to run, test, and update fast": no backend, no build step
beyond Vite, hot reload, plain `npm install && npm run dev`.

## Running it

```bash
cd budapest-trip-planner
npm install
npm run dev       # http://localhost:5173
npm run typecheck # tsc -b, no emit
npm run build     # production build to dist/
```

## Architecture

```
src/
  types/          Place, TripDay/ScheduleItem, UserState, Recommendation — the data contracts
  data/            Seed data (currently empty — see above)
  store/           Zustand stores: usePlacesStore, useTripStore, useUserStateStore
  engine/          The recommendation engine (see below)
  lib/             time (Budapest-local clock, opening hours), distance (haversine, walk ETA), tripSchedule
  components/      layout/ (shell, nav), home/, trip/, catalog/, common/
  pages/           HomePage, TodayPage, CatalogPage, PlaceDetailPage, UserStatePage
```

### Data model (`src/types/`)

- **`Place`** — the catalog entity: category, coordinates, opening hours,
  price level, duration, mood/energy/group fit, `status` (`AVAILABLE` /
  `DONE` / `SKIPPED` / `NOT_RELEVANT` / `CLOSED` / `BOOKING_REQUIRED`),
  `visited`.
- **`TripDay` / `ScheduleItem`** — the day's fixed skeleton (`type: 'fixed'`,
  real commitments) plus the windows the engine may fill (`type:
  'free_time'`). Each item also carries a display status (`confirmed` 🟢 /
  `suggested` 🟡 / `flexible` ⚪ / `cancelled` 🔴) for the Today screen.
- **`UserState`** — the live snapshot the engine reads every time: location,
  hunger/thirst/energy, mood, budget, group size, weather. Edited from the
  "המצב שלנו" screen (`/state`); persisted, except the clock, which is always
  read live via `Europe/Budapest` so planning-ahead-of-time from Israel still
  reflects Budapest local time.

### State management (`src/store/`)

Three independent Zustand stores, each persisted to `localStorage` under its
own key so they can evolve/reset independently:

- `usePlacesStore` — the catalog + `setStatus` / `toggleVisited` / `addPlace`.
- `useTripStore` — the trip plan + which day is "today" + schedule mutation.
- `useUserStateStore` — the live user snapshot + a single `set(patch)`.

No global store, no context providers — components subscribe to just the
slice they need. This is intentionally the simplest thing that could work;
swapping `persist` for a real backend later is a one-line change per store
without touching any component.

### Recommendation engine (`src/engine/`)

Two-phase pipeline, run fresh on every mood selection:

1. **`filterCandidates`** (hard filters — a place either is or isn't an
   option right now): status must be `AVAILABLE`, category must match the
   selected mood (unless "תפתיע אותי"), opening hours must include now
   (places with no hours data yet are *not* excluded — "unknown" ≠
   "closed"), and it must be physically reachable before the next fixed
   commitment.
2. **`scorePlace`** (soft ranking, ~100 points across ten weighted factors:
   mood match, hunger/thirst fit, distance, time-available fit, energy fit,
   budget fit, group fit, weather fit, "haven't been yet", "doesn't need a
   booking") — the highest score wins.

`getRecommendation()` returns the single best match plus up to 3
alternatives (for "תן לי אופציה אחרת", which just excludes the shown id and
re-scores — no extra engine call shape needed) and one generated Hebrew
sentence (`engine/explain.ts`) built from the two or three most relevant
facts. **The user never sees the score or the factor breakdown** — only the
result and the reason, by design.

Everything the brief listed as an input (mood, location, time, free time,
distance, hours, price, group fit, weather, energy, history, booking
requirement, visited-before) is wired into either the filter or the scorer;
none of it is hard-coded per place — it's all read from `Place` +
`UserState` + `TripDay` at call time.

## What's deliberately not built yet

- No schedule/place data-entry UI — the seed files + store actions are the
  extension point for now. Worth building once real data volume justifies a
  form instead of editing a TS file.
- No live weather fetch — `UserState.weather` is a plain field, ready for an
  API call to fill it in.
- No backend — `localStorage` only. Stores are the single seam where a real
  API/DB would slot in later without touching engine or UI code.
