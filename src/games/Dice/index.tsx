import { GambaUi, useSound } from 'gamba-react-ui-v2'
import React from 'react'
import styled from 'styled-components'
import { useUserStore } from '../hooks/useUserStore'
import CustomSlider from './Slider'
import { SOUND_LOSE, SOUND_PLAY, SOUND_TICK, SOUND_WIN } from './constants'
import { Container, Result, RollUnder, Stats } from './styles'

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
  background: linear-gradient(135deg, #8c62ff, #5ee7ff);
  color: #05050b;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

const calculateArraySize = (odds: number): number => {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
  return 100 / gcd(100, odds)
}

export const outcomes = (odds: number) => {
  const arraySize = calculateArraySize(odds)
  const payout = (100 / odds).toFixed(4)

  const payoutArray = Array.from({ length: arraySize }).map((_, index) =>
    index < (arraySize * (odds / 100)) ? parseFloat(payout) : 0,
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
  const [rollUnderIndex, setRollUnderIndex] = React.useState(50)
  const [isPlaying, setIsPlaying] = React.useState(false)

  const sounds = useSound({
    win: SOUND_WIN,
    play: SOUND_PLAY,
    lose: SOUND_LOSE,
    tick: SOUND_TICK,
  })

  const multiplier = 100 / rollUnderIndex
  const maxWin = Math.round(multiplier * wager)
  const canPlay = !isPlaying && wager > 0 && wager <= balance

  const play = async () => {
    if (isPlaying) return
    if (!withdrawBalance(wager, 'dice-bet')) {
      alert('Balans kifayət etmir!')
      return
    }

    sounds.play('play')
    setIsPlaying(true)

    const win = Math.random() * 100 < rollUnderIndex
    const resultNum = win
      ? Math.floor(Math.random() * rollUnderIndex)
      : Math.floor(Math.random() * (100 - rollUnderIndex) + rollUnderIndex)

    setResultIndex(resultNum)

    window.setTimeout(() => {
      if (win) {
        const payout = Math.round(wager * multiplier)
        addBalance(payout, 'dice-win')
        sounds.play('win')
      } else {
        sounds.play('lose')
      }
      setIsPlaying(false)
    }, 300)
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <GambaUi.Responsive>
          <Container>
            <RollUnder>
              <div>
                <div>{rollUnderIndex}</div>
                <div>Altına düşsün</div>
              </div>
            </RollUnder>
            <Stats>
              <div>
                <div>{rollUnderIndex}%</div>
                <div>Qazanma şansı</div>
              </div>
              <div>
                <div>{multiplier.toFixed(2)}x</div>
                <div>Əmsal</div>
              </div>
              <div>
                <div>{maxWin} ⭐</div>
                <div>Maksimum uduş</div>
              </div>
            </Stats>
            <div style={{ position: 'relative' }}>
              {resultIndex > -1 && (
                <Result style={{ left: `${(resultIndex / 99) * 100}%` }}>
                  <div key={resultIndex}>{resultIndex + 1}</div>
                </Result>
              )}
              <CustomSlider
                disabled={isPlaying}
                range={[0, 100]}
                min={5}
                max={95}
                value={rollUnderIndex}
                onChange={(value) => {
                  setRollUnderIndex(value)
                  sounds.play('tick')
                }}
              />
            </div>
          </Container>
        </GambaUi.Responsive>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 12, width: '100%' }}>
          <WagerInput
            type="number"
            inputMode="numeric"
            value={wager}
            onChange={(e) => setWager(Math.max(1, Math.round(Number(e.target.value) || 0)))}
            min={1}
            max={balance}
            placeholder="Mərc məbləği"
          />
          <PlayButton onClick={play} disabled={!canPlay}>
            {isPlaying ? 'Atılır...' : 'At'}
          </PlayButton>
        </div>
      </GambaUi.Portal>
    </>
  )
}
