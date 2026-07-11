import React from 'react'
import styled from 'styled-components'
import { GambaUi, useSound } from 'gamba-react-ui-v2'
import { useUserStore } from '../../hooks/useUserStore'
import { RANKS, RANK_SYMBOLS, SOUND_CARD, SOUND_FINISH, SOUND_LOSE, SOUND_PLAY, SOUND_WIN } from './constants'

const ScreenCard = styled.div`
  width: 100%;
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(18, 13, 24, 0.96), rgba(8, 8, 14, 0.98));
  border: 1px solid rgba(255,255,255,0.08);
`

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
`

const Card = styled.div<{ $hidden?: boolean }>`
  min-height: 170px;
  border-radius: 22px;
  background: ${({ $hidden }) => ($hidden ? 'linear-gradient(135deg, #28213c, #14111f)' : 'linear-gradient(180deg, #ffffff, #f3f4f8)')};
  border: 1px solid ${({ $hidden }) => ($hidden ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  color: ${({ $hidden }) => ($hidden ? '#d9cbff' : '#161616')};
  box-shadow: 0 12px 24px rgba(0,0,0,0.24);
`

const CardRank = styled.div`
  font-size: clamp(34px, 8vw, 64px);
  font-weight: 900;
  z-index: 2;
`

const CardSuit = styled.div<{ $hidden?: boolean }>`
  position: absolute;
  right: 14px;
  bottom: 10px;
  font-size: 68px;
  opacity: ${({ $hidden }) => ($hidden ? 0.2 : 0.12)};
`

const CardLabel = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
`

const Status = styled.div<{ $win?: boolean; $loss?: boolean }>`
  padding: 14px;
  border-radius: 18px;
  background: ${({ $win, $loss }) => ($win ? 'rgba(72,255,143,0.12)' : $loss ? 'rgba(255,99,99,0.12)' : 'rgba(255,255,255,0.05)')};
  border: 1px solid ${({ $win, $loss }) => ($win ? 'rgba(72,255,143,0.35)' : $loss ? 'rgba(255,99,99,0.3)' : 'rgba(255,255,255,0.1)')};
  color: ${({ $win, $loss }) => ($win ? '#7cffb1' : $loss ? '#ff9f9f' : '#dfe8ff')};
  font-weight: 800;
  text-align: center;
`

const Controls = styled.div`
  width: 100%;
  display: grid;
  gap: 12px;
`

const WagerInput = styled.input`
  width: 100%;
  min-height: 56px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: #fff;
  padding: 0 16px;
  font-size: 18px;
  font-weight: 800;
  outline: none;
`

const GuessRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

const GuessButton = styled.button<{ $active?: boolean }>`
  min-height: 54px;
  border-radius: 18px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255,224,117,0.7)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $active }) => ($active ? 'linear-gradient(135deg, rgba(255,224,117,0.22), rgba(255,130,99,0.18))' : 'rgba(255,255,255,0.05)')};
  color: #fff;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
`

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

const ActionButton = styled.button<{ $accent?: boolean }>`
  min-height: 56px;
  border: none;
  border-radius: 18px;
  background: ${({ $accent }) => ($accent ? 'linear-gradient(90deg, #f3b533, #ff6d7e)' : 'rgba(255,255,255,0.06)')};
  color: ${({ $accent }) => ($accent ? '#1e0909' : '#fff')};
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  border: ${({ $accent }) => ($accent ? 'none' : '1px solid rgba(255,255,255,0.12)')};
`

const rankSymbol = (rank: number) => RANK_SYMBOLS[Math.max(0, Math.min(RANKS - 1, rank))]
const randomRank = () => Math.floor(Math.random() * RANKS)

type Choice = 'hi' | 'lo'

export interface HiLoConfig {
  logo: string
}

export default function HiLo({ logo }: HiLoConfig) {
  const { balance, withdrawBalance, addBalance } = useUserStore()
  const [currentRank, setCurrentRank] = React.useState(randomRank())
  const [nextRank, setNextRank] = React.useState<number | null>(null)
  const [choice, setChoice] = React.useState<Choice>('hi')
  const [wager, setWager] = React.useState(10)
  const [status, setStatus] = React.useState('Choose higher or lower and deal the next card.')
  const [lastNet, setLastNet] = React.useState<number | null>(null)
  const [busy, setBusy] = React.useState(false)

  const sounds = useSound({
    play: SOUND_PLAY,
    card: SOUND_CARD,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    finish: SOUND_FINISH,
  })

  const resetRound = () => {
    setNextRank(null)
    setStatus('Choose higher or lower and deal the next card.')
    setLastNet(null)
    sounds.play('finish', { playbackRate: 0.9 })
  }

  const play = () => {
    const nextWager = Math.max(1, Math.round(Number(wager) || 1))
    setWager(nextWager)

    if (busy) return
    if (!withdrawBalance(nextWager, 'hilo-bet')) {
      setStatus('Not enough balance for that card deal.')
      setLastNet(null)
      return
    }

    setBusy(true)
    setStatus('Dealing the next card…')
    setLastNet(null)
    sounds.play('play')

    const dealtRank = randomRank()
    window.setTimeout(() => {
      setNextRank(dealtRank)
      sounds.play('card', { playbackRate: 0.9 })

      const won = choice === 'hi' ? dealtRank >= currentRank : dealtRank <= currentRank
      if (won) {
        const payout = nextWager * 2
        addBalance(payout, 'hilo-win')
        setLastNet(payout - nextWager)
        setStatus(`Correct guess. ${rankSymbol(dealtRank)} was ${choice === 'hi' ? 'higher' : 'lower'} and you won ${payout} ⭐.`)
        sounds.play('win')
      } else {
        setLastNet(-nextWager)
        setStatus(`Wrong guess. The next card was ${rankSymbol(dealtRank)}.`)
        sounds.play('lose')
      }

      setCurrentRank(dealtRank)
      setBusy(false)
    }, 500)
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <ScreenCard>
          <Cards>
            <Card>
              <CardLabel>Current card</CardLabel>
              <CardRank>{rankSymbol(currentRank)}</CardRank>
              <CardSuit style={{ backgroundImage: `url(${logo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', width: 72, height: 72 }} />
            </Card>
            <Card $hidden={nextRank === null}>
              <CardLabel>Next card</CardLabel>
              <CardRank>{nextRank === null ? '?' : rankSymbol(nextRank)}</CardRank>
              <CardSuit $hidden={nextRank === null} style={{ backgroundImage: `url(${logo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', width: 72, height: 72 }} />
            </Card>
          </Cards>

          <Status $win={Boolean(lastNet && lastNet > 0)} $loss={Boolean(lastNet !== null && lastNet < 0)}>
            {status}
          </Status>
        </ScreenCard>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <Controls>
          <WagerInput
            type="number"
            min={1}
            max={Math.max(balance, 1)}
            value={wager}
            onChange={(e) => setWager(Math.max(1, Math.round(Number(e.target.value) || 1)))}
            placeholder="Enter bet amount"
          />
          <GuessRow>
            <GuessButton type="button" $active={choice === 'hi'} onClick={() => setChoice('hi')}>Higher</GuessButton>
            <GuessButton type="button" $active={choice === 'lo'} onClick={() => setChoice('lo')}>Lower</GuessButton>
          </GuessRow>
          <ActionRow>
            <ActionButton type="button" onClick={resetRound}>Reset</ActionButton>
            <ActionButton type="button" $accent disabled={busy || wager > balance} onClick={play}>Deal Card</ActionButton>
          </ActionRow>
        </Controls>
      </GambaUi.Portal>
    </>
  )
}
