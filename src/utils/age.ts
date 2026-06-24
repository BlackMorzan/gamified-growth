export function formatAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()

  const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86_400_000)
  if (totalDays < 1) return '0 days old'

  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

  if (totalMonths < 1) return `${totalDays} day${totalDays === 1 ? '' : 's'} old`

  if (totalMonths < 12) return `${totalMonths} month${totalMonths === 1 ? '' : 's'} old`

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  if (months === 0) return `${years} year${years === 1 ? '' : 's'} old`
  return `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'} old`
}
