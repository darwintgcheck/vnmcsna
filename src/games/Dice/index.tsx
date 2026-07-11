import { GambaUi, useSound } from 'gamba-react-ui-v2'
import React from 'react'
import styled from 'styled-components'
import { useUserStore } from '../hooks/useUserStore'
import { didPlayerWin } from '../../utils/houseEdge'
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

  const playerChance = 35
  const multiplier = Number((100 / playerChance).toFixed(2))
  const maxWin = Math.round(multiplier * wager)
  const canPlay = !isPlaying && wager > 0 && wager <= balance

  const play = async () => {
    if (isPlaying) return
    if (!withdrawBalance(wager, 'dice-bet')) {
      alert('Not enough balance!')
      return
    }

    sounds.play('play')
    setIsPlaying(true)

    const won = didPlayerWin()
    const resultNum = won ? Math.floor(Math.random() * rollUnderIndex) : Math.floor(Math.random() * (100 - rollUnderIndex) + rollUnderIndex)

    setResultIndex(resultNum)

    window.setTimeout(() => {
      if (won) {
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
                <div>Roll under</div>
              </div>
            </RollUnder>
            <Stats>
              <div>
                <div>{playerChance}%</div>
                <div>Player win chance</div>
              </div>
              <div>
                <div>{multiplier.toFixed(2)}x</div>
                <div>Multiplier</div>
              </div>
              <div>
                <div>{maxWin} ⭐</div>
                <div>Maximum payout</div>
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
            placeholder="Wager amount"
          />
          <PlayButton onClick={play} disabled={!canPlay}>
            {isPlaying ? 'Rolling…' : 'Roll'}
          </PlayButton>
        </div>
      </GambaUi.Portal>
    </>
  )
}
