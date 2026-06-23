export function useSplitName(name: string, maxChars = 13): { line1: string; line2: string | null } {
  if (name.length <= maxChars) return { line1: name, line2: null }

  const spaces: number[] = []
  for (let i = 0; i < name.length; i++) {
    if (name[i] === ' ') spaces.push(i)
  }

  if (spaces.length === 0) return { line1: name, line2: null }

  let bestIdx = spaces[0]
  let bestDiff = Infinity

  for (const idx of spaces) {
    const diff = Math.abs(idx - (name.length - idx - 1))
    if (diff < bestDiff) {
      bestDiff = diff
      bestIdx = idx
    }
  }

  return {
    line1: name.slice(0, bestIdx),
    line2: name.slice(bestIdx + 1),
  }
}
