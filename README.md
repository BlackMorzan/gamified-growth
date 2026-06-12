# Baby Skill Tree

An **offline-first PWA** that helps parents track their baby's developmental milestones from 0–24 months. The core is a static skill tree — skills that unlock and strengthen each other, presented like a game tech tree. User input is minimal: skill acquisition dates, a baby photo, and date of birth.

~95% of the app is static data. ~5% is user-owned data stored locally on device.

> **For contributors:** project conventions, design system, and AI-assistant working instructions live in [`CLAUDE.md`](./CLAUDE.md).

---

## Status & Roadmap

**Phase 2b is the current target.** Everything from Phase 3 onward is future scope.

| Phase | Description | Deliverable | Status |
|-------|-------------|-------------|--------|
| 0 | Scaffold — Vue 3 + Vite + TS + Pinia + Router + ESLint, design tokens, self-hosted fonts | Running app at localhost | ✅ Done |
| 1a | Skill tree schema + real skills authored | Valid `src/data/skills.ts`, importable | ✅ Done |
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

| Tool | Status | Notes |
|------|--------|-------|
| Vue 3 + Vite | ✅ Installed | Composition API + `<script setup>` throughout |
| TypeScript | ✅ Installed | Strict mode, pragmatic — loose assertions over type gymnastics |
| Pinia | ✅ Installed | Typed stores for cross-component reactive state |
| Vue Router | ✅ Installed | Single route for now; expands per phase |
| ESLint | ✅ Installed | `eslint-plugin-vue` + `@vue/eslint-config-typescript`, flat config (v9) |
| vite-plugin-pwa | ⬜ Phase 2c | Installable PWA — the Phase 2c deliverable |
| localStorage | ✅ For now | User data is tiny (profile + ~50 skill records); no IndexedDB yet |
| Dexie.js | ⏸ Deferred | Revisit in Phase 4 when sync/querying/media blobs justify the API surface |

---

## Data Model

Skills reference each other. This is the most important structure in the codebase. The canonical source is [`src/data/skills.ts`](./src/data/skills.ts).

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

User data is stored separately, locally on device:

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

## Project Setup

```sh
npm install
```

### Compile and hot-reload for development

```sh
npm run dev
```

### Type-check, compile, and minify for production

```sh
npm run build
```

### Lint

```sh
npm run lint        # fix
npm run lint:check  # check only (CI)
```

---

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

TypeScript cannot handle type information for `.vue` imports by default, so this project uses `vue-tsc` instead of `tsc` for type checking. In editors, [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) makes the TypeScript language service aware of `.vue` types.

See the [Vite Configuration Reference](https://vite.dev/config/) for build customization.
