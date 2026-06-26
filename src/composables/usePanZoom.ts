import { ref, computed } from 'vue'

type BoundsGetter = () => { minX: number; maxX: number; minY: number; maxY: number }

export function usePanZoom(minScale = 0.25, maxScale = 3) {
  const scale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)

  const transform = computed(
    () => `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  )

  function clamp(s: number) {
    return Math.min(maxScale, Math.max(minScale, s))
  }

  function zoomIn() {
    scale.value = clamp(scale.value * 1.3)
  }

  function zoomOut() {
    scale.value = clamp(scale.value / 1.3)
  }

  function setView(x: number, y: number, s: number) {
    scale.value = clamp(s)
    translateX.value = x
    translateY.value = y
  }

  // Touch tracking — id-keyed so finger identity survives move events
  type TrackedTouch = { id: number; x: number; y: number }
  let active: TrackedTouch[] = []
  let lastPinchDist = 0

  function snapshot(e: TouchEvent): TrackedTouch[] {
    return Array.from(e.touches).map((t) => ({ id: t.identifier, x: t.clientX, y: t.clientY }))
  }

  function hypot(a: TrackedTouch, b: TrackedTouch) {
    return Math.hypot(b.x - a.x, b.y - a.y)
  }

  // Inertia — velocity tracking (touch-only, single-finger pan)
  const SAMPLE_COUNT = 5
  type Sample = { dx: number; dy: number; dt: number }
  let samples: Sample[] = []
  let lastSampleTime = 0
  let rafId: number | null = null
  let inertiaVx = 0
  let inertiaVy = 0
  let _getBounds: BoundsGetter | null = null

  function setBoundsGetter(fn: BoundsGetter) {
    _getBounds = fn
  }

  function cancelInertia() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function onTouchStart(e: TouchEvent) {
    cancelInertia()
    samples = []
    lastSampleTime = 0
    active = snapshot(e)
    if (active.length === 2) lastPinchDist = hypot(active[0]!, active[1]!)
  }

  function onTouchMove(e: TouchEvent) {
    const current = snapshot(e)

    if (current.length === 1) {
      const prev = active.find((t) => t.id === current[0]!.id)
      if (prev) {
        const dx = current[0]!.x - prev.x
        const dy = current[0]!.y - prev.y
        translateX.value += dx
        translateY.value += dy

        const now = performance.now()
        const dt = lastSampleTime > 0 ? now - lastSampleTime : 0
        lastSampleTime = now
        if (dt > 0) {
          samples.push({ dx, dy, dt })
          if (samples.length > SAMPLE_COUNT) samples.shift()
        }
      }
    } else if (current.length === 2) {
      samples = []
      const prevA = active.find((t) => t.id === current[0]!.id)
      const prevB = active.find((t) => t.id === current[1]!.id)
      if (!prevA || !prevB) {
        active = current
        return
      }

      const newDist = hypot(current[0]!, current[1]!)
      const newMid = { x: (current[0]!.x + current[1]!.x) / 2, y: (current[0]!.y + current[1]!.y) / 2 }
      const oldMid = { x: (prevA.x + prevB.x) / 2, y: (prevA.y + prevB.y) / 2 }

      const newScale = clamp(scale.value * (newDist / lastPinchDist))

      // Keep the canvas point under the old midpoint pinned to the new midpoint
      const canvasX = (oldMid.x - translateX.value) / scale.value
      const canvasY = (oldMid.y - translateY.value) / scale.value
      translateX.value = newMid.x - canvasX * newScale
      translateY.value = newMid.y - canvasY * newScale
      scale.value = newScale

      lastPinchDist = newDist
    }

    active = current
  }

  function onTouchEnd(e: TouchEvent) {
    active = snapshot(e)
    if (active.length === 2) lastPinchDist = hypot(active[0]!, active[1]!)

    // Only launch inertia when the last finger lifts (active.length === 0)
    if (active.length > 0) {
      samples = []
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      samples = []
      return
    }

    if (samples.length < 2) {
      samples = []
      return
    }

    // Weighted average velocity: recent samples weighted higher; result in px/ms
    let totalWeight = 0
    let weightedVx = 0
    let weightedVy = 0
    for (let i = 0; i < samples.length; i++) {
      const weight = i + 1
      weightedVx += (samples[i]!.dx / samples[i]!.dt) * weight
      weightedVy += (samples[i]!.dy / samples[i]!.dt) * weight
      totalWeight += weight
    }
    samples = []

    if (totalWeight === 0) return

    const MAX_VEL = 3 // px/ms — prevents flick-to-infinity
    inertiaVx = Math.max(-MAX_VEL, Math.min(MAX_VEL, weightedVx / totalWeight))
    inertiaVy = Math.max(-MAX_VEL, Math.min(MAX_VEL, weightedVy / totalWeight))

    if (Math.abs(inertiaVx) < 0.05 && Math.abs(inertiaVy) < 0.05) return

    let lastFrameTime = performance.now()

    function step(now: number) {
      const dt = Math.min(now - lastFrameTime, 64) // cap delta to survive tab switches
      lastFrameTime = now

      // Frame-rate-independent decay (0.92 per 16.67ms = 60fps baseline)
      const decay = Math.pow(0.92, dt / 16.67)
      inertiaVx *= decay
      inertiaVy *= decay

      const dx = inertiaVx * dt
      const dy = inertiaVy * dt

      if (_getBounds) {
        const { minX, maxX, minY, maxY } = _getBounds()
        const newX = Math.max(minX, Math.min(maxX, translateX.value + dx))
        const newY = Math.max(minY, Math.min(maxY, translateY.value + dy))
        // Kill velocity on that axis when the clamp absorbed the full delta
        if (newX === translateX.value) inertiaVx = 0
        if (newY === translateY.value) inertiaVy = 0
        translateX.value = newX
        translateY.value = newY
      } else {
        translateX.value += dx
        translateY.value += dy
      }

      if (Math.abs(inertiaVx) < 0.05 && Math.abs(inertiaVy) < 0.05) {
        rafId = null
        return
      }

      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
  }

  return {
    scale,
    translateX,
    translateY,
    transform,
    zoomIn,
    zoomOut,
    setView,
    setBoundsGetter,
    cancelInertia,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
