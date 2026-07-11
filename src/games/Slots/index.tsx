import React from 'react'
import styled, { keyframes } from 'styled-components'
import { GambaUi, useSound } from 'gamba-react-ui-v2'
import { useUserStore } from '../../hooks/useUserStore'
import { SLOT_ITEMS, SOUND_LOSE, SOUND_PLAY, SOUND_SPIN, SOUND_WIN } from './constants'
import { didPlayerWin, pickRandom } from '../../utils/houseEdge'

const reelPulse = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
`

const ScreenCard = styled.div`
  width: 100%;
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(41, 14, 9, 0.96), rgba(16, 8, 10, 0.98));
  border: 1px solid rgba(255, 209, 94, 0.18);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px rgba(0,0,0,0.28);
  display: grid;
  gap: 16px;
`

const TopPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
`

const Counter = styled.div`
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  text-align: center;
`

const CounterLabel = styled.div`
  color: #f5c987;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

const CounterValue = styled.div`
  margin-top: 4px;
  font-size: 20px;
  font-weight: 900;
`

const Reels = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
`

const Reel = styled.div<{ $spinning?: boolean }>`
  min-height: 118px;
  border-radius: 22px;
  background: radial-gradient(circle at top, rgba(255,222,119,0.18), rgba(255,255,255,0.03));
  border: 1px solid rgba(255, 213, 94, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
  animation: ${({ $spinning }) => ($spinning ? reelPulse : 'none')} 0.45s linear infinite;

  img {
    width: min(74px, 100%);
    height: min(74px, 100%);
    object-fit: contain;
    filter: drop-shadow(0 10px 14px rgba(0,0,0,0.35));
  }
`

const Status = styled.div<{ $win?: boolean; $loss?: boolean }>`
  padding: 14px 16px;
  border-radius: 18px;
  background: ${({ $win, $loss }) => ($win ? 'rgba(72, 255, 143, 0.12)' : $loss ? 'rgba(255, 99, 99, 0.12)' : 'rgba(255, 227, 126, 0.1)')};
  border: 1px solid ${({ $win, $loss }) => ($win ? 'rgba(72, 255, 143, 0.35)' : $loss ? 'rgba(255, 99, 99, 0.3)' : 'rgba(255, 227, 126, 0.22)')};
  color: ${({ $win, $loss }) => ($win ? '#7cffb1' : $loss ? '#ff9f9f' : '#ffe37e')};
  text-align: center;
  font-weight: 800;
`

const ControlsWrap = styled.div`
  display: grid;
  gap: 12px;
  width: 100%;
`

const BalanceRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const SelectButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 215, 96, 0.55)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $active }) => ($active ? 'linear-gradient(135deg, rgba(255,215,96,0.22), rgba(255,133,92,0.18))' : 'rgba(255,255,255,0.05)')};
  color: #fff;
  min-height: 40px;
  border-radius: 999px;
  padding: 0 14px;
  font-weight: 800;
  cursor: pointer;
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

const SpinButton = styled.button`
  min-height: 58px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(90deg, #f3b533, #ff6d7e);
  color: #1e0909;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

const QUICK_AMOUNTS = [10, 25, 50, 100]
const WIN_MULTIPLIERS = [2, 3, 5, 7]

function getRandomItem() {
  return pickRandom(SLOT_ITEMS)
}

export default function Slots() {
  const { balance, withdrawBalance, addBalance } = useUserStore()
  const [wager, setWager] = React.useState(10)
  const [spinning, setSpinning] = React.useState(false)
  const [status, setStatus] = React.useState('Burning Hot style reels are ready.')
  const [lastNet, setLastNet] = React.useState<number | null>(null)
  const [reels, setReels] = React.useState(() => [getRandomItem(), getRandomItem(), getRandomItem()])

  const sounds = useSound({
    play: SOUND_PLAY,
    spin: SOUND_SPIN,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
  })

  const spinIntervalRef = React.useRef<number | null>(null)
  const finishTimeoutRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (spinIntervalRef.current) window.clearInterval(spinIntervalRef.current)
      if (finishTimeoutRef.current) window.clearTimeout(finishTimeoutRef.current)
    }
  }, [])

  const play = () => {
    const nextWager = Math.max(1, Math.round(Number(wager) || 1))
    setWager(nextWager)

    if (!withdrawBalance(nextWager, 'slots-bet')) {
      setStatus('Not enough balance for this spin.')
      setLastNet(null)
      return
    }

    setSpinning(true)
    setStatus('Spinning the reels…')
    setLastNet(null)
    sounds.play('play')
    sounds.play('spin', { playbackRate: 0.8 })

    if (spinIntervalRef.current) window.clearInterval(spinIntervalRef.current)
    if (finishTimeoutRef.current) window.clearTimeout(finishTimeoutRef.current)

    spinIntervalRef.current = window.setInterval(() => {
      setReels([getRandomItem(), getRandomItem(), getRandomItem()])
    }, 90)

    finishTimeoutRef.current = window.setTimeout(() => {
      if (spinIntervalRef.current) {
        window.clearInterval(spinIntervalRef.current)
        spinIntervalRef.current = null
      }

      const didWinRound = didPlayerWin()
      const multiplier = didWinRound ? pickRandom(WIN_MULTIPLIERS) : 0
      const winningItem = didWinRound ? pickRandom(SLOT_ITEMS.filter((item) => item.multiplier === multiplier)) : null
      const finalReels = didWinRound && winningItem
        ? [winningItem, winningItem, winningItem]
        : [getRandomItem(), getRandomItem(), getRandomItem()]

      setReels(finalReels)

      if (multiplier > 0) {
        const payout = nextWager * multiplier
        addBalance(payout, 'slots-win')
        setLastNet(payout - nextWager)
        setStatus(`Three of a kind. You won ${payout} ⭐ at ${multiplier}x.`)
        sounds.play('win')
      } else {
        setLastNet(-nextWager)
        setStatus('No match this time. Try another spin.')
        sounds.play('lose')
      }

      setSpinning(false)
    }, 1500)
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <ScreenCard>
          <TopPanel>
            <Counter>
              <CounterLabel>Balance</CounterLabel>
              <CounterValue>{balance} ⭐</CounterValue>
            </Counter>
            <Counter>
              <CounterLabel>Bet</CounterLabel>
              <CounterValue>{wager} ⭐</CounterValue>
            </Counter>
            <Counter>
              <CounterLabel>Potential</CounterLabel>
              <CounterValue>{wager * 7} ⭐</CounterValue>
            </Counter>
          </TopPanel>

          <Reels>
            {reels.map((item, index) => (
              <Reel key={`${item.image}-${index}-${spinning ? 'spin' : 'stop'}`} $spinning={spinning}>
                <img src={item.image} alt={`Slot symbol ${index + 1}`} />
              </Reel>
            ))}
          </Reels>

          <Status $win={Boolean(lastNet && lastNet > 0)} $loss={Boolean(lastNet !== null && lastNet < 0)}>
            {status}
          </Status>
        </ScreenCard>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <ControlsWrap>
          <BalanceRow>
            {QUICK_AMOUNTS.map((amount) => (
              <SelectButton key={amount} type="button" $active={wager === amount} onClick={() => setWager(amount)}>
                {amount} ⭐
              </SelectButton>
            ))}
            <SelectButton type="button" onClick={() => setWager(Math.max(1, Math.min(balance, wager * 2 || 2)))}>
              2x Bet
            </SelectButton>
          </BalanceRow>
          <WagerInput
            type="number"
            min={1}
            max={Math.max(balance, 1)}
            value={wager}
            onChange={(e) => setWager(Math.max(1, Math.round(Number(e.target.value) || 1)))}
            placeholder="Enter bet amount"
          />
          <SpinButton type="button" disabled={spinning || wager <= 0 || wager > balance} onClick={play}>
            {spinning ? 'Spinning…' : 'Spin Reels'}
          </SpinButton>
        </ControlsWrap>
      </GambaUi.Portal>
    </>
  )
}
