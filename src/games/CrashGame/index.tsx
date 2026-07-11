import { GambaUi } from 'gamba-react-ui-v2'
import React from 'react'
import { useUserStore } from '../hooks/useUserStore'
import CRASH_SOUND from './crash.mp3'
import SOUND from './music.mp3'
import WIN_SOUND from './win.mp3'
import {
  CardLabel,
  ControlCard,
  ControlsGrid,
  CrashCurve,
  LineLayer1,
  LineLayer2,
  LineLayer3,
  MainAction,
  Message,
  MultiplierText,
  QuickActions,
  QuickButton,
  Rocket,
  RoundBadge,
  RoundInfo,
  ScreenWrapper,
  StarsLayer1,
  StarsLayer2,
  StarsLayer3,
  StepButton,
  ValueInput,
  ValueRow,
} from './styles'

const COUNTDOWN_SECONDS = 10
const ROUND_RESULT_DELAY = 1800

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function CrashGame() {
  const { balance, withdrawBalance, addBalance } = useUserStore()
  const [wager, setWager] = React.useState(10)
  const [multiplierTarget, setMultiplierTarget] = React.useState(1.5)
  const [currentMultiplier, setCurrentMultiplier] = React.useState(1)
  const [rocketState, setRocketState] = React.useState<'countdown' | 'flying' | 'win' | 'crash'>('countdown')
  const [countdown, setCountdown] = React.useState(COUNTDOWN_SECONDS)
  const [roundMessage, setRoundMessage] = React.useState('10 saniyədən sonra növbəti uçuş başlayacaq.')
  const [queuedBet, setQueuedBet] = React.useState(false)
  const [activeWager, setActiveWager] = React.useState(0)
  const [activeTarget, setActiveTarget] = React.useState(1.5)
  const [plannedCrashPoint, setPlannedCrashPoint] = React.useState(1.5)
  const [roundNonce, setRoundNonce] = React.useState(0)

  const roundRef = React.useRef(0)
  const countdownTimerRef = React.useRef<number | null>(null)
  const animationFrameRef = React.useRef<number | null>(null)
  const timeoutRef = React.useRef<number | null>(null)
  const ambientAudioRef = React.useRef<HTMLAudioElement | null>(null)

  const playSound = React.useCallback((src: string, loop = false) => {
    try {
      const audio = new Audio(src)
      audio.loop = loop
      void audio.play().catch(() => undefined)
      return audio
    } catch {
      return null
    }
  }, [])

  const stopAmbient = React.useCallback(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause()
      ambientAudioRef.current.currentTime = 0
      ambientAudioRef.current = null
    }
  }, [])

  const calculateBiasedLowMultiplier = React.useCallback((target: number) => {
    const randomValue = Math.random()
    const maxPossibleMultiplier = Math.min(target, 12)
    const exponent = randomValue > 0.95 ? 2.8 : (target > 10 ? 5 : 6)
    const result = 1 + Math.pow(randomValue, exponent) * (maxPossibleMultiplier - 1)
    return Number(Math.max(1.01, result).toFixed(2))
  }, [])

  const clearTimers = React.useCallback(() => {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const startCountdown = React.useCallback(() => {
    clearTimers()
    stopAmbient()
    setRocketState('countdown')
    setCurrentMultiplier(1)
    setCountdown(COUNTDOWN_SECONDS)
    setRoundMessage('10 saniyəlik geri sayım başladı. Uçuş avtomatik başlayacaq.')

    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            window.clearInterval(countdownTimerRef.current)
            countdownTimerRef.current = null
          }
          setRoundNonce((value) => value + 1)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimers, stopAmbient])

  const finishRound = React.useCallback((won: boolean, wagerAmount: number, target: number, crashPoint: number) => {
    stopAmbient()
    playSound(won ? WIN_SOUND : CRASH_SOUND)
    setRocketState(won ? 'win' : 'crash')
    setCurrentMultiplier(crashPoint)

    if (won && wagerAmount > 0) {
      const payout = Math.round(wagerAmount * target)
      addBalance(payout, 'crash-win')
      setRoundMessage(`Raket ${target.toFixed(2)}x nöqtəsinə çatdı. +${payout} ⭐ qazandın.`)
    } else if (wagerAmount > 0) {
      setRoundMessage(`Raket ${crashPoint.toFixed(2)}x-də dayandı. Bu raund uduzdun.`)
    } else {
      setRoundMessage(`İzləmə raundu ${crashPoint.toFixed(2)}x-də bitdi. Mərc qoyub növbəti raunda qoşula bilərsən.`)
    }

    setQueuedBet(false)
    setActiveWager(0)

    timeoutRef.current = window.setTimeout(() => {
      startCountdown()
    }, ROUND_RESULT_DELAY)
  }, [addBalance, playSound, startCountdown, stopAmbient])

  const launchRound = React.useCallback(() => {
    roundRef.current += 1
    const roundId = roundRef.current
    const spectatorMode = !queuedBet
    const nextTarget = Number(multiplierTarget.toFixed(2))
    const nextWager = Math.max(0, Math.round(wager))

    if (queuedBet) {
      if (nextWager <= 0) {
        setRoundMessage('Mərc 1 ⭐ və ya daha çox olmalıdır.')
        setQueuedBet(false)
        startCountdown()
        return
      }

      if (!withdrawBalance(nextWager, 'crash-bet')) {
        setRoundMessage('Balans kifayət etmədi. Mərc növbəti raund üçün ləğv olundu.')
        setQueuedBet(false)
        startCountdown()
        return
      }
    }

    setActiveWager(spectatorMode ? 0 : nextWager)
    setActiveTarget(nextTarget)
    setCurrentMultiplier(1)
    setRocketState('flying')
    setRoundMessage(spectatorMode ? 'Raund izləmə rejimində başladı.' : `Mərc qəbul edildi: ${nextWager} ⭐ • Hədəf: ${nextTarget.toFixed(2)}x`)
    ambientAudioRef.current = playSound(SOUND, true)

    const win = spectatorMode ? Math.random() > 0.55 : Math.random() > 0.5
    const crashPoint = spectatorMode
      ? Number((1.1 + Math.random() * 4.9).toFixed(2))
      : Number((win ? nextTarget : calculateBiasedLowMultiplier(nextTarget)).toFixed(2))

    setPlannedCrashPoint(crashPoint)

    const startTime = performance.now()
    const animate = (now: number) => {
      if (roundRef.current !== roundId) return
      const elapsed = now - startTime
      const growth = Math.max(0, elapsed / 900)
      const nextMultiplier = Number((1 + growth + (growth * growth * 0.65)).toFixed(2))

      if (nextMultiplier >= crashPoint) {
        finishRound(win, spectatorMode ? 0 : nextWager, nextTarget, crashPoint)
        return
      }

      setCurrentMultiplier(nextMultiplier)
      animationFrameRef.current = window.requestAnimationFrame(animate)
    }

    animationFrameRef.current = window.requestAnimationFrame(animate)
  }, [calculateBiasedLowMultiplier, finishRound, multiplierTarget, playSound, queuedBet, startCountdown, wager, withdrawBalance])

  React.useEffect(() => {
    if (roundNonce > 0) {
      launchRound()
    }
  }, [launchRound, roundNonce])

  React.useEffect(() => {
    startCountdown()
    return () => {
      clearTimers()
      stopAmbient()
    }
  }, [clearTimers, startCountdown, stopAmbient])

  const toggleQueuedBet = () => {
    if (rocketState !== 'countdown') return

    if (queuedBet) {
      setQueuedBet(false)
      setRoundMessage('Mərc ləğv olundu. İstəsən yenidən qoşula bilərsən.')
      return
    }

    const normalizedWager = Math.max(1, Math.round(wager || 0))
    if (normalizedWager > balance) {
      alert('Balans kifayət etmir!')
      return
    }

    setWager(normalizedWager)
    setQueuedBet(true)
    setRoundMessage(`Növbəti raund üçün ${normalizedWager} ⭐ mərc hazırlandı.`)
  }

  const progress = clamp((currentMultiplier - 1) / Math.max(plannedCrashPoint - 1, 0.2), 0, 1)
  const rocketStyle = {
    left: `${16 + progress * 70}%`,
    bottom: `${16 + Math.pow(progress, 1.45) * 54}%`,
    transform: `rotate(${72 - progress * 60}deg)`,
  }

  const multiplierColor = rocketState === 'crash'
    ? '#ff7070'
    : rocketState === 'win'
      ? '#72ff9f'
      : '#ffffff'

  return (
    <>
      <GambaUi.Portal target="screen">
        <ScreenWrapper>
          <StarsLayer1 style={{ opacity: currentMultiplier > 3 ? 0 : 1 }} />
          <LineLayer1 style={{ opacity: currentMultiplier > 3 ? 1 : 0 }} />
          <StarsLayer2 style={{ opacity: currentMultiplier > 2 ? 0 : 1 }} />
          <LineLayer2 style={{ opacity: currentMultiplier > 2 ? 1 : 0 }} />
          <StarsLayer3 style={{ opacity: currentMultiplier > 1 ? 0 : 1 }} />
          <LineLayer3 style={{ opacity: currentMultiplier > 1 ? 1 : 0 }} />

          <RoundBadge>
            {rocketState === 'countdown' ? `Uçuşa ${countdown}s qaldı` : rocketState === 'flying' ? 'Raund aktivdir' : 'Raund bitdi'}
          </RoundBadge>
          <RoundInfo>
            Aktiv mərc: {activeWager || 0} ⭐
            <br />
            Hədəf: {(rocketState === 'flying' || rocketState === 'win') ? activeTarget.toFixed(2) : multiplierTarget.toFixed(2)}x
          </RoundInfo>

          <CrashCurve $progress={progress} />
          <MultiplierText $color={multiplierColor}>{currentMultiplier.toFixed(2)}x</MultiplierText>
          <Rocket style={rocketStyle} />
          <Message>{roundMessage}</Message>
        </ScreenWrapper>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <ControlsGrid>
          <ControlCard>
            <CardLabel>Mərc • Telegram Stars</CardLabel>
            <ValueRow>
              <StepButton type="button" onClick={() => setWager((value) => Math.max(1, value - 1))}>-</StepButton>
              <ValueInput
                type="number"
                inputMode="numeric"
                min={1}
                value={wager}
                onChange={(e) => setWager(Math.max(1, Math.round(Number(e.target.value) || 1)))}
              />
              <StepButton type="button" onClick={() => setWager((value) => value + 1)}>+</StepButton>
            </ValueRow>
            <QuickActions>
              <QuickButton type="button" onClick={() => setWager(10)}>10 ⭐</QuickButton>
              <QuickButton type="button" onClick={() => setWager(25)}>25 ⭐</QuickButton>
              <QuickButton type="button" onClick={() => setWager((value) => Math.max(1, Math.round(value / 2)))}>1/2</QuickButton>
              <QuickButton type="button" onClick={() => setWager((value) => value * 2)}>2x</QuickButton>
            </QuickActions>
          </ControlCard>

          <ControlCard>
            <CardLabel>Hədəf əmsalı</CardLabel>
            <ValueRow>
              <StepButton type="button" onClick={() => setMultiplierTarget((value) => Number(clamp(Number((value - 0.25).toFixed(2)), 1.25, 15).toFixed(2)))}>-</StepButton>
              <ValueInput
                type="number"
                min={1.25}
                max={15}
                step={0.25}
                value={multiplierTarget}
                onChange={(e) => setMultiplierTarget(Number(clamp(Number(e.target.value) || 1.5, 1.25, 15).toFixed(2)))}
              />
              <StepButton type="button" onClick={() => setMultiplierTarget((value) => Number(clamp(Number((value + 0.25).toFixed(2)), 1.25, 15).toFixed(2)))}>+</StepButton>
            </ValueRow>
            <QuickActions>
              {[1.5, 2, 3, 5].map((value) => (
                <QuickButton key={value} type="button" onClick={() => setMultiplierTarget(value)}>{value.toFixed(2)}x</QuickButton>
              ))}
            </QuickActions>
          </ControlCard>

          <MainAction
            type="button"
            onClick={toggleQueuedBet}
            $armed={queuedBet}
            $disabled={rocketState !== 'countdown'}
            disabled={rocketState !== 'countdown'}
          >
            {rocketState !== 'countdown'
              ? 'Raund uçuşdadır'
              : queuedBet
                ? `Qoşuldun • ${wager} ⭐ • Ləğv et`
                : 'Növbəti raunda qoşul'}
          </MainAction>
        </ControlsGrid>
      </GambaUi.Portal>
    </>
  )
}
