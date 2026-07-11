import { CellState } from './types'

function pickMineIndices(size: number, mineCount: number) {
  const source = Array.from({ length: size }, (_, index) => index)
  for (let i = source.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[source[i], source[j]] = [source[j], source[i]]
  }
  return new Set(source.slice(0, mineCount))
}

export const generateGrid = (size: number, mineCount: number) => {
  const mineIndices = pickMineIndices(size, mineCount)
  return Array
    .from<CellState>({ length: size })
    .map((_, index) => ({
      status: 'hidden',
      profit: 0,
      isMine: mineIndices.has(index),
    }))
}

export const revealGold = (cells: CellState[], cellIndex: number, value: number) => {
  return cells.map<CellState>(
    (cell, i) => {
      if (i === cellIndex) {
        return { ...cell, status: 'gold', profit: value }
      }
      return cell
    },
  )
}

export const revealAllMines = (cells: CellState[], triggeredIndex?: number) => {
  return cells.map<CellState>((cell, i) => {
    if (cell.isMine || i === triggeredIndex) {
      return { ...cell, status: 'mine', profit: 0 }
    }
    return cell
  })
}
