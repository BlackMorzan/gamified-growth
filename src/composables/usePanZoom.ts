import { ref, computed } from 'vue'

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

  function onTouchStart(e: TouchEvent) {
    active = snapshot(e)
    if (active.length === 2) lastPinchDist = hypot(active[0]!, active[1]!)
  }

  function onTouchMove(e: TouchEvent) {
    const current = snapshot(e)

    if (current.length === 1) {
      const prev = active.find((t) => t.id === current[0]!.id)
      if (prev) {
        translateX.value += current[0]!.x - prev.x
        translateY.value += current[0]!.y - prev.y
      }
    } else if (current.length === 2) {
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
  }

  return {
    scale,
    translateX,
    translateY,
    transform,
    zoomIn,
    zoomOut,
    setView,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
