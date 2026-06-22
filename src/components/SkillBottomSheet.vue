<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Skill } from '@/data/skills'
import { skillById } from '@/data/skills'
import { useTechTreeStore } from '@/stores/techTree'
import { useProfileStore } from '@/stores/profile'

const props = defineProps<{ skill: Skill | null }>()
const emit = defineEmits<{ close: [] }>()

const store = useTechTreeStore()
const profileStore = useProfileStore()

function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const today = ref(localToday())
const dateInput = ref(localToday())
const editingDate = ref(false)
const editDateInput = ref('')

watch(
  () => props.skill,
  () => {
    const t = localToday()
    today.value = t
    dateInput.value = t
    editingDate.value = false
  },
)

const progress = computed(() => (props.skill ? store.progressOf(props.skill) : null))
const acquiredDate = computed(() => (props.skill ? store.acquiredDateOf(props.skill) : undefined))

const icon = computed(() => {
  if (!props.skill) return ''
  if (progress.value === 'locked') return '🔒'
  if (props.skill.milestone && progress.value === 'acquired') return '★ ✓'
  if (props.skill.milestone) return '★'
  if (progress.value === 'acquired') return '✓'
  return '◎'
})

const iconClass = computed(() => {
  if (props.skill?.milestone && progress.value !== 'locked') return 'sheet-icon--milestone'
  if (progress.value === 'acquired') return 'sheet-icon--acquired'
  if (progress.value === 'available') return 'sheet-icon--available'
  return 'sheet-icon--locked'
})

const unmetPrereqs = computed(() => {
  if (!props.skill) return []
  return props.skill.requires
    .map((id) => skillById.get(id)!)
    .filter((prereq) => store.progressOf(prereq) !== 'acquired')
})

function acquire() {
  if (!props.skill) return
  profileStore.acquire(props.skill.id, dateInput.value)
  emit('close')
}

function startEditDate() {
  editDateInput.value = acquiredDate.value ?? localToday()
  editingDate.value = true
}

function saveDate() {
  if (!props.skill) return
  profileStore.setAcquiredDate(props.skill.id, editDateInput.value)
  editingDate.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="skill"
      class="sheet-backdrop"
      role="dialog"
      :aria-label="skill.name"
      aria-modal="true"
      @click.self="emit('close')"
    >
      <div class="sheet-panel" :class="{ 'sheet-panel--milestone': skill.milestone }">
        <div class="sheet-header">
          <div class="sheet-title-group">
            <span class="sheet-icon" :class="iconClass" aria-hidden="true">{{ icon }}</span>
            <h2 class="sheet-title">{{ skill.name }}</h2>
          </div>
          <button class="sheet-close" aria-label="Close" @click="emit('close')">✕</button>
        </div>

        <div class="sheet-meta">
          <span class="sheet-age">{{ skill.typical_age_months.start }}–{{ skill.typical_age_months.end }}m typical</span>
          <span v-if="skill.milestone" class="sheet-milestone-chip">Milestone</span>
        </div>

        <div v-if="progress === 'acquired'" class="sheet-acquired">
          <template v-if="!editingDate">
            <span class="sheet-acquired-date">Acquired {{ acquiredDate }}</span>
            <button class="sheet-edit-btn" @click="startEditDate">Edit date</button>
          </template>
          <template v-else>
            <label class="sheet-acquire-label" for="edit-date">Edit acquisition date</label>
            <div class="sheet-acquire-row">
              <input
                id="edit-date"
                v-model="editDateInput"
                type="date"
                class="sheet-date-input"
                :max="today"
                aria-label="Acquisition date"
              />
              <button class="sheet-confirm-btn" @click="saveDate">Save</button>
              <button class="sheet-cancel-btn" @click="editingDate = false">Cancel</button>
            </div>
          </template>
        </div>

        <div v-if="progress === 'locked' && unmetPrereqs.length" class="sheet-lock-reason">
          <!-- TODO: review by UI/UX designer -->
          <span class="sheet-lock-label">Requires:</span>
          <ul class="sheet-prereq-list">
            <li v-for="prereq in unmetPrereqs" :key="prereq.id">{{ prereq.name }}</li>
          </ul>
        </div>

        <section class="sheet-evidence">
          <h3 class="sheet-section-title">Evidence</h3>
          <ul class="sheet-evidence-list">
            <li v-for="(item, i) in skill.evidence" :key="i">{{ item }}</li>
          </ul>
        </section>

        <div v-if="progress === 'available'" class="sheet-acquire">
          <label class="sheet-acquire-label" for="acquire-date">Date acquired</label>
          <div class="sheet-acquire-row">
            <input
              id="acquire-date"
              v-model="dateInput"
              type="date"
              class="sheet-date-input"
              :max="today"
              aria-label="Date acquired"
            />
            <button class="sheet-confirm-btn" @click="acquire">Mark Acquired</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.sheet-panel {
  background: var(--color-surface);
  border-top: 2px solid var(--color-border-subtle);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-5) var(--space-6) var(--space-8);
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.sheet-title-group {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.sheet-icon {
  font-size: 18px;
  flex-shrink: 0;
}

/* TODO: review by UI/UX designer */
.sheet-panel--milestone {
  background: color-mix(in srgb, var(--color-surface) 88%, var(--color-skill-milestone) 12%);
  border-top-color: var(--color-accent-gold);
}

.sheet-icon--milestone { color: var(--color-accent-gold); }
.sheet-icon--acquired  { color: var(--color-success-text); }
.sheet-icon--available { color: var(--color-accent); }
.sheet-icon--locked    { color: var(--color-text-locked); }

.sheet-title {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-text);
  letter-spacing: 0.03em;
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow-wrap: break-word;
}

.sheet-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 16px;
  cursor: pointer;
  padding: var(--space-1);
  line-height: 1;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sheet-close:hover { color: var(--color-text); }
.sheet-close:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.sheet-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.sheet-age {
  font-size: 13px;
  color: var(--color-text-muted);
}

.sheet-milestone-chip {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-accent-gold);
  border: 1px solid var(--color-accent-gold);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}

.sheet-acquired {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.sheet-acquired-date {
  font-size: 13px;
  color: var(--color-success-text);
}

.sheet-edit-btn {
  background: none;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 12px;
  padding: 2px var(--space-2);
  cursor: pointer;
  font-family: var(--font-body);
}
.sheet-edit-btn:hover { color: var(--color-text); border-color: var(--color-text-muted); }
.sheet-edit-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* TODO: review by UI/UX designer */
.sheet-lock-reason {
  background: rgba(233, 69, 96, 0.1);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  border-left: 3px solid var(--color-error);
}

.sheet-lock-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-error);
  display: block;
  margin-bottom: var(--space-1);
}

.sheet-prereq-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sheet-prereq-list li {
  font-size: 13px;
  color: var(--color-text);
}

.sheet-section-title {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0 0 var(--space-2);
}

.sheet-evidence-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.sheet-evidence-list li {
  font-size: 14px;
  color: var(--color-text);
  padding-left: var(--space-4);
  position: relative;
  line-height: 1.4;
}

.sheet-evidence-list li::before {
  content: '◆';
  position: absolute;
  left: 0;
  font-size: 8px;
  top: 4px;
  color: var(--color-accent);
}

.sheet-acquire {
  border-top: 1px solid var(--color-border-subtle);
  padding-top: var(--space-4);
}

.sheet-acquire-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.sheet-acquire-row {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.sheet-date-input {
  flex: 1;
  background: var(--color-surface-deep);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 14px;
  padding: 0 var(--space-3);
  min-height: 44px;
  font-family: var(--font-body);
}

.sheet-date-input:focus {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.sheet-confirm-btn {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  padding: 0 var(--space-5);
  min-height: 44px;
  cursor: pointer;
  white-space: nowrap;
}
.sheet-confirm-btn:hover { opacity: 0.88; }
.sheet-confirm-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.sheet-cancel-btn {
  background: none;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 0 var(--space-4);
  min-height: 44px;
  cursor: pointer;
  white-space: nowrap;
}
.sheet-cancel-btn:hover { color: var(--color-text); }
.sheet-cancel-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
</style>
