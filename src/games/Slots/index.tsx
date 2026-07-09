import React, { useEffect, useRef } from 'react'
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

function Messages({ messages }: {messages: string[]}) {
  const [messageIndex, setMessageIndex] = React.useState(0)
  React.useEffect(
    () => {
      const timeout = setInterval(() => {
        setMessageIndex((x) => (x + 1) % messages.length)
      }, 2500)
      return () => clearInterval(timeout)
    },
    [messages],
  )
  return (
    <>
      {messages[messageIndex]}
    </>
  )
}

export default function Slots() {
  const { balance, updateBalance } = useUserStore()
  const [spinning, setSpinning] = React.useState(false)
  const [result, setResult] = React.useState<number | null>(null)
  const [good, setGood] = React.useState(false)
  const [revealedSlots, setRevealedSlots] = React.useState(NUM_SLOTS)
  const [wager, setWager] = React.useState(0)
  const [combination, setCombination] = React.useState(
    Array.from({ length: NUM_SLOTS }).map(() => SLOT_ITEMS[0]),
  )
  const sounds = useSound({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    reveal: SOUND_REVEAL,
    revealLegendary: SOUND_REVEAL_LEGENDARY,
    spin: SOUND_SPIN,
    play: SOUND_PLAY,
  })
  const timeout = useRef<any>()

  useEffect(
    () => {
      return () => {
        timeout.current && clearTimeout(timeout.current)
      }
    },
    [],
  )

  const revealSlot = (combination: SlotItem[], slot = 0) => {
    sounds.play('reveal', { playbackRate: 1.1 })

    const allSame = combination.slice(0, slot + 1).every((item, index, arr) => !index || item === arr[index - 1])

    if (combination[slot].multiplier >= LEGENDARY_THRESHOLD) {
      if (allSame) {
        sounds.play('revealLegendary')
      }
    }

    setRevealedSlots(slot + 1)

    if (slot < NUM_SLOTS - 1) {
      timeout.current = setTimeout(
        () => revealSlot(combination, slot + 1),
        REVEAL_SLOT_DELAY,
      )
    } else if (slot === NUM_SLOTS - 1) {
      sounds.sounds.spin.player.stop()
      timeout.current = setTimeout(() => {
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
      alert("Balans kifayət deyil!")
      return
    }

    setSpinning(true)
    setResult(null)
    updateBalance(balance - wager)

    sounds.play('play')
    setRevealedSlots(0)
    setGood(false)

    const startTime = Date.now()
    sounds.play('spin', { playbackRate: .5 })

    const randomMultiplier = [0, 0, 2, 5, 10][Math.floor(Math.random() * 5)]
    const payout = wager * randomMultiplier

    const resultDelay = Date.now() - startTime
    const revealDelay = Math.max(0, SPIN_DELAY - resultDelay)

    const combination = getSlotCombination(NUM_SLOTS, randomMultiplier, Array(NUM_SLOTS).fill(1))
    setCombination(combination)
    setResult(payout)

    timeout.current = setTimeout(() => {
      revealSlot(combination)
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
          <div className={'slots'}>
            {combination.map((slot, i) => (
              <Slot
                key={i}
                index={i}
                revealed={revealedSlots > i}
                item={slot}
                good={good}
              />
            ))}
          </div>
          <div className="result" data-good={good}>
            {spinning ? (
              <Messages
                messages={[
                  'Spinning!',
                  'Good luck',
                ]}
              />
            ) : result !== null ? (
              <>
                Payout: {result}
              </>
            ) : (
              <Messages
                messages={[
                  'SPIN ME!',
                  'FEELING LUCKY?',
                ]}
              />
            )}
          </div>
        </div>
      </StyledSlots>
      <div style={{ marginTop: 20 }}>
        <input
          type="number"
          value={wager}
          onChange={(e) => setWager(Number(e.target.value))}
          placeholder="Məbləği daxil et"
        />
        <button disabled={!wager || spinning} onClick={play}>
          Spin
        </button>
      </div>
    </>
  )
}
