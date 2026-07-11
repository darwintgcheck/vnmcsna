export const PLAYER_WIN_CHANCE = 0.35
export const HOUSE_WIN_CHANCE = 0.65

export function didPlayerWin(chance = PLAYER_WIN_CHANCE) {
  return Math.random() < chance
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function pickByOutcome<T>(items: T[], predicate: (item: T) => boolean, playerWins = didPlayerWin()) {
  const matching = items.filter(predicate)
  const nonMatching = items.filter((item) => !predicate(item))

  if (playerWins && matching.length > 0) return pickRandom(matching)
  if (!playerWins && nonMatching.length > 0) return pickRandom(nonMatching)
  return pickRandom(items)
}
