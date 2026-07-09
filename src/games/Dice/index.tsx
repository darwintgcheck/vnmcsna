import React from 'react'
import { useUserStore } from '../hooks/useUserStore'
import CustomSlider from './Slider'
import { SOUND_LOSE, SOUND_PLAY, SOUND_TICK, SOUND_WIN } from './constants'
import { Container, Result, RollUnder, Stats } from './styles'
import { useSound } from 'gamba-react-ui-v2'

const calculateArraySize = (odds: number): number => {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
  return 100 / gcd(100, odds)
}

export const outcomes = (odds: number) => {
  const arraySize = calculateArraySize(odds)
  const payout = (100 / odds).toFixed(4)

  let payoutArray = Array.from({ length: arraySize }).map((_, index) =>
    index < (arraySize * (odds / 100)) ? parseFloat(payout) : 0
  )

  const totalValue = payoutArray.reduce((acc, curr) => acc + curr, 0)

  if (totalValue > arraySize) {
    for (let i = payoutArray.length - 1; i >= 0; i--) {
      if (payoutArray[i] > 0) {
        payoutArray[i] -= totalValue - arraySize
        payoutArray[i] = parseFloat(payoutArray[i].toFixed(4))
        break
      }
    }
  }

  return payoutArray
}

export default function Dice() {
  const { balance, withdrawBalance, addBalance } = useUserStore()
  const [wager, setWager] = React.useState(10)
  const [resultIndex, setResultIndex] = React.useState(-1)
  const [rollUnderIndex, setRollUnderIndex] = React.useState(Math.floor(100 / 2))
  const [isPlaying, setIsPlaying] = React.useState(false)

  const sounds = useSound({
    win: SOUND_WIN,
    play: SOUND_PLAY,
    lose: SOUND_LOSE,
    tick: SOUND_TICK,
  })

  const odds = Math.floor((rollUnderIndex / 100) * 100)
  const multiplier = 100 / rollUnderIndex
  const maxWin = multiplier * wager

  const play = async () => {
    if (isPlaying) return
    if (!withdrawBalance(wager)) {
      alert('Not enough balance!')
      return
    }

    sounds.play('play')
    setIsPlaying(true)

    // Məntiq: uduş və ya məğlubiyyət
    const win = Math.random() * 100 < rollUnderIndex

    const resultNum = win
      ? Math.floor(Math.random() * rollUnderIndex)
      : Math.floor(Math.random() * (100 - rollUnderIndex) + rollUnderIndex)

    setResultIndex(resultNum)

    if (win) {
      const payout = wager * multiplier
      addBalance(payout)
      sounds.play('win')
    } else {
      sounds.play('lose')
    }

    setIsPlaying(false)
  }

  return (
    <>
      <div className="screen">
        <Container>
          <RollUnder>
            <div>
              <div>{rollUnderIndex + 1}</div>
              <div>Roll Under</div>
            </div>
          </RollUnder>
          <Stats>
            <div>
              <div>{(rollUnderIndex / 100 * 100).toFixed(0)}%</div>
              <div>Win Chance</div>
            </div>
            <div>
              <div>{multiplier.toFixed(2)}x</div>
              <div>Multiplier</div>
            </div>
            <div>
              <div>{maxWin.toFixed(2)} ₼</div>
              <div>Payout</div>
            </div>
          </Stats>
          <div style={{ position: 'relative' }}>
            {resultIndex > -1 && (
              <Result style={{ left: `${resultIndex / 100 * 100}%` }}>
                <div key={resultIndex}>{resultIndex + 1}</div>
              </Result>
            )}
            <Slider
              disabled={isPlaying}
              range={[0, 100]}
              min={1}
              max={95}
              value={rollUnderIndex}
              onChange={(value) => {
                setRollUnderIndex(value)
                sounds.play('tick')
              }}
            />
          </div>
        </Container>
      </div>

      <div className="controls">
        <input
          type="number"
          value={wager}
          onChange={(e) => setWager(Number(e.target.value))}
          min={1}
          max={balance}
        />
        <button onClick={play} disabled={isPlaying}>Roll</button>
      </div>
    </>
  )
}
