import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useSound } from 'gamba-react-ui-v2'
import { ItemPreview } from './ItemPreview'
import { Slot } from './Slot'
import { StyledSlots } from './Slots.styles'
import {
  FINAL_DELAY,
  LEGENDARY_THRESHOLD,
  NUM_SLOTS,
  REVEAL_SLOT_DELAY,
  SLOT_ITEMS,
  SOUND_LOSE,
  SOUND_PLAY,
  SOUND_REVEAL,
  SOUND_REVEAL_LEGENDARY,
  SOUND_SPIN,
  SOUND_WIN,
  SPIN_DELAY,
  SlotItem,
} from './constants'
import { getSlotCombination } from './utils'
import { useUserStore } from '../hooks/useUserStore'
import { didPlayerWin, pickRandom } from '../../utils/houseEdge'

const Controls = styled.div`
  margin-top: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const WagerInput = styled.input`
  width: 100%;
  min-height: 54px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  padding: 0 16px;
  font-size: 18px;
  outline: none;
`

const PlayButton = styled.button`
  min-width: 140px;
  min-height: 54px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #fbbf24, #fb7185);
  color: #140b0b;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

function Messages({ messages }: { messages: string[] }) {
  const [messageIndex, setMessageIndex] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((x) => (x + 1) % messages.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [messages])

  return <>{messages[messageIndex]}</>
}

export default function Slots() {
  const { balance, updateBalance } = useUserStore()
  const [spinning, setSpinning] = React.useState(false)
  const [result, setResult] = React.useState<number | null>(null)
  const [good, setGood] = React.useState(false)
  const [revealedSlots, setRevealedSlots] = React.useState(NUM_SLOTS)
  const [wager, setWager] = React.useState(10)
  const [combination, setCombination] = React.useState(Array.from({ length: NUM_SLOTS }).map(() => SLOT_ITEMS[0]))

  const sounds = useSound({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    reveal: SOUND_REVEAL,
    revealLegendary: SOUND_REVEAL_LEGENDARY,
    spin: SOUND_SPIN,
    play: SOUND_PLAY,
  })

  const timeout = useRef<number | null>(null)

  const stopSounds = React.useCallback(() => {
    sounds.sounds.spin.player.stop()
    sounds.sounds.reveal.player.stop()
    sounds.sounds.revealLegendary.player.stop()
  }, [sounds])

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current)
      }
      stopSounds()
    }
  }, [stopSounds])

  const revealSlot = (nextCombination: SlotItem[], slot = 0) => {
    sounds.play('reveal', { playbackRate: 1.1 })

    const allSame = nextCombination.slice(0, slot + 1).every((item, index, arr) => !index || item === arr[index - 1])

    if (nextCombination[slot].multiplier >= LEGENDARY_THRESHOLD && allSame) {
      sounds.play('revealLegendary')
    }

    setRevealedSlots(slot + 1)

    if (slot < NUM_SLOTS - 1) {
      timeout.current = window.setTimeout(() => revealSlot(nextCombination, slot + 1), REVEAL_SLOT_DELAY)
    } else {
      stopSounds()
      timeout.current = window.setTimeout(() => {
        setSpinning(false)
        if (allSame) {
          setGood(true)
          sounds.play('win')
        } else {
          sounds.play('lose')
        }
      }, FINAL_DELAY)
    }
  }

  const play = async () => {
    if (balance < wager) {
      alert('Not enough balance!')
      return
    }

    setSpinning(true)
    setResult(null)
    updateBalance(balance - wager)

    sounds.play('play')
    setRevealedSlots(0)
    setGood(false)

    const winningMultiplier = pickRandom([2, 5, 7, 10])
    const didWinRound = didPlayerWin()
    const randomMultiplier = didWinRound ? winningMultiplier : 0
    const payout = wager * randomMultiplier

    const resultDelay = SPIN_DELAY
    const revealDelay = Math.max(0, SPIN_DELAY - resultDelay)

    const nextCombination = getSlotCombination(NUM_SLOTS, randomMultiplier, Array(NUM_SLOTS).fill(1))
    setCombination(nextCombination)
    setResult(payout)

    sounds.play('spin', { playbackRate: 0.65 })

    timeout.current = window.setTimeout(() => {
      revealSlot(nextCombination)
      if (payout > 0) {
        updateBalance(balance - wager + payout)
      }
    }, revealDelay)
  }

  return (
    <>
      <StyledSlots>
        <div>
          <ItemPreview betArray={Array(NUM_SLOTS).fill(1)} />
          <div className="slots">
            {combination.map((slot, i) => (
              <Slot key={i} index={i} revealed={revealedSlots > i} item={slot} good={good} />
            ))}
          </div>
          <div className="result" data-good={good}>
            {spinning ? (
              <Messages messages={['Spinning…', 'Good luck', 'Reels are rolling']} />
            ) : result !== null ? (
              <>Payout: {result} ⭐</>
            ) : (
              <Messages messages={['Spin the reels', 'Feeling lucky?', 'Classic slot action']} />
            )}
          </div>
        </div>
      </StyledSlots>
      <Controls>
        <WagerInput
          type="number"
          value={wager}
          onChange={(e) => setWager(Math.max(1, Math.round(Number(e.target.value) || 1)))}
          placeholder="Enter wager"
          min={1}
        />
        <PlayButton disabled={!wager || spinning} onClick={play}>
          {spinning ? 'Spinning…' : 'Spin'}
        </PlayButton>
      </Controls>
    </>
  )
}
