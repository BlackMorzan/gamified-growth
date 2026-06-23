# Baby Skill Tree — Project Brief

> **Project overview, phase roadmap/status, stack, and the data model live in [`README.md`](./README.md).** This file holds the working instructions that steer how code is written. When the roadmap or stack changes, update the README, not this file.

Quick orientation: an **offline-first PWA** tracking a baby's developmental milestones (0–24 months) as a gamified skill tree. ~95% static data, ~5% user-owned data in localStorage. **Phase 2b is complete; Phase 2c (PWA / service worker / Lighthouse) is next.** The canonical data model + skill schema is [`src/data/skills.ts`](./src/data/skills.ts); user data types (`BabyProfile`, `AcquiredSkill`, `PersistedUserData`) live in [`src/types/user.ts`](./src/types/user.ts).

---

## Priorities (in order)

1. **Offline-first correctness** — app must work fully without a network connection; service worker caching is not optional
2. **Simple, readable code** — prefer clear over clever; a parent developer should be able to follow it
3. Type safety where it adds clarity, not where it adds noise

---

## Code Conventions

- Use Vue 3 `<script setup>` syntax throughout
- Composables in `src/composables/`, stores in `src/stores/`, skill data in `src/data/`
- Static skill data lives in plain `.ts` files (not fetched from an API)
- Keep components small; if a component exceeds ~150 lines, split it
- No unnecessary abstractions for Phase 2 — solve the actual problem first
- Fonts are self-hosted in `public/fonts/` — do not add Google Fonts CDN imports (breaks offline-first)
- Run `npm run lint` before committing

---

## What Claude Should Do

- Default to the simplest solution that satisfies Phase 2
- Don't build Phase 3–6 infrastructure speculatively
- If a decision has a meaningful tradeoff, surface it briefly before proceeding
- When generating skill tree data, match the `Skill` schema in `src/data/skills.ts` exactly
- Prefer `const` composables and typed Pinia stores

---

## Installed Plugins — when to reach for them

Three plugins are installed. Use them proactively when the task matches; they are not auto-invoked for everything. **Project-specific overrides below are mandatory — prefer them over any default the plugin suggests.**

### Vue work → `vue-development`
- **Use for:** authoring or planning any Vue component, composable, or `<script setup>` block. TS-first patterns: `defineProps<{}>()`, typed `defineEmits`, `defineModel<T>()`, `useX` composables.
- **Overrides:**
  - **Routing** — this project uses plain `vue-router` via `src/router/index.ts`. **Ignore the skill's file-based routing (`unplugin-vue-router`, `[param].vue`) guidance.**
  - **Testing** — when tests exist, use Vitest + Testing Library, but **do NOT use MSW**: this app has no API. Mock `localStorage`, not HTTP.

### TypeScript / JS → `javascript-typescript`
- **Use for:** advanced types on the skill graph, modern JS patterns, test infra setup.
- Useful skills: `typescript-advanced-types`, `modern-javascript-patterns`, `javascript-testing-patterns` (Vitest).
- Agents: `typescript-pro`, `javascript-pro` (via the Agent tool for deeper, isolated work).
- **Ignore:** `nodejs-backend-patterns` — no backend until Phase 4.

### UI / UX / accessibility → `ui-design`
- **Use for:** building UI components, accessibility audits, interaction/motion polish.
- Useful skills: `web-component-design` (Vue), `interaction-design` (matches our animate-on-acquire + "new" badge decisions), `accessibility-compliance` / `visual-design-foundations` / `responsive-design`.
- Commands: `/ui-design:create-component`, `/ui-design:accessibility-audit`, `/ui-design:design-review`.
- Agents: `ui-designer`, `accessibility-expert`, `design-system-architect`.
- **Overrides:**
  - **Design tokens already exist.** Pin `design-system-architect` / `design-system-setup` to `src/assets/tokens.css` and the Design Direction section below. **Do NOT green-field a new palette** over the Civ-6 direction.
  - **Ignore** `mobile-ios-design`, `mobile-android-design`, `react-native-design` — this is a web PWA, not a native app.

### Gaps (no plugin covers these — handle directly, anchored to this file)
- **PWA / service worker / Lighthouse** (Phase 2c) — hand-rolled with `vite-plugin-pwa`.
- **Android** — our target is the PWA in Chrome-on-Android, i.e. web work; there is no native Android tooling here.

---

## Design Direction

### Target User
**Gamer parents** — dads and moms who enjoy games and want to track their baby's development in a gamified way. They appreciate systems, progression, and visual feedback. They are not looking for a medical tool or a cute baby scrapbook.

### Visual Tone
**Gamified, structured, warm — not infantile, not clinical.**

Primary reference: **Civilization 6 UI.**
- Strong sense of *progression and unlocking* — skills feel like tech tree nodes
- Rich iconography and clear visual states (locked / available / acquired / milestone)
- Structured panels and cards with clear hierarchy — information-dense but readable
- Warm but not pastel — earthy, slightly desaturated tones with strong accent colors for highlights
- Decorative framing used sparingly to add character without clutter

### What to avoid
- Pastel baby colors (mint, blush, lavender) — too infantile
- Sterile white-and-blue medical aesthetic — too cold
- Cartoon/mascot-driven design — undermines the gamified seriousness
- Excessive animation or bounce effects

### Design System Approach
There is no Figma file. Design lives in code and in this document.

**Before building any UI component**, Claude should reference this section and the design tokens below. Consistency across components is more important than any individual component looking perfect.

### Design Tokens (working draft — to be refined)

```
Typography
  --font-display: 'Cinzel' or similar serif (headings, skill names, milestones) — minimum 16px
  --font-body: 'Inter' or system-ui (body text, evidence lists, dates)
  --font-mono: monospace (IDs, debug info only)

Color palette (earthy, game-adjacent)
  --color-bg:            #1a1a2e   (deep navy — main background)
  --color-surface:       #1e2548   (card surface — visibly lighter than bg)
  --color-surface-deep:  #0f3460   (recessed/inset panels — DARKER than surface, not elevated)
  --color-accent:        #06b6d4   (primary action — teal; NOT danger/error)
  --color-error:         #e94560   (danger, errors, destructive actions only)
  --color-accent-gold:   #f5a623   (milestone highlights, unlocks, XP rewards — use sparingly)
  --color-text:          #eaeaea   (primary text)
  --color-text-muted:    #aab3c4   (secondary text — AA ≥4.5:1 on every card fill, incl. hover #1e4280)
  --color-text-locked:   #909aab   (text on locked cards — AA 4.68:1 on #2d2d48)
  --color-border-subtle: rgba(255,255,255,0.10)  (default card border — use token, not inline rgba)
  --color-focus-ring:    #06b6d4   (keyboard focus outline — 2px solid, 2px offset)
  --color-success-text:  #5bbf7a   (inline confirmations, toasts — earthy green)
  --color-disabled:      #3a3a52   (generic disabled UI elements — distinct from skill-locked)

  Skill states:
  --color-skill-locked:          #2d2d48  (lock icon mandatory — background alone insufficient)
  --color-skill-available:       #1b3a6b  (reachable — distinct from surface-deep #0f3460)
  --color-skill-available-hover: #1e4280  (hover/focus state)
  --color-skill-acquired:        #1a4731  (completed — dark green)
  --color-skill-acquired-border: #42a873  (acquired card border — 3.56:1 on #1a4731, AA non-text ≥3:1)
  --color-skill-milestone:       #4a3000  (milestone — gold-tinted)

Spacing scale (4px base)
  --space-1: 4px   --space-2: 8px   --space-3: 12px
  --space-4: 16px  --space-5: 20px  --space-6: 24px  --space-8: 32px  --space-12: 48px

Radius
  --radius-sm: 4px    (inputs, tags)
  --radius-md: 8px    (cards, panels)
  --radius-lg: 16px   (modal sheets, large surfaces)

Borders
  Default:    1px solid --color-border-subtle
  Available:  1px solid --color-accent (#06b6d4)
  Acquired:   1px solid --color-skill-acquired-border (#42a873)
  Milestone:  1px solid --color-accent-gold (#f5a623)
  Focus/active: --color-accent full opacity + box-shadow glow rgba(6,182,212,0.25)
```

### Skill State Visual Language
Every skill node must visually communicate its state at a glance:

| State | Background | Border | Text | Icons | Notes |
|-------|-----------|--------|------|-------|-------|
| Locked | `#2d2d48` | subtle | `--color-text-locked` | 🔒 mandatory | Lock icon carries the state — bg alone too close to surface |
| Available | `#1b3a6b` | teal `--color-accent` | primary | ◎ | Teal border is primary differentiator |
| Available (hover) | `#1e4280` | teal + glow | primary | ◎ | box-shadow `rgba(6,182,212,0.25)` |
| Acquired | `#1a4731` | `--color-skill-acquired-border` | primary | ✓ | Acquisition date visible |
| Milestone (available) | `#4a3000` | gold `--color-accent-gold` | gold | ★ | |
| Acquired Milestone | `#4a3000` | gold `--color-accent-gold` | gold | ★ ✓ | Gold wins — milestone bg/border always override green |

### Design Decisions (settled)

- **`strengthens[]` relationship** — data-model only in Phase 2; not surfaced in UI. Revisit Phase 3.
- **Evidence list** — must be accessible via card tap/expand on every skill card. This is the app's primary educational value and cannot be hidden.
- **First-run flow** — baby profile (name + birthDate) gates the skill tree. BirthDate drives all age calculations; tree must not render without it.
- **Mark-as-acquired flow** — must complete in ≤3 taps. Pre-fill today's date, allow override. After confirm: animate card state change + reveal newly unlocked skills.
- **Lock icon context** — in Phase 2, all locked skills use the same visual. Add "requires: [skill name]" on tap for locked cards. Post-Phase 2: consider a distinct visual for skills where baby is within `typical_age_months` but prerequisites unmet (different emotional register from far-future locked skills).
- **Newly-available highlight** — on session end, `useProfileStore.saveSessionSnapshot(availableIds)` writes `prevSessionAvailableIds` (a `string[]`) to `PersistedUserData` in localStorage. On next visit, `useTechTreeStore.newlyAvailableIds` diffs current available set against that snapshot. Skills that became available since last visit get a transient "new" badge. Implemented and shipped in Phase 2b.

---

## Out of Scope (for now)

- Authentication / user accounts
- Backend / API
- Sharing or sync
- Media attachments (images/video per skill)
- i18n setup (though don't make it actively hard to add later)

## Nice to Have (post-Phase 2)

- **Achievements** — meta-rewards on top of the skill tree; e.g. "First Steps" for acquiring the first motor skill, "Renaissance Baby" for unlocking skills across 3 domains, "Speed Runner" for acquiring a skill earlier than the typical age range. Distinct from milestones (which are part of the static skill tree data) — achievements are emergent, triggered by patterns in the user's progress. Should feel like Steam/Xbox achievements: icon, name, short flavour text, unlock date.