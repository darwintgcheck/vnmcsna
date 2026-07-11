import { computed, signal } from '@preact/signals-react'
import { CHIPS, NUMBERS, tableLayout } from './constants'

export const chipPlacements = signal<Record<string, number>>({})
export const hovered = signal<number[]>([])
export const results = signal<number[]>([])
export const selectedChip = signal<number>(CHIPS[0])

export const distributedChips = computed(() => {
  const placements = Object.entries(chipPlacements.value)
  const distributed = Array.from({ length: NUMBERS }).map(() => 0)

  for (const [id, amount] of placements) {
    const square = tableLayout[id]
    if (!square || amount <= 0) continue
    const divided = amount / square.numbers.length
    for (const number of square.numbers) {
      distributed[number - 1] += divided
    }
  }

  return distributed
})

export const totalChipValue = computed(() => Object.values(chipPlacements.value).reduce((sum, amount) => sum + amount, 0))

export const bet = computed(() => {
  const total = totalChipValue.value || 1
  return distributedChips.value.map((amount) => Number(((amount * distributedChips.value.length) / total).toFixed(4)))
})

export const addResult = (index: number) => {
  results.value = [...results.value, index]
}

export const getChips = (id: string) => {
  return chipPlacements.value[id] ?? 0
}

export const hover = (ids: number[]) => {
  hovered.value = ids
}

export const addChips = (id: string, amount: number) => {
  chipPlacements.value = {
    ...chipPlacements.value,
    [id]: getChips(id) + amount,
  }
}

export const removeChips = (id: string) => {
  chipPlacements.value = {
    ...chipPlacements.value,
    [id]: Math.max(0, getChips(id) - selectedChip.value),
  }
}

export const clearChips = () => {
  chipPlacements.value = {}
}
