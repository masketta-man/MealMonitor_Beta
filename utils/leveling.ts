export function getXpForLevel(level: number): number {
  if (level <= 1) {
    return 200
  }

  if (level <= 10) {
    return Math.floor(200 * Math.pow(1.25, level - 1))
  }

  if (level <= 30) {
    const baseLevel = 10
    const baseXp = getXpForLevel(baseLevel)
    return Math.floor(baseXp * Math.pow(1.15, level - baseLevel))
  }

  return 5000
}

export function getTotalXpForLevel(targetLevel: number): number {
  if (targetLevel <= 0) return 0

  let totalXp = 0
  for (let level = 1; level <= targetLevel; level++) {
    totalXp += getXpForLevel(level)
  }
  return totalXp
}

export function getLevelProgress(currentXp: number) {
  let level = 1
  let totalXpForPreviousLevels = 0
  let xpForNextLevel = getXpForLevel(level)

  while (currentXp >= totalXpForPreviousLevels + xpForNextLevel && xpForNextLevel > 0) {
    totalXpForPreviousLevels += xpForNextLevel
    level += 1
    xpForNextLevel = getXpForLevel(level)
  }

  const currentLevelXp = currentXp - totalXpForPreviousLevels
  const progress = xpForNextLevel > 0 ? currentLevelXp / xpForNextLevel : 1

  return {
    level,
    currentLevelXp,
    nextLevelXp: xpForNextLevel,
    progress: Math.min(Math.max(progress, 0), 1),
  }
}
