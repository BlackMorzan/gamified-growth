<script setup lang="ts">
import { ref } from 'vue'
import { useProfileStore } from '@/stores/profile'

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const profileStore = useProfileStore()

const name = ref('')
const birthDate = ref('')
const nameError = ref('')
const birthDateError = ref('')

const today = new Date().toISOString().slice(0, 10)

function validate(): boolean {
  nameError.value = ''
  birthDateError.value = ''

  if (!name.value.trim()) {
    nameError.value = 'Baby name is required'
  } else if (name.value.trim().length > 40) {
    nameError.value = 'Name must be 40 characters or fewer'
  } else if (profileStore.babies.some((b) => b.name === name.value.trim())) {
    nameError.value = 'A baby with this name already exists'
  }

  if (!birthDate.value) {
    birthDateError.value = 'Birth date is required'
  } else if (birthDate.value > today) {
    birthDateError.value = 'Birth date cannot be in the future'
  }

  return !nameError.value && !birthDateError.value
}

function save() {
  if (!validate()) return
  profileStore.addBaby(name.value.trim(), birthDate.value)
  emit('saved')
}
</script>

<template>
  <div class="add-baby-form">
    <div class="field">
      <label class="field__label" for="add-baby-name">Baby's name</label>
      <input
        id="add-baby-name"
        v-model="name"
        class="field__input"
        :class="{ 'field__input--error': nameError }"
        type="text"
        maxlength="40"
        autocomplete="off"
        placeholder="e.g. Olivia"
        aria-describedby="add-baby-name-error"
      />
      <p v-if="nameError" id="add-baby-name-error" class="field__error" role="alert">
        {{ nameError }}
      </p>
    </div>

    <div class="field">
      <label class="field__label" for="add-baby-date">Birth date</label>
      <input
        id="add-baby-date"
        v-model="birthDate"
        class="field__input"
        :class="{ 'field__input--error': birthDateError }"
        type="date"
        :max="today"
        aria-describedby="add-baby-date-error"
      />
      <p v-if="birthDateError" id="add-baby-date-error" class="field__error" role="alert">
        {{ birthDateError }}
      </p>
    </div>

    <div class="add-baby-form__actions">
      <button class="btn btn--primary" type="button" @click="save">Save</button>
      <button class="btn btn--ghost" type="button" @click="emit('cancel')">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.add-baby-form {
  background: var(--color-surface-deep);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 16px;
  padding: var(--space-3) var(--space-4);
  outline: none;
  width: 100%;
  box-sizing: border-box;
  color-scheme: dark;
  transition: border-color 0.15s, box-shadow 0.15s;
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

.add-baby-form__actions {
  display: flex;
  gap: var(--space-3);
}

.btn {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
  min-height: 40px;
}

.btn:hover {
  opacity: 0.85;
}

.btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.btn--primary {
  background: var(--color-accent);
  color: var(--color-bg);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-subtle);
}
</style>
