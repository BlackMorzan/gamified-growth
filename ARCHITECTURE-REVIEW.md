# Architecture Review — 2026-06-12

Multi-agent review of the current scaffold (Phase 1a done, heading to 2a/2b).
Sources: `typescript-pro` (data model), `design-system-architect` (tokens/CSS), `accessibility-expert` (a11y), `vue-development` skill (Vue architecture).

**How to use this file:** work top-down. Each item is self-contained. Fill the `Decision:` line (`accept` / `defer` / `reject` / notes). Tackle High before starting Phase 2a.

Legend: priority **[H]** high · **[M]** medium · **[L]** low.

---

## HIGH — do before / at the start of Phase 2a

### H1 — Data-integrity validator + Vitest test  `[H]` · TypeScript ✅ DONE (2026-06-12)
- [x] **Finding:** `id` / `requires[]` / `strengthens[]` are bare strings; the compiler can't catch a dangling reference, cycle, duplicate ID, self-reference, tier-order violation, or bad age range across the 84 hand-authored skills.
- **Why:** these are the real failure modes of a graph keyed on strings — a typo is a runtime "skill not found," not a type error.
- **Where:** new `src/lib/validateSkills.ts` returning `SkillGraphIssue[]` (`kind`, `skillId`, `detail`); test `src/data/__tests__/skills.spec.ts` asserting it returns `[]`. (`tsconfig.app.json` already excludes `__tests__`.)
- **Action:** install Vitest; write validator + test. Covers dangling refs, cycles, dup IDs, self-ref, tier order, age sanity. Highest ROI change; also answers the "should we add testing" question.
- **Decision:** ACCEPTED & DONE. Vitest 4.1.8 installed; `src/lib/validateSkills.ts` + `src/data/__tests__/skills.spec.ts` added; `npm test` scripts wired. The real 84-skill data passes clean (4/4 tests green); validator self-checks confirm it catches each issue class.

### H2 — Fix the false AA-contrast tokens (+ correct the comments)  `[H]` · Accessibility
- [x] **Finding:** measured ratios contradict the "AA compliant" claims in `tokens.css` / CLAUDE.md:
  - `--color-text-locked #6b7585` on `--color-skill-locked #2d2d48` = **2.85:1** (needs 4.5) — locked card **name**.
  - `--color-text-muted #9aa3b4` on acquired `#1a4731` = **4.16:1** — the acquired **date** (load-bearing).
  - `--color-text-muted` on available `#1b3a6b` = **4.44:1** — age text.
  - `--color-skill-acquired-border #2d7a4f` on acquired fill `#1a4731` = **2.01:1** (needs 3:1 non-text) — the acquired-state differentiator is nearly invisible.
- **Why:** fails WCAG AA on primary content; the spec actively claims the opposite, so it'll propagate.
- **Where:** `src/assets/tokens.css` (token values + comments), used in `src/views/HomeView.vue`.
- **Action:** lighten `--color-text-locked` (~`#8b94a5`); use `--color-text` (not muted) for age/meta on dark card fills, or bump muted (~`#a6afc0`); brighten `--color-skill-acquired-border` (~`#3a9968`+). Correct the inaccurate comments. **Verify ratios independently first.**
- **Decision:** DONE. Bumped tokens (verified all ratios with WCAG math against every card fill):
  - `--color-text-locked` `#6b7585`→`#909aab` (2.85→**4.68** on `#2d2d48`).
  - `--color-text-muted` `#9aa3b4`→`#aab3c4` — bumped the shared token rather than swapping to `--color-text` per-card; now clears AA on *all* fills incl. hover `#1e4280` (worst case 4.64), acquired (5.00), available (5.34). Lighter text only raises contrast elsewhere, so no regressions.
  - `--color-skill-acquired-border` `#2d7a4f`→`#42a873` (2.01→**3.56** on `#1a4731`). Note `#3a9968` from the suggestion was 2.98 — just *under* 3:1, so went brighter.
  - Corrected the false "AA compliant" comments in both `tokens.css` and CLAUDE.md. No hardcoded hexes in `src/` — fix propagates via tokens.

### H3 — Graph-derivation layer (pure module → thin composable)  `[H]` · TypeScript + Vue
- [ ] **Finding:** `unlocks[]` (invert `requires[]`), per-skill availability, and "newly-unlocked" all depend on logic that doesn't exist yet.
- **Why:** every UI state (locked/available) and the acquire-reveal flow hinge on it.
- **Where:** pure static inversion in `src/lib/skillGraph.ts` (computed once at module load, `readonly` lookups: `unlocksById`, `getUnlocks(id): readonly Skill[]`, `getRequirements(id)`). Reactive layer in `src/composables/useSkillGraph.ts` that overlays the acquired-set from the store.
- **Action:** build the pure module first (resolves the two agents' module-vs-composable tension — pure data logic ≠ Vue reactivity), then the composable. Keep "is available given acquired set" in the composable, not the module.
- **Decision:**

### H4 — Shared types for state + user data  `[H]` · TypeScript
- [ ] **Finding:** no `SkillState` type; `BabyProfile`/`AcquiredSkill` exist only in prose.
- **Where:** `SkillState = 'locked' | 'available' | 'acquired' | 'milestone' | 'acquired-milestone'` and `SkillWithState` in `src/data/skills.ts` or `src/types.ts`; user interfaces in `src/types/user.ts`.
- **Action:** define before building components so card props are typed.
- **Decision:**

### H5 — Decompose HomeView; choose SkillCard architecture  `[H]` · Vue + Design System
- [ ] **Finding:** `HomeView` hardcodes 5 cards + all card CSS inline. The 6 states are the same structure swapping bg/border/accent.
- **Where:** new `src/components/SkillCard.vue`, `DomainSection.vue`, `SkillTree.vue`; move card CSS out of `HomeView`.
- **Action:** **single `SkillCard.vue` + `state` prop + computed mapping to existing `--color-skill-*` tokens** (inline custom properties), NOT a BEM modifier-class explosion. Structurally fixes the "gold wins" override and removes the dead `--acquired-milestone` class. Children emit intent (`select`), parents call store actions. Keep `<150` lines.
- **Decision:**

### H6 — Make cards real `<button>`s  `[H]` · Accessibility
- [ ] **Finding:** the available card is `<div tabindex="0">` — focusable but no role, no Enter/Space handler, no accessible name (fails WCAG 4.1.2 + 2.1.1). Only available is reachable, yet **every** card must expand to its evidence list (locked → "requires: …").
- **Where:** all `.skill-card` in `HomeView` → `SkillCard.vue`.
- **Action:** make every interactive card a `<button>` (or `role=button` + key handling) with a composed `aria-label` (state + name + age + acquired date); mark emoji glyphs `aria-hidden`. Set this primitive now, before ×84.
- **Decision:**

### H7 — Resolve tree-layout strategy (the open ⬜)  `[H]` · Design System
- [ ] **Finding:** smoke test uses flat `flex-wrap` with fixed 160px cards — says nothing about arranging the `requires[]` dependency graph across 4 domains. CLAUDE.md flags "Tree layout design ⬜" as open.
- **Why:** building `SkillCard` against a throwaway grid risks redoing layout. This is the real 2a blocker, not styling.
- **Action:** decide the container strategy (grid-by-tier? domain columns? keyboard-first, see H6/M9) before mass-rendering.
- **Decision:**

---

## MEDIUM

### M1 — Add missing non-color tokens  `[M]` · Design System
- [ ] **Finding:** code hardcodes values that will fan out across 84 cards + panels/modals:
  - **transition/timing** — inline `0.15s` in `.skill-card`; blocks consistent 2b animation, should encode the "no bounce" rule.
  - **focus/glow shadow** — `box-shadow: 0 0 8px rgba(6,182,212,0.25)` hardcoded; spec already treats this glow as canonical.
  - **z-index ladder** — modals + evidence popover + toast + "new" badge all stack; no `--z-*` scale.
  - **typography scale** — five font-sizes + three letter-spacings inline in `HomeView`; encode the spec's "display ≥16px" floor.
- **Where:** `src/assets/tokens.css`.
- **Action:** add tokens, anchored to existing names; replace the inline literals.
- **Decision:**

### M2 — Stores + validating localStorage layer  `[M]` · TypeScript + Vue
- [ ] **Finding:** `JSON.parse` returns `any`; a casual `as BabyProfile` lets corrupted/old-shape data through a strict, offline-first app.
- **Where:** `src/stores/profile.ts` (`profile`, `hasProfile`, `ageInMonths`), `src/stores/acquired.ts` (`Map<skillId, AcquiredSkill>`, O(1) lookups); `src/lib/storage.ts` typed wrappers.
- **Action:** storage wrapper validates parsed shape (a few `typeof` checks, not Zod), returns `null`/`[]` on bad/missing data (don't throw → no white-screen), carries a `version` field, drops unknown `skillId`s on load. Persist via a ~30-line custom Pinia plugin (`src/stores/persist.ts`) registered in `main.ts` — not a third-party dep, never `localStorage` calls in components. Wrap reads/writes in try/catch (private-mode/quota).
- **Decision:**

### M3 — Profile gate = conditional render, single route  `[M]` · Vue
- [ ] **Finding:** birthDate must gate the tree.
- **Action:** `v-if="profileStore.hasProfile"` → `<SkillTree/>`, `v-else` → `<ProfileGate/>` in `HomeView`. Keep the single `{ path: '/', component: HomeView }`. A route guard / `/setup` route is over-engineering until Phase 3+.
- **Decision:**

### M4 — Plan the accessible acquire/expand flow  `[M]` · Accessibility
- [ ] **Finding:** the ≤3-tap acquire step + evidence expand need an accessible interaction contract.
- **Action:** evidence expand = disclosure (`aria-expanded` + `aria-controls`); acquire = `role=dialog` + `aria-modal`, focus moved in + trapped + restored to originating card on close. Add an `aria-live="polite"` region announcing "X acquired, N new skills unlocked." Design before building, not after ×84.
- **Decision:**

### M5 — `prefers-reduced-motion` as a standing rule  `[M]` · Accessibility
- [ ] **Finding:** the planned acquire/unlock-reveal animation is a vestibular risk (WCAG 2.3.3).
- **Action:** wrap all motion in `@media (prefers-reduced-motion: reduce)` with an instant-state fallback; add to global CSS/tokens now as a rule, before the animation exists.
- **Decision:**

### M6 — Test infrastructure  `[M]` · Vue + TypeScript
- [ ] **Finding:** no Vitest / Testing Library / happy-dom installed.
- **Action:** add `vitest` + `@testing-library/vue` + happy-dom. **Mock `localStorage`, NOT MSW** (no API). First targets: `useSkillGraph`/`skillGraph` (pure, trivial) + the stores. (H1's validator test is the first consumer.)
- **Decision:**

---

## LOW

### L1 — Focus-ring contrast  `[L]` · Accessibility
- [ ] `.skill-card--available:focus-visible { outline: none }` swaps to a faint `rgba(6,182,212,0.25)` glow that may fail focus-indicator contrast (WCAG 2.4.11/2.4.13). Use the existing `--color-focus-ring` (7.03:1 on bg) as a real 2px outline. **Decision:**

### L2 — Roving-tabindex grid nav  `[L]` · Accessibility
- [ ] 84 sequential tab stops is poor. Plan arrow-key roving-tabindex (ARIA grid pattern) when designing the tree layout (ties to H7). **Decision:**

### L3 — Dead CSS + token housekeeping  `[L]` · Design System
- [ ] Remove the inert `.skill-card--acquired-milestone` class (or fold into the H5 state resolver). Group `tokens.css` with comment headers (colors / skill-states / spacing / radius / typography / motion) — readability only, do NOT split into primitive/semantic files at this scale. **Decision:**

### L4 — Minor type ergonomics  `[L]` · TypeScript
- [ ] Optional `AgeRange` interface for `typical_age_months` (readability/reuse). Keep `noUncheckedIndexedAccess` ON — it's what pushes `undefined`-handling into the graph/storage boundaries. Do **not** brand/template-literal skill IDs (wrong cost/benefit; H1 validator is the right mechanism). **Decision:**

### L5 — Date-reactivity strategy  `[L]` · Vue
- [ ] `ageInMonths` and "available since last session" both read "now"; `new Date()` is not reactive. Decide compute-on-mount vs. clock ref explicitly and document, so it isn't accidentally assumed reactive. **Decision:**

---

## Suggested sequencing
1. **H1 + H2** together — small, self-contained, verifiable; stands up testing + fixes real a11y bugs.
2. **H4 → H3** — types, then the graph layer they enable.
3. **H7** — decide layout (keyboard-first, ties to L2).
4. **H5 + H6** — build `SkillCard` correctly once (component + token-driven states + `<button>` semantics).
5. **M1** — add tokens as you hit the hardcoded values during H5.
6. Then M2/M3 (stores + gate) → Phase 2b proper, with M4/M5 planned in.

_Review only — no code changed. Delete or archive this file once worked through._
