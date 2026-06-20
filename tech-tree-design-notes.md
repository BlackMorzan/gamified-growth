# Skill Tech Tree — Implementation Spec

Vue 3 PWA component set rendering one Civ-6-style tech tree per skill domain. Implementation spec only — see `CLAUDE.md` for project-wide conventions (Pinia, `<script setup>`, design tokens, evidence-list/lock-reason/new-badge/mark-as-acquired requirements, which this component must satisfy).

## Repo landmarks

Start here before writing any code. These are the only files that matter for M0–M6.

| What | Path | Notes |
|------|------|-------|
| Skill schema + all 84 skills | `src/data/skills.ts` | `Skill` interface, `SkillDomain`, `SkillCategory`, `skillById` Map (already exported — **import, don't recompute**) |
| Design tokens | `src/assets/tokens.css` | All colors, spacing, radius — no new palette |
| Stores directory | `src/stores/` | Empty (`.gitkeep` only) — nothing to reuse |
| Composables directory | `src/composables/` | Empty (`.gitkeep` only) — nothing to reuse |
| Existing components | `src/views/HomeView.vue`, `src/App.vue` | Only 2 Vue files exist |
| Router | `src/router/index.ts` | Single route `/` → `HomeView`; add `/tree` in M3 |

---

## Build order

Each milestone depends on the previous one. Sections below are the reference detail for each step.

**M0 — Search before writing anything**
- [x] Check the [Repo landmarks](#repo-landmarks) table above first — it summarises what exists so re-reading whole directories is unnecessary.
- [x] Then search for: a `useTechTreeStore` or similarly-named store, any existing `progressOf`/`isLocked`/`isAvailable`/`isAcquired`-style helper, any localStorage read/write wrapper for `PersistedUserData`, any edge/graph-traversal utility over `requires[]`, and any components already named `TechNode`/`TechTree`/`TechConnection`/similar.
- [x] If something equivalent already exists: reuse or extend it, don't duplicate. Reconcile differences explicitly in the commit message.
- [x] Re-run at the start of each milestone — code added in an earlier milestone counts as "existing" for later ones.

**M1 — Schema**
- [x] Add `row: number` to `Skill` in `src/data/skills.ts` (see Types) — `tier` already exists; `row` is the new lane field.
- [x] Hand-author `tier`/`row` for all 84 skills (PM×24, CO×20, LC×20, SE×20), scoped per-domain. This is a real authoring task — block out time for it. Values are integers; rows start at 1 per domain, tiers start at 1 per domain.

**M2 — Stores**
- [x] `useProfileStore` first (prerequisite for the tech tree store): owns the `PersistedUserData` blob in `localStorage`, exposes `profile`, `acquired`, `acquire(skillId, date)`, `unacquire(skillId)`, and `prevSessionAvailableIds` (see New-badge mechanism below).
- [x] `useTechTreeStore`: `acquiredIds`, `progressOf`, `acquiredDateOf`, `edges`, `newlyAvailableIds` (see Store section). Import `skillById` from `src/data/skills.ts` — do not recompute it.
- [x] Unit test: `progressOf` returns correct state given a fixture `requires[]` + `acquired[]`.
- [x] Unit test: `edges` only derives from `requires[]`, never `strengthens[]`.
- [x] Unit test: `newlyAvailableIds` returns skills that are `available` this session but were not in `prevSessionAvailableIds`.

**M3 — Render one tree (no nav yet)**
- [ ] Add route `/tree` → `SkillTreeView.vue` in `src/router/index.ts`. Add a nav link from `HomeView` for now.
- [ ] `TechNode.vue` — renders icon/name/status/milestone overlay from store data, using design tokens. Positioned via pre-calculated grid (see Coordinate strategy).
- [ ] `TechConnection.vue` — renders edges as SVG paths, styled by `fromProgress`. Coordinates from the same grid constants (see Coordinate strategy).
- [ ] `TechTierBand.vue`, `TechTree.vue` — compose the above into one working domain tree (pan/zoom stubbed as `transform: none`).
- [ ] Manually verify against one real domain: positions, lock state, milestone gold overlay all look right before continuing.

**M4 — Node interaction**
- [ ] Bottom sheet on `TechNode.vue` tap: age range, evidence list, lock reason if locked.
- [ ] Mark-as-acquired flow in the bottom sheet (≤3 taps, date pre-fill/override). Calls `useProfileStore.acquire()`.
- [ ] Verify reactive recompute: acquiring a skill updates downstream `progressOf`/`edges` with no manual refresh.
- [ ] "New" badge visible on nodes in `newlyAvailableIds`. On `beforeunload`/`visibilitychange`, `useProfileStore` persists current available set as `prevSessionAvailableIds` for next session.

**M5 — Domain navigation**
- [ ] `SkillDomainTabs.vue` — tab per `SkillDomain` (4 tabs: Physical & Motor, Cognitive, Language & Communication, Social & Emotional); mounts the right `TechTree.vue` per tab. **Tabs-only — no cross-domain progress dashboard.**
- [ ] Verify switching domains doesn't leak state (pan/zoom position, open bottom sheet) between trees.

**M6 — Mobile/PWA polish**
- [ ] `TechTreeControls.vue` — zoom in/out buttons, jump-to-current-tier button. Wired into `TechTree.vue`'s pan/zoom state.
- [ ] Pinch-zoom + pan: real touch handlers replacing M3's stub.
- [ ] Default view centered on the baby's current age tier (derived from `birthDate`).
- [ ] Touch targets ≥44–48px regardless of visual icon size.
- [ ] First-run gate: tree doesn't render without `birthDate` in `useProfileStore.profile`.

---

## Types

```ts
// src/data/skills.ts — existing, add `row`
export interface Skill {
  id: string
  name: string
  domain: SkillDomain
  category: SkillCategory
  tier: number              // column — hand-curated, 1-based per domain
  row: number               // NEW — hand-curated lane within domain tree, 1-based

  requires: string[]        // hard prerequisite ids — drives edges + lock state
  strengthens: string[]     // NOT used for edges or layout — Phase 2 data-only

  milestone: boolean        // orthogonal to progress; gold overlay only
  evidence: string[]

  typical_age_months: { start: number; end: number }
}

export interface AcquiredSkill {
  skillId: string
  acquiredDate: string      // ISO date string
}

export interface PersistedUserData {
  version: 1
  profile: BabyProfile | null
  acquired: AcquiredSkill[]
  prevSessionAvailableIds: string[]  // for new-badge diff; written on session end
}
```

---

## Structure

- One tree per `SkillDomain`. `domain` selects which tree; `tier` is the column axis; `row` is the lane axis inside that domain. No cross-domain rows.
- Position is fully hand-curated: `tier` = column, `row` = lane, both authored directly on each `Skill`. No computed/derived position. No auto-layout step.
- Edges are derived from `requires[]` only, every render, never stored. `strengthens[]` produces no edge.
- Progress state (`locked | available | acquired`) is derived, not stored — no `SkillState` field on `Skill`.

---

## Coordinate strategy

Nodes are positioned using a **pre-calculated grid** — no DOM measurement, no `getBoundingClientRect`. This is deterministic and survives SSR.

```ts
// TechTree.vue — grid constants
const COL_WIDTH = 200   // px per tier column
const ROW_HEIGHT = 120  // px per row lane

function nodeX(skill: Skill) { return (skill.tier - 1) * COL_WIDTH }
function nodeY(skill: Skill) { return (skill.row  - 1) * ROW_HEIGHT }
```

- Nodes: `position: absolute; left: nodeX(skill)px; top: nodeY(skill)px` inside a relatively-positioned scroll container.
- SVG edge layer: same dimensions as the scroll container, `position: absolute; inset: 0; pointer-events: none`.
- Edge anchors: right-center of `from` card → left-center of `to` card (not raw center), so lines emerge from card edges. Offset by `CARD_WIDTH` and `CARD_HEIGHT / 2`.
- `TechTierBand.vue` backgrounds use the same `COL_WIDTH` math and live in the same coordinate space.

---

## Store

### `useProfileStore` (`src/stores/profile.ts`)

Owns `PersistedUserData` in `localStorage` (key `ggg-data`). Exposes:
- `profile: BabyProfile | null`
- `acquired: AcquiredSkill[]`
- `prevSessionAvailableIds: string[]`
- `acquire(skillId: string, date: string): void`
- `unacquire(skillId: string): void`
- `saveSessionSnapshot(availableIds: string[]): void` — called on session end, writes `prevSessionAvailableIds`

### `useTechTreeStore` (`src/stores/techTree.ts`)

```ts
import { skillById, skills } from '@/data/skills'  // import existing Map, don't recompute

const profileStore = useProfileStore()

const acquiredIds = computed(() =>
  new Set(profileStore.acquired.map(a => a.skillId))
)

function progressOf(skill: Skill): 'locked' | 'available' | 'acquired' {
  if (acquiredIds.value.has(skill.id)) return 'acquired'
  const met = skill.requires.every(id => acquiredIds.value.has(id))
  return met ? 'available' : 'locked'
}

function acquiredDateOf(skill: Skill): string | undefined {
  return profileStore.acquired.find(a => a.skillId === skill.id)?.acquiredDate
}

const edges = computed(() =>
  skills.flatMap(skill =>
    skill.requires.map(prereqId => ({
      id: `${prereqId}->${skill.id}`,
      from: skillById.get(prereqId)!,
      to: skill,
      fromProgress: progressOf(skillById.get(prereqId)!),
    }))
  )
)

const newlyAvailableIds = computed(() => {
  const prev = new Set(profileStore.prevSessionAvailableIds)
  return new Set(
    skills
      .filter(s => progressOf(s) === 'available' && !prev.has(s.id))
      .map(s => s.id)
  )
})
```

- `progress` (`locked|available|acquired`) and `skill.milestone` (boolean) are independent inputs to node styling — never merge into one switch. Milestone gold overlay applies to the node only, never to edges.
- Edge color/weight keys off `fromProgress` only.
- Acquired nodes/bottom-sheet must display `acquiredDateOf(skill)`.
- Mock `localStorage` in tests (via `vi.stubGlobal` or a localStorage mock), not HTTP/MSW — there is no API.

---

## Component tree

```
src/router/index.ts
└── /tree → SkillTreeView.vue
    └── SkillDomainTabs.vue        (4 tabs, one per SkillDomain)
        └── TechTree.vue           (one instance per active domain)
            ├── TechTreeControls.vue  (M6: zoom buttons, jump-to-age)
            ├── TechTierBand.vue      (v-for per tier — background band only)
            ├── svg layer
            │   └── TechConnection.vue  (v-for per derived edge)
            └── TechNode.vue           (v-for per node — absolute-positioned)
                └── bottom sheet on tap
```

- `SkillDomainTabs.vue` — 4 tabs (Physical & Motor / Cognitive / Language & Communication / Social & Emotional); mounts one `TechTree.vue` for the active domain. Switching tabs unmounts the previous tree (no state leak).
- `TechTree.vue` — reads `useTechTreeStore`, owns pan/zoom transform state, renders SVG edge layer behind an HTML/div node layer in a shared coordinate space (see Coordinate strategy).
- `TechTierBand.vue` — background band per distinct `tier` value using the same `COL_WIDTH` constant. Visual grouping only.
- `TechNode.vue` — icon, name, status (locked/available/acquired + milestone overlay via design tokens), "new" badge if `id` is in `newlyAvailableIds`. Opens bottom sheet on tap. Split into a child component if it exceeds ~150 lines (evidence-list rendering is the likely candidate). Use `<Teleport to="body">` for the bottom sheet so it escapes the scroll container.
- `TechConnection.vue` — single SVG `<path>` per edge, bezier curve `M x1,y1 C midX,y1 midX,y2 x2,y2`, anchored to card edges using the pre-calculated grid constants, styled by `fromProgress`.
- Bottom sheet — typical age range, evidence list, lock reason (`requires: [skill name]`) if locked, mark-as-acquired action if available.

---

## Mobile/PWA behavior

- Touch targets ≥44–48px regardless of visual icon size.
- Default view centers on the baby's current age tier (derived from `birthDate`), not the full 0–24mo span. Pinch-zoom + pan for navigation.
- Tree must not render without `birthDate` set (first-run gate — check `useProfileStore.profile`).
- All skill-state visuals (colors, borders, lock icon) come from `src/assets/tokens.css` — no new palette.
- **New-badge mechanism:** on app init, `useTechTreeStore.newlyAvailableIds` diffs current `available` set against `profileStore.prevSessionAvailableIds` (a string array persisted in `PersistedUserData`). On session end (`beforeunload` + `visibilitychange`), call `profileStore.saveSessionSnapshot(currentAvailableIds)` to persist the snapshot for the next visit. Badge is not computed per-node — read `newlyAvailableIds` from the store.
- Mark-as-acquired: ≤3 taps total, pre-filled today's date with override, lives in the bottom sheet's confirm action (not a separate modal). On confirm, `profileStore.acquire()` updates and `edges`/`progressOf`/`newlyAvailableIds` recompute reactively — no manual refresh call needed.

---

## Out of scope (Phase 2b)

- `strengthens[]` rendering (data-only).
- Achievements.
- Media attachments per skill.
- Cross-domain progress dashboard.
