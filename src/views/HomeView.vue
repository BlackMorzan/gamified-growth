<script setup lang="ts">
// Design system smoke test — all skill card states
</script>

<template>
  <main class="home">
    <header class="app-header">
      <h1 class="app-title">Baby Skill Tree</h1>
      <p class="app-subtitle">0–24 months · developmental milestones</p>
    </header>

    <section class="skill-section">
      <h2 class="section-title">Physical Motor</h2>
      <div class="skill-grid">

        <div class="skill-card skill-card--locked">
          <div class="skill-card__icon">🔒</div>
          <div class="skill-card__name">Head Control</div>
          <div class="skill-card__age">0–3m</div>
        </div>

        <div class="skill-card skill-card--available" tabindex="0">
          <div class="skill-card__icon">◎</div>
          <div class="skill-card__name">Tummy Time</div>
          <div class="skill-card__age">1–4m</div>
        </div>

        <div class="skill-card skill-card--acquired">
          <div class="skill-card__icon">✓</div>
          <div class="skill-card__name">Rolling Over</div>
          <div class="skill-card__meta">Acquired · 14 Mar · Age 3m</div>
        </div>

        <div class="skill-card skill-card--milestone">
          <div class="skill-card__icon">★</div>
          <div class="skill-card__name">First Steps</div>
          <div class="skill-card__age">9–15m</div>
        </div>

        <div class="skill-card skill-card--milestone skill-card--acquired-milestone">
          <div class="skill-card__icon">★ ✓</div>
          <div class="skill-card__name">Walking</div>
          <div class="skill-card__meta">Acquired · 22 Apr · Age 12m</div>
        </div>

      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  padding: var(--space-8) var(--space-6);
  max-width: 860px;
  margin: 0 auto;
}

.app-header {
  margin-bottom: var(--space-8);
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
