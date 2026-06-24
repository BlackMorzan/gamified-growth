<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const profileStore = useProfileStore()

const name = ref('')
const birthDate = ref('')
const nameError = ref('')
const birthDateError = ref('')

function validate(): boolean {
  nameError.value = ''
  birthDateError.value = ''
  if (!name.value.trim()) {
    nameError.value = 'Baby name is required'
  } else if (profileStore.babies.some((b) => b.name === name.value.trim())) {
    nameError.value = 'A baby with this name already exists'
  }
  if (!birthDate.value) birthDateError.value = 'Birth date is required'
  return !nameError.value && !birthDateError.value
}

function submit() {
  if (!validate()) return
  profileStore.addBaby(name.value.trim(), birthDate.value)
  router.push('/')
}
</script>

<template>
  <main class="setup">
    <div class="setup-card">
      <header class="setup-header">
        <h1 class="setup-title">Baby Skill Tree</h1>
        <p class="setup-subtitle">Set up your baby's profile to begin tracking milestones</p>
      </header>

      <form class="setup-form" novalidate @submit.prevent="submit">
        <div class="field">
          <label class="field__label" for="baby-name">Baby's name</label>
          <input
            id="baby-name"
            v-model="name"
            class="field__input"
            :class="{ 'field__input--error': nameError }"
            type="text"
            autocomplete="off"
            placeholder="e.g. Olivia"
            aria-describedby="baby-name-error"
          />
          <p v-if="nameError" id="baby-name-error" class="field__error" role="alert">{{ nameError }}</p>
        </div>

        <div class="field">
          <label class="field__label" for="birth-date">Birth date</label>
          <input
            id="birth-date"
            v-model="birthDate"
            class="field__input"
            :class="{ 'field__input--error': birthDateError }"
            type="date"
            aria-describedby="birth-date-error"
          />
          <p v-if="birthDateError" id="birth-date-error" class="field__error" role="alert">{{ birthDateError }}</p>
        </div>

        <button type="submit" class="submit-btn">Start Tracking</button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.setup {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-bg);
}

.setup-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
}

.setup-header {
  margin-bottom: var(--space-8);
  text-align: center;
}

.setup-title {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 0.06em;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.setup-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field__label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.field__input {
  background: var(--color-surface-deep);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 16px;
  padding: var(--space-3) var(--space-4);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
  box-sizing: border-box;
  color-scheme: dark;
}

.field__input::placeholder {
  color: var(--color-text-locked);
}

.field__input:focus-visible {
  border-color: var(--color-focus-ring);
  box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.25);
}

.field__input--error {
  border-color: var(--color-error);
}

.field__error {
  font-size: 13px;
  color: var(--color-error);
  margin: 0;
}

.submit-btn {
  margin-top: var(--space-3);
  padding: var(--space-3) var(--space-6);
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-bg);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.15s;
  min-height: 48px;
}

.submit-btn:hover {
  opacity: 0.88;
}

.submit-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
</style>
