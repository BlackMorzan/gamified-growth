# Baby Skill Tree — Project Brief

## What This App Is

An **offline-first PWA** that helps parents track their baby's developmental milestones from 0–24 months. The core is a static skill tree (skills that unlock and strengthen each other); user input is minimal: skill acquisition dates, a baby photo, and date of birth.

~95% of the app is static data. ~5% is user-owned data stored locally on device.

---

## Current Status

**Phase 2b is the target.** Everything from 3 onward is future scope.

| Phase | Description | Deliverable | Status |
|-------|-------------|-------------|--------|
| 0 | Scaffold — Vue 3 + Vite + TS + Pinia + Router + ESLint, design tokens, self-hosted fonts | Running app at localhost | ✅ Done |
| 1a | Skill tree schema + ~20 real skills authored | Valid `src/data/skills.ts`, importable | ⬜ Next |
| 1b | Style mockup — tokens, skill card in 4 states, main layout | `palette.html` locked; tree layout designed | 🔄 In progress |
| 2a | Skill tree screen — read-only, browsable, no user data | Vue app renders static skill tree | ⬜ |
| 2b | User input — baby profile + mark skill as acquired | localStorage, fully offline | 🎯 **Target** |
| 2c | PWA shell — installable on Android, passes Lighthouse | vite-plugin-pwa configured | ⬜ |
| 3 | Two locales: Polish + English | i18n | Future |
| 4 | Migrate to web (accounts, backend) | Backend + auth | Future |
| 5 | Media: images/videos per skill | Assets per skill node | Future |
| 6 | Shareable progress across accounts | Sync | Future |

### Phase 1b progress detail

| Item | Status |
|------|--------|
| Design tokens → `src/assets/tokens.css` | ✅ |
| Token reference → `public/palette.html` | ✅ |
| All 5 card states rendered in Vue (`HomeView`) | ✅ |
| Self-hosted fonts (Cinzel + Inter, offline-safe) | ✅ |
| Tree layout design (how 50+ cards arrange) | ⬜ |

---

## Stack

| Tool | Decision | Notes |
|------|----------|-------|
| Vue 3 + Vite | ✅ Installed | Composition API + `<script setup>` throughout |
| TypeScript | ✅ Installed | Strict mode, but don't fight it — loose assertions over 3-line type gymnastics |
| Pinia | ✅ Installed | Worth it for cross-component reactive state; use typed stores |
| Vue Router | ✅ Installed | Single route for now; expands per phase |
| ESLint | ✅ Installed | `eslint-plugin-vue` + `@vue/eslint-config-typescript`, flat config (v9). `npm run lint` to fix, `npm run lint:check` for CI |
| vite-plugin-pwa | ⬜ Phase 2c | Non-negotiable — this is the Phase 2c deliverable |
| localStorage | ✅ For now | User data is tiny (profile + ~50 skill records); no need for IndexedDB yet |
| Dexie.js | ⏸ Deferred | Revisit in Phase 4 when sync/querying/media blobs make it worth the API surface |

If suggesting a swap, briefly explain the tradeoff first. Don't change without flagging it.

---

## Core Data Model

Skills reference each other. This is the most important structure in the codebase:

```ts
interface Skill {
  id: string                    // e.g. "PM001"
                                // PMxxx = Physical & Motor
                                // COxxx = Cognitive
                                // LCxxx = Language & Communication
                                // SExxx = Social & Emotional
  name: string
  domain: SkillDomain           // e.g. "physical_motor"
  category: SkillCategory       // e.g. "gross_motor"
  tier: number                  // rough difficulty/age tier

  requires: string[]            // skill IDs that must be acquired first
  strengthens: string[]         // skills this one supports (soft dependency)
  // unlocks[] is DERIVED — do not author it. Computed at runtime by inverting requires[].

  milestone: boolean            // whether this is a key milestone
  evidence: string[]            // observable behaviors confirming the skill

  typical_age_months: {
    start: number
    end: number
  }
}
```

User data stored separately (locally):

```ts
interface BabyProfile {
  name: string
  birthDate: string             // ISO date
  photoUrl?: string             // base64 data URL — NOT a blob URL (blob URLs die on page close)
}

interface AcquiredSkill {
  skillId: string
  acquiredDate: string          // ISO date
}
```

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
- When generating skill tree data, match the schema above exactly
- Prefer `const` composables and typed Pinia stores

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
  --color-text-muted:    #9aa3b4   (secondary text — raised from #8892a4 to clear AA on card surfaces)
  --color-text-locked:   #6b7585   (text on locked cards — AA compliant on #2d2d48)
  --color-border-subtle: rgba(255,255,255,0.10)  (default card border — use token, not inline rgba)
  --color-focus-ring:    #06b6d4   (keyboard focus outline — 2px solid, 2px offset)
  --color-success-text:  #5bbf7a   (inline confirmations, toasts — earthy green)
  --color-disabled:      #3a3a52   (generic disabled UI elements — distinct from skill-locked)

  Skill states:
  --color-skill-locked:          #2d2d48  (lock icon mandatory — background alone insufficient)
  --color-skill-available:       #1b3a6b  (reachable — distinct from surface-deep #0f3460)
  --color-skill-available-hover: #1e4280  (hover/focus state)
  --color-skill-acquired:        #1a4731  (completed — dark green)
  --color-skill-acquired-border: #2d7a4f  (acquired card border)
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
  Acquired:   1px solid --color-skill-acquired-border (#2d7a4f)
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
- **Newly-available highlight** — store last-session timestamp in localStorage. Skills that became available since last visit get a transient "new" badge until acknowledged. Required before Phase 2b ships.

---

## Out of Scope (for now)

- Authentication / user accounts
- Backend / API
- Sharing or sync
- Media attachments (images/video per skill)
- i18n setup (though don't make it actively hard to add later)

## Nice to Have (post-Phase 2)

- **Achievements** — meta-rewards on top of the skill tree; e.g. "First Steps" for acquiring the first motor skill, "Renaissance Baby" for unlocking skills across 3 domains, "Speed Runner" for acquiring a skill earlier than the typical age range. Distinct from milestones (which are part of the static skill tree data) — achievements are emergent, triggered by patterns in the user's progress. Should feel like Steam/Xbox achievements: icon, name, short flavour text, unlock date.