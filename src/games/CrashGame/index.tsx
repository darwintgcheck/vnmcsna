import React from 'react'
import styled, { keyframes } from 'styled-components'
import { GambaUi } from 'gamba-react-ui-v2'
import { getCrashLiveStats, updateCrashPresence } from '../../lib/api'
import { useUserStore } from '../../hooks/useUserStore'

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-8deg); }
  50% { transform: translateY(-10px) rotate(-5deg); }
`

const Screen = styled.div`
  position: relative;
  width: 100%;
  min-height: 360px;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba(57, 208, 255, 0.16), transparent 28%),
    radial-gradient(circle at 80% 0%, rgba(255, 110, 160, 0.12), transparent 24%),
    linear-gradient(180deg, #121727 0%, #090b13 100%);
  border: 1px solid rgba(255,255,255,0.08);
`

const GridGlow = styled.div<{ $progress: number }>`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(180deg, transparent 0%, black 24%, black 100%);

  &::after {
    content: '';
    position: absolute;
    left: 20px;
    bottom: 26px;
    width: ${({ $progress }) => `${Math.max(4, $progress * 78)}%`};
    height: ${({ $progress }) => `${Math.max(4, Math.pow($progress, 1.45) * 72)}%`};
    border-top: 3px solid #33f38d;
    border-right: 3px solid #33f38d;
    border-radius: 0 22px 0 0;
    box-shadow: 0 0 26px rgba(51, 243, 141, 0.32);
  }
`

const TopInfo = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`

const Badge = styled.div`
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(9, 14, 25, 0.72);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(14px);
  font-size: 13px;
  font-weight: 800;
  color: #dce7ff;
`

const Multiplier = styled.div<{ $crashed?: boolean; $cashedOut?: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -52%);
  z-index: 2;
  font-size: clamp(42px, 10vw, 76px);
  font-weight: 900;
  font-family: monospace;
  color: ${({ $crashed, $cashedOut }) => ($crashed ? '#ff7f8f' : $cashedOut ? '#7cffb1' : '#ffffff')};
  text-shadow: 0 0 20px rgba(255,255,255,0.28);
`

const Plane = styled.div<{ $progress: number }>`
  position: absolute;
  left: ${({ $progress }) => `${10 + $progress * 74}%`};
  bottom: ${({ $progress }) => `${18 + Math.pow($progress, 1.28) * 48}%`};
  z-index: 2;
  font-size: clamp(30px, 7vw, 54px);
  filter: drop-shadow(0 12px 18px rgba(0,0,0,0.32));
  animation: ${float} 1.1s ease-in-out infinite;
`

const Message = styled.div`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  z-index: 3;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(9, 14, 25, 0.74);
  border: 1px solid rgba(255,255,255,0.1);
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  color: #e8efff;
`

const Controls = styled.div`
  width: 100%;
  display: grid;
  gap: 12px;
`

const CardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const ControlCard = styled.div`
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
`

const Label = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: #9eb0d9;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  gap: 8px;
`

const Step = styled.button`
  min-height: 50px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  cursor: pointer;
`

const Input = styled.input`
  min-height: 50px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: #fff;
  padding: 0 14px;
  font-size: 20px;
  font-weight: 900;
  text-align: center;
  outline: none;
`

const QuickRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const QuickButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255,224,117,0.7)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $active }) => ($active ? 'linear-gradient(135deg, rgba(255,224,117,0.22), rgba(255,130,99,0.18))' : 'rgba(255,255,255,0.05)')};
  color: #fff;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
`

const Toggle = styled.button<{ $active?: boolean }>`
  min-height: 50px;
  border-radius: 14px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(72,255,143,0.35)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(72,255,143,0.12)' : 'rgba(255,255,255,0.05)')};
  color: #fff;
  font-weight: 800;
  cursor: pointer;
`

const ActionButton = styled.button<{ $cashout?: boolean }>`
  min-height: 64px;
  border: none;
  border-radius: 18px;
  background: ${({ $cashout }) => ($cashout ? 'linear-gradient(90deg, #34d399, #14b8a6)' : 'linear-gradient(90deg, #f3b533, #ff6d7e)')};
  color: ${({ $cashout }) => ($cashout ? '#05241f' : '#1e0909')};
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const HOUSE_EDGE = 0.03
const MAX_CRASH = 25
const LIVE_POLL_MS = 3000
const COUNTDOWN_SECONDS = 10
const CRASH_PAUSE_MS = 2500

type Phase = 'countdown' | 'flying' | 'crashed'

function generateCrashPoint() {
  const seed = Math.random()
  if (seed < HOUSE_EDGE) return 1
  const raw = (1 - HOUSE_EDGE) / Math.max(1 - Math.random(), 0.0001)
  return Number(clamp(Number(raw.toFixed(2)), 1, MAX_CRASH).toFixed(2))
}

export default function CrashGame() {
  const { balance, currentUser, withdrawBalance, addBalance } = useUserStore()
  const [wager, setWager] = React.useState(10)
  const [autoCashoutEnabled, setAutoCashoutEnabled] = React.useState(false)
  const [autoCashoutTarget, setAutoCashoutTarget] = React.useState(2)
  const [liveBettors, setLiveBettors] = React.useState(0)
  const [phase, setPhase] = React.useState<Phase>('countdown')
  const [countdown, setCountdown] = React.useState(COUNTDOWN_SECONDS)
  const [queued, setQueued] = React.useState(false)
  const [queuedWager, setQueuedWager] = React.useState(0)
  const [cashedOut, setCashedOut] = React.useState(false)
  const [cashoutMultiplier, setCashoutMultiplier] = React.useState<number | null>(null)
  const [currentMultiplier, setCurrentMultiplier] = React.useState(1)
  const [crashPoint, setCrashPoint] = React.useState<number | null>(null)
  const [activeWager, setActiveWager] = React.useState(0)
  const [message, setMessage] = React.useState('Next round starts in 10 seconds. Place your bet.')
  const [lastNet, setLastNet] = React.useState<number | null>(null)

  const animationFrameRef = React.useRef<number | null>(null)
  const restartTimerRef = React.useRef<number | null>(null)
  const startTimeRef = React.useRef(0)
  const crashPointRef = React.useRef(1)
  const activeWagerRef = React.useRef(0)
  const currentUserIdRef = React.useRef<number | null>(currentUser?.telegramId || null)

  React.useEffect(() => {
    currentUserIdRef.current = currentUser?.telegramId || null
  }, [currentUser?.telegramId])

  React.useEffect(() => {
    activeWagerRef.current = activeWager
  }, [activeWager])

  const clearAnimation = React.useCallback(() => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const refreshLiveBettors = React.useCallback(async () => {
    try {
      const response = await getCrashLiveStats()
      setLiveBettors(response.queuedBettors)
    } catch {
      // noop
    }
  }, [])

  const syncPresence = React.useCallback(async (active: boolean, target?: number, nextWager?: number) => {
    const telegramId = currentUserIdRef.current
    if (!telegramId) return

    try {
      const response = await updateCrashPresence({
        telegramId,
        active,
        target: target ?? autoCashoutTarget,
        wager: nextWager ?? wager,
      })
      setLiveBettors(response.queuedBettors)
    } catch {
      // noop
    }
  }, [autoCashoutTarget, wager])

  React.useEffect(() => {
    void refreshLiveBettors()
    const id = window.setInterval(() => {
      void refreshLiveBettors()
    }, LIVE_POLL_MS)

    return () => {
      window.clearInterval(id)
      clearAnimation()
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current)
      }
      void syncPresence(false)
    }
  }, [clearAnimation, refreshLiveBettors, syncPresence])

  React.useEffect(() => {
    if (queued && phase === 'countdown') {
      void syncPresence(true, autoCashoutTarget, queuedWager || wager)
      return
    }

    void syncPresence(false)
  }, [autoCashoutTarget, phase, queued, queuedWager, syncPresence, wager])

  React.useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) return

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [countdown, phase])

  const resetToCountdown = React.useCallback(() => {
    clearAnimation()
    setPhase('countdown')
    setCountdown(COUNTDOWN_SECONDS)
    setCurrentMultiplier(1)
    setCrashPoint(null)
    setActiveWager(0)
    setCashedOut(false)
    setCashoutMultiplier(null)
    setMessage('Next round starts in 10 seconds. Place your bet.')
  }, [clearAnimation])

  const settleCrash = React.useCallback((finalMultiplier: number) => {
    clearAnimation()
    setPhase('crashed')
    setCurrentMultiplier(finalMultiplier)
    setCrashPoint(finalMultiplier)

    if (activeWagerRef.current > 0 && !cashedOut) {
      setLastNet(-activeWagerRef.current)
      setMessage(`Flight crashed at ${finalMultiplier.toFixed(2)}x. Your bet was lost.`)
    } else if (cashoutMultiplier !== null) {
      setMessage(`You cashed out at ${cashoutMultiplier.toFixed(2)}x. Round crashed at ${finalMultiplier.toFixed(2)}x.`)
    } else {
      setMessage(`Round crashed at ${finalMultiplier.toFixed(2)}x. Queue the next round now.`)
    }

    restartTimerRef.current = window.setTimeout(() => {
      resetToCountdown()
    }, CRASH_PAUSE_MS)
  }, [cashoutMultiplier, cashedOut, clearAnimation, resetToCountdown])

  const performCashout = React.useCallback((multiplier: number) => {
    if (phase !== 'flying' || activeWagerRef.current <= 0 || cashedOut) return
    const payout = Math.max(0, Math.round(activeWagerRef.current * multiplier))
    addBalance(payout, 'crash-win')
    setCashedOut(true)
    setCashoutMultiplier(multiplier)
    setLastNet(payout - activeWagerRef.current)
    setMessage(`Cashed out at ${multiplier.toFixed(2)}x for ${payout} ⭐. Waiting for the crash…`)
  }, [addBalance, cashedOut, phase])

  const animate = React.useCallback((now: number) => {
    if (!startTimeRef.current) startTimeRef.current = now
    const elapsedSeconds = (now - startTimeRef.current) / 1000
    const growth = Math.exp(elapsedSeconds / 10)
    const nextMultiplier = Number(Math.max(1, growth).toFixed(2))

    if (autoCashoutEnabled && !cashedOut && activeWagerRef.current > 0 && nextMultiplier >= autoCashoutTarget) {
      performCashout(autoCashoutTarget)
    }

    if (nextMultiplier >= crashPointRef.current) {
      settleCrash(crashPointRef.current)
      return
    }

    setCurrentMultiplier(nextMultiplier)
    animationFrameRef.current = window.requestAnimationFrame(animate)
  }, [autoCashoutEnabled, autoCashoutTarget, cashedOut, performCashout, settleCrash])

  const launchRound = React.useCallback(() => {
    let nextActiveWager = 0

    if (queued) {
      const normalizedWager = Math.max(1, Math.round(Number(queuedWager || wager) || 1))
      if (!withdrawBalance(normalizedWager, 'crash-bet')) {
        setQueued(false)
        setQueuedWager(0)
        setMessage('Not enough balance for the queued bet. Update the amount and try again.')
      } else {
        nextActiveWager = normalizedWager
      }
    }

    const nextCrashPoint = generateCrashPoint()
    crashPointRef.current = nextCrashPoint
    setCrashPoint(nextCrashPoint)
    setPhase('flying')
    setQueued(false)
    setQueuedWager(0)
    setCashedOut(false)
    setCashoutMultiplier(null)
    setActiveWager(nextActiveWager)
    setLastNet(null)
    setCurrentMultiplier(1)
    setCountdown(0)
    startTimeRef.current = 0
    setMessage(nextActiveWager > 0 ? 'Flight started. Cash out before the crash.' : 'Round is live. You are watching this flight.')
    clearAnimation()
    void syncPresence(false)
    animationFrameRef.current = window.requestAnimationFrame(animate)
  }, [animate, clearAnimation, queued, queuedWager, syncPresence, wager, withdrawBalance])

  React.useEffect(() => {
    if (phase === 'countdown' && countdown <= 0) {
      launchRound()
    }
  }, [countdown, launchRound, phase])

  const queueBet = () => {
    const nextWager = Math.max(1, Math.round(Number(wager) || 1))
    const nextTarget = Number(clamp(Number(autoCashoutTarget || 2), 1.1, 20).toFixed(2))
    setWager(nextWager)
    setAutoCashoutTarget(nextTarget)

    if (nextWager > balance) {
      setMessage('Not enough balance to queue this bet.')
      return
    }

    setQueued(true)
    setQueuedWager(nextWager)
    setMessage(`Bet of ${nextWager} ⭐ queued. Round starts in ${countdown}s.`)
  }

  const cancelQueuedBet = () => {
    setQueued(false)
    setQueuedWager(0)
    setMessage('Queued bet cancelled. You can set a new bet before launch.')
  }

  const progress = clamp((currentMultiplier - 1) / Math.max((crashPoint || 4) - 1, 0.5), 0, 1)
  const statusLabel = phase === 'countdown'
    ? `Next flight in ${countdown}s`
    : phase === 'flying'
      ? 'Flight in progress'
      : 'Round crashed'

  return (
    <>
      <GambaUi.Portal target="screen">
        <Screen>
          <GridGlow $progress={progress} />
          <TopInfo>
            <Badge>
              {statusLabel}
              <br />
              {queued ? `Queued bet: ${queuedWager} ⭐` : activeWager > 0 ? `Active bet: ${activeWager} ⭐` : 'Observer mode'}
            </Badge>
            <Badge>
              Live bettors: {liveBettors}
              <br />
              Auto cash out: {autoCashoutEnabled ? `${autoCashoutTarget.toFixed(2)}x` : 'OFF'}
            </Badge>
          </TopInfo>

          <Multiplier $crashed={phase === 'crashed' && !cashedOut} $cashedOut={Boolean(cashedOut)}>
            {currentMultiplier.toFixed(2)}x
          </Multiplier>
          <Plane $progress={progress}>✈️</Plane>
          <Message>{message}</Message>
        </Screen>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <Controls>
          <CardRow>
            <ControlCard>
              <Label>Bet amount</Label>
              <InputRow>
                <Step type="button" onClick={() => setWager((value) => Math.max(1, value - 1))}>-</Step>
                <Input type="number" min={1} value={wager} onChange={(e) => setWager(Math.max(1, Math.round(Number(e.target.value) || 1)))} />
                <Step type="button" onClick={() => setWager((value) => value + 1)}>+</Step>
              </InputRow>
              <QuickRow>
                {[10, 25, 50, 100].map((value) => (
                  <QuickButton key={value} type="button" $active={wager === value} onClick={() => setWager(value)}>{value} ⭐</QuickButton>
                ))}
              </QuickRow>
            </ControlCard>

            <ControlCard>
              <Label>Auto cash out</Label>
              <Toggle type="button" $active={autoCashoutEnabled} onClick={() => setAutoCashoutEnabled((value) => !value)}>
                {autoCashoutEnabled ? 'Auto cash out is ON' : 'Auto cash out is OFF'}
              </Toggle>
              <InputRow>
                <Step type="button" onClick={() => setAutoCashoutTarget((value) => Number(clamp(Number((value - 0.1).toFixed(2)), 1.1, 20).toFixed(2)))}>-</Step>
                <Input type="number" min={1.1} step={0.1} value={autoCashoutTarget} onChange={(e) => setAutoCashoutTarget(Number(clamp(Number(e.target.value) || 2, 1.1, 20).toFixed(2)))} />
                <Step type="button" onClick={() => setAutoCashoutTarget((value) => Number(clamp(Number((value + 0.1).toFixed(2)), 1.1, 20).toFixed(2)))}>+</Step>
              </InputRow>
              <QuickRow>
                {[1.5, 2, 3, 5].map((value) => (
                  <QuickButton key={value} type="button" $active={autoCashoutTarget === value} onClick={() => setAutoCashoutTarget(value)}>{value.toFixed(2)}x</QuickButton>
                ))}
              </QuickRow>
            </ControlCard>
          </CardRow>

          <ActionButton
            type="button"
            $cashout={phase === 'flying' && activeWager > 0 && !cashedOut}
            disabled={phase === 'crashed' || (phase === 'flying' && (activeWager <= 0 || cashedOut))}
            onClick={() => {
              if (phase === 'countdown') {
                if (queued) {
                  cancelQueuedBet()
                  return
                }
                queueBet()
                return
              }

              if (phase === 'flying') {
                performCashout(currentMultiplier)
              }
            }}
          >
            {phase === 'countdown'
              ? queued
                ? `Cancel ${queuedWager} ⭐`
                : 'Join Next Round'
              : phase === 'flying'
                ? activeWager > 0 && !cashedOut
                  ? `Cash Out ${Math.round(activeWager * currentMultiplier)} ⭐`
                  : 'Flight in progress'
                : 'Waiting for next round'}
          </ActionButton>
        </Controls>
      </GambaUi.Portal>
    </>
  )
}
