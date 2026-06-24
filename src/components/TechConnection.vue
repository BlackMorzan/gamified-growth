<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps<{
  d: string
  progress: 'locked' | 'available' | 'acquired'
}>()

const connPath = ref<SVGPathElement | null>(null)

// 4 trail segments, all ending at the head. Lengths are cumulative from head.
// Rendered back-to-front so the brightest (innermost) paints last on top.
const TRAILS = [
  { len: 20, opacityScale: 0.20 },  // outermost — weakest
  { len: 15, opacityScale: 0.40 },
  { len: 10, opacityScale: 0.65 },
  { len:  5, opacityScale: 1.00 },  // innermost — brightest
]

const trailRefs = [
  ref<SVGPathElement | null>(null),
  ref<SVGPathElement | null>(null),
  ref<SVGPathElement | null>(null),
  ref<SVGPathElement | null>(null),
]

const DURATION   = 5000
const T_FADE_IN  = 0.06
const T_TRAVEL   = 0.36
const T_FADE_OUT = 0.44

let raf = 0
let pathLen = 200
let mountTime = 0

function tick(now: number) {
  const t = ((now - mountTime) % DURATION) / DURATION

  let baseOpacity = 0
  let baseOffset  = 0  // computed per-trail below

  if (t < T_FADE_IN) {
    baseOpacity = t / T_FADE_IN
  } else if (t < T_TRAVEL) {
    baseOpacity = 1
  } else if (t < T_FADE_OUT) {
    baseOpacity = 1 - (t - T_TRAVEL) / (T_FADE_OUT - T_TRAVEL)
  }

  const p = t < T_FADE_IN ? 0
          : t < T_TRAVEL  ? (t - T_FADE_IN) / (T_TRAVEL - T_FADE_IN)
          : 1

  for (let i = 0; i < TRAILS.length; i++) {
    const el = trailRefs[i].value
    if (!el) continue
    const { len, opacityScale } = TRAILS[i]
    baseOffset = len - p * pathLen
    el.setAttribute('stroke-dashoffset', String(Math.round(baseOffset)))
    el.style.opacity = String(baseOpacity * opacityScale)
  }

  raf = requestAnimationFrame(tick)
}

function startAnim() {
  cancelAnimationFrame(raf)
  pathLen   = connPath.value?.getTotalLength() ?? 200
  mountTime = performance.now()
  for (let i = 0; i < TRAILS.length; i++) {
    const el = trailRefs[i].value
    if (!el) continue
    el.setAttribute('stroke-dasharray',  `${TRAILS[i].len} 10000`)
    el.setAttribute('stroke-dashoffset', String(TRAILS[i].len))
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (props.progress === 'available') startAnim()
})

watch(() => props.progress, async (p) => {
  if (p === 'available') { await nextTick(); startAnim() }
  else cancelAnimationFrame(raf)
})

watch(() => props.d, () => {
  if (connPath.value) pathLen = connPath.value.getTotalLength()
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <g v-if="progress === 'locked'">
    <path :d="d" class="conn conn--locked-erase" fill="none" />
    <path :d="d" class="conn conn--locked" fill="none" />
  </g>
  <g v-else-if="progress === 'available'">
    <path ref="connPath" :d="d" class="conn conn--available" fill="none" stroke-width="2" />
    <!-- trails rendered back-to-front: outermost first, innermost last -->
    <path :ref="(el) => { trailRefs[0].value = el as SVGPathElement }" :d="d" class="pulse-trail" fill="none" />
    <path :ref="(el) => { trailRefs[1].value = el as SVGPathElement }" :d="d" class="pulse-trail" fill="none" />
    <path :ref="(el) => { trailRefs[2].value = el as SVGPathElement }" :d="d" class="pulse-trail" fill="none" />
    <path :ref="(el) => { trailRefs[3].value = el as SVGPathElement }" :d="d" class="pulse-trail" fill="none" />
    <circle class="pulse-head" r="3.5" :style="`offset-path: path('${d}')`" />
  </g>
  <path v-else :d="d" :class="`conn conn--${progress}`" fill="none" stroke-width="2" />
</template>

<style scoped>
.conn {
  transition: stroke 0.2s;
}
.conn--locked-erase {
  stroke: var(--color-bg);
  stroke-width: 3;
  opacity: 0.7;
}
.conn--locked {
  stroke: var(--color-disabled);
  stroke-dasharray: 4 4;
  stroke-width: 2;
  opacity: 0.7;
}
.conn--available {
  stroke: var(--color-accent);
  filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.55));
}
.conn--acquired {
  stroke: var(--color-skill-acquired-border);
  filter: drop-shadow(0 0 3px rgba(66, 168, 115, 0.55));
}

.pulse-trail {
  stroke: #bfe6ff;
  stroke-width: 3;
  opacity: 0;
  filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.6));
}

.pulse-head {
  fill: #dff0ff;
  filter: drop-shadow(0 0 3px var(--color-accent)) drop-shadow(0 0 8px rgba(6, 182, 212, 0.7));
  offset-distance: 0%;
  animation: comet 5s linear infinite;
}

@keyframes comet {
  0%   { offset-distance: 0%;   opacity: 0; }
  6%   { offset-distance: 0%;   opacity: 1; }
  36%  { offset-distance: 100%; opacity: 1; }
  44%  { offset-distance: 100%; opacity: 0; }
  100% { offset-distance: 100%; opacity: 0; }
}
</style>
