<script setup lang="ts">
/**
 * Comet animation for an "available" SVG connector path.
 *
 * A glowing head travels along the path, dragging a tapered trail, then
 * "bursts" when it reaches the end. The cycle loops every DURATION ms.
 *
 * Timeline (fractions of the cycle, t = 0..1):
 *   0       -> T_FADE_IN   trail fades in at the start of the path
 *   T_FADE_IN -> T_TRAVEL  trail travels from start to end of the path
 *   T_TRAVEL              head reaches the end -> burst fires
 *   T_TRAVEL -> T_FADE_OUT trail fades out (now parked at the end)
 *   T_FADE_OUT -> 1        idle until the next cycle
 *
 * Trail: four overlapping copies of the path, each shown as a short dash
 * (stroke-dasharray "len 10000") sliding along via stroke-dashoffset. Shorter,
 * brighter segments sit on top of longer, dimmer ones to fake a tapered comet.
 *
 * Burst: a ring expands and fades while a dot shrinks and fades, both pinned
 * to the path's endpoint.
 *
 * Why RAF instead of CSS keyframes: the trail's dashoffset depends on the
 * path's measured pixel length (getTotalLength), which is only known at
 * runtime and changes when the layout (prop `d`) changes. The head dot, whose
 * motion is purely proportional, stays on a CSS `comet` keyframe.
 */
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps<{
  d: string
  progress: 'locked' | 'available' | 'acquired'
}>()

const connPath  = ref<SVGPathElement | null>(null)
const burstRing = ref<SVGCircleElement | null>(null)
const burstDot  = ref<SVGCircleElement | null>(null)

// One ref per trail segment, ordered to match TRAILS below.
const trail0 = ref<SVGPathElement | null>(null)
const trail1 = ref<SVGPathElement | null>(null)
const trail2 = ref<SVGPathElement | null>(null)
const trail3 = ref<SVGPathElement | null>(null)
const trailRefs = [trail0, trail1, trail2, trail3]

// Trail segments, all ending at the head; `len` is the dash length in px.
// Rendered back-to-front so the brightest (innermost) paints last on top.
const TRAILS = [
  { len: 20, opacityScale: 0.20 },  // outermost — weakest
  { len: 15, opacityScale: 0.40 },
  { len: 10, opacityScale: 0.65 },
  { len:  5, opacityScale: 1.00 },  // innermost — brightest
]

const DURATION   = 5000
const T_FADE_IN  = 0.06
const T_TRAVEL   = 0.36
const T_FADE_OUT = 0.44
const T_BURST    = 0.07  // burst lasts 7% of cycle (~350ms)

let raf = 0
let pathLen = 200
let mountTime = 0

// Trail opacity over the cycle: ramp up, hold, ramp down, then off.
function trailOpacity(t: number): number {
  if (t < T_FADE_IN)  return t / T_FADE_IN
  if (t < T_TRAVEL)   return 1
  if (t < T_FADE_OUT) return 1 - (t - T_TRAVEL) / (T_FADE_OUT - T_TRAVEL)
  return 0
}

// Head position as a fraction (0..1) of the path: 0 before travel, then linear to 1.
function travelProgress(t: number): number {
  if (t < T_FADE_IN) return 0
  if (t < T_TRAVEL)  return (t - T_FADE_IN) / (T_TRAVEL - T_FADE_IN)
  return 1
}

function tick(now: number) {
  const t = ((now - mountTime) % DURATION) / DURATION
  const opacity = trailOpacity(t)
  const p = travelProgress(t)

  for (let i = 0; i < TRAILS.length; i++) {
    const el = trailRefs[i].value
    if (!el) continue
    const { len, opacityScale } = TRAILS[i]
    // Slide the dash so its leading edge sits at distance `p * pathLen` along the path.
    el.setAttribute('stroke-dashoffset', String(Math.round(len - p * pathLen)))
    el.style.opacity = String(opacity * opacityScale)
  }

  const ring = burstRing.value
  const dot  = burstDot.value
  if (ring && dot) {
    // Burst plays only in the T_BURST window right after the head lands.
    if (t >= T_TRAVEL && t < T_TRAVEL + T_BURST) {
      const bp = (t - T_TRAVEL) / T_BURST       // 0..1 progress through the burst
      ring.setAttribute('r', String(4 + bp * 10))  // ring grows r 4 -> 14
      ring.style.opacity = String((1 - bp) * 0.9)
      dot.setAttribute('r', String(4 - bp * 2.5))   // dot shrinks r 4 -> 1.5
      dot.style.opacity = String(1 - bp * 2)        // dot fades twice as fast
    } else {
      ring.style.opacity = '0'
      dot.style.opacity  = '0'
    }
  }

  raf = requestAnimationFrame(tick)
}

// Pin the burst circles to the path's endpoint.
function updateEndpoint() {
  if (!connPath.value) return
  const pt = connPath.value.getPointAtLength(pathLen)
  for (const c of [burstRing.value, burstDot.value]) {
    c?.setAttribute('cx', String(pt.x))
    c?.setAttribute('cy', String(pt.y))
  }
}

function startAnim() {
  cancelAnimationFrame(raf)
  pathLen = connPath.value?.getTotalLength() ?? 200
  updateEndpoint()
  mountTime = performance.now()
  // Give each trail its dash shape and park it off the start of the path.
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

// Run the animation only while available; stop it otherwise.
watch(() => props.progress, async (p) => {
  if (p === 'available') { await nextTick(); startAnim() }
  else cancelAnimationFrame(raf)
})

// Path reshaped: re-measure length and re-anchor the burst.
watch(() => props.d, () => {
  if (connPath.value) {
    pathLen = connPath.value.getTotalLength()
    updateEndpoint()
  }
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
    <path ref="trail0" :d="d" class="pulse-trail" fill="none" />
    <path ref="trail1" :d="d" class="pulse-trail" fill="none" />
    <path ref="trail2" :d="d" class="pulse-trail" fill="none" />
    <path ref="trail3" :d="d" class="pulse-trail" fill="none" />
    <circle class="pulse-head" r="3.5" :style="`offset-path: path('${d}')`" />
    <!-- burst at path end -->
    <circle ref="burstRing" class="burst-ring" fill="none" />
    <circle ref="burstDot"  class="burst-dot" />
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

.burst-ring {
  stroke: var(--color-accent);
  stroke-width: 1.5;
  opacity: 0;
  filter: drop-shadow(0 0 5px rgba(6, 182, 212, 0.9));
}

.burst-dot {
  fill: #ffffff;
  opacity: 0;
  filter: drop-shadow(0 0 4px rgba(6, 182, 212, 1));
}

@keyframes comet {
  0%   { offset-distance: 0%;   opacity: 0; }
  6%   { offset-distance: 0%;   opacity: 1; }
  36%  { offset-distance: 100%; opacity: 1; }
  44%  { offset-distance: 100%; opacity: 0; }
  100% { offset-distance: 100%; opacity: 0; }
}
</style>
