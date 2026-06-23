<script setup lang="ts">
// Design system smoke test — all skill card states
</script>

<template>
  <main class="home">
    <header class="app-header">
      <div class="app-header__text">
        <h1 class="app-title">Baby Skill Tree</h1>
      </div>
      <RouterLink to="/tree" class="nav-link">View Skill Tree →</RouterLink>
    </header>
  </main>
</template>

<style scoped>
.home {
  padding: var(--space-8) var(--space-6);
  max-width: 860px;
  margin: 0 auto;
}

.app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-8);
}

.nav-link {
  font-size: 14px;
  color: var(--color-accent);
  text-decoration: none;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.nav-link:hover {
  background: var(--color-skill-available);
}

.app-title {
  font-family: var(--font-display);
  font-size: 32px;
  color: var(--color-text);
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.app-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
}

.section-title {
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--color-text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: var(--space-4);
}

.skill-grid {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.skill-card {
  width: 160px;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
  transition: background 0.15s, box-shadow 0.15s;
}

.skill-card__icon {
  font-size: 14px;
  margin-bottom: var(--space-2);
}

.skill-card__name {
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 0.03em;
  margin-bottom: var(--space-2);
}

.skill-card__age {
  font-size: 12px;
  color: var(--color-text-muted);
}

.skill-card__meta {
  font-size: 11px;
  color: var(--color-text-muted);
}

/* — locked — */
.skill-card--locked {
  background: var(--color-skill-locked);
}
.skill-card--locked .skill-card__name {
  color: var(--color-text-locked);
}
.skill-card--locked .skill-card__icon {
  color: var(--color-text-locked);
}

/* — available — */
.skill-card--available {
  background: var(--color-skill-available);
  border-color: var(--color-accent);
  cursor: pointer;
}
.skill-card--available:hover,
.skill-card--available:focus-visible {
  background: var(--color-skill-available-hover);
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.25);
  outline: none;
}
.skill-card--available .skill-card__icon {
  color: var(--color-accent);
}

/* — acquired — */
.skill-card--acquired {
  background: var(--color-skill-acquired);
  border-color: var(--color-skill-acquired-border);
}
.skill-card--acquired .skill-card__icon {
  color: var(--color-success-text);
}

/* — milestone — */
.skill-card--milestone {
  background: var(--color-skill-milestone);
  border-color: var(--color-accent-gold);
}
.skill-card--milestone .skill-card__name {
  color: var(--color-accent-gold);
}
.skill-card--milestone .skill-card__icon {
  color: var(--color-accent-gold);
}
</style>
