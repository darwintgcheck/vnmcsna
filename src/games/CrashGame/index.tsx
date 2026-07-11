import { GambaUi } from 'gamba-react-ui-v2'
import React from 'react'
import { useUserStore } from '../hooks/useUserStore'
import { didPlayerWin } from '../../utils/houseEdge'
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
  const [roundMessage, setRoundMessage] = React.useState('The next flight starts in 10 seconds.')
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
  const activeSoundsRef = React.useRef<Set<HTMLAudioElement>>(new Set())

  const registerAudio = React.useCallback((audio: HTMLAudioElement) => {
    activeSoundsRef.current.add(audio)
    audio.addEventListener('ended', () => activeSoundsRef.current.delete(audio), { once: true })
  }, [])

  const playSound = React.useCallback((src: string, loop = false, volume = 0.55) => {
    try {
      const audio = new Audio(src)
      audio.loop = loop
      audio.volume = volume
      registerAudio(audio)
      void audio.play().catch(() => undefined)
      return audio
    } catch {
      return null
    }
  }, [registerAudio])

  const stopAllAudio = React.useCallback(() => {
    activeSoundsRef.current.forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
    })
    activeSoundsRef.current.clear()
    ambientAudioRef.current = null
  }, [])

  const stopAmbient = React.useCallback(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause()
      ambientAudioRef.current.currentTime = 0
      activeSoundsRef.current.delete(ambientAudioRef.current)
      ambientAudioRef.current = null
    }
  }, [])

  const calculateBiasedLowMultiplier = React.useCallback((target: number) => {
    const randomValue = Math.random()
    const maxPossibleMultiplier = Math.min(target, 12)
    const exponent = randomValue > 0.95 ? 2.8 : target > 10 ? 5 : 6
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
    setRoundMessage('Countdown started. The next flight launches automatically.')

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
    playSound(won ? WIN_SOUND : CRASH_SOUND, false, 0.8)
    setRocketState(won ? 'win' : 'crash')
    setCurrentMultiplier(crashPoint)

    if (won && wagerAmount > 0) {
      const payout = Math.round(wagerAmount * target)
      addBalance(payout, 'crash-win')
      setRoundMessage(`The rocket reached ${target.toFixed(2)}x. You won +${payout} ⭐.`)
    } else if (wagerAmount > 0) {
      setRoundMessage(`The rocket crashed at ${crashPoint.toFixed(2)}x. This round was lost.`)
    } else {
      setRoundMessage(`Spectator round ended at ${crashPoint.toFixed(2)}x. Join the next round to play.`)
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
        setRoundMessage('The wager must be at least 1 ⭐.')
        setQueuedBet(false)
        startCountdown()
        return
      }

      if (!withdrawBalance(nextWager, 'crash-bet')) {
        setRoundMessage('Not enough balance. The bet was cancelled for the next round.')
        setQueuedBet(false)
        startCountdown()
        return
      }
    }

    setActiveWager(spectatorMode ? 0 : nextWager)
    setActiveTarget(nextTarget)
    setCurrentMultiplier(1)
    setRocketState('flying')
    setRoundMessage(spectatorMode ? 'Spectator round started.' : `Bet accepted: ${nextWager} ⭐ • Target: ${nextTarget.toFixed(2)}x`)
    ambientAudioRef.current = playSound(SOUND, true, 0.35)

    const won = spectatorMode ? didPlayerWin(0.45) : didPlayerWin()
    const crashPoint = spectatorMode
      ? Number((1.1 + Math.random() * 4.9).toFixed(2))
      : Number((won ? nextTarget : calculateBiasedLowMultiplier(nextTarget)).toFixed(2))

    setPlannedCrashPoint(crashPoint)

    const startTime = performance.now()
    const animate = (now: number) => {
      if (roundRef.current !== roundId) return
      const elapsed = now - startTime
      const growth = Math.max(0, elapsed / 1200)
      const nextMultiplier = Number((1 + growth * 0.78 + growth * growth * 0.48).toFixed(2))

      if (nextMultiplier >= crashPoint) {
        finishRound(won, spectatorMode ? 0 : nextWager, nextTarget, crashPoint)
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
    const handlePageHide = () => stopAllAudio()
    window.addEventListener('pagehide', handlePageHide)
    return () => {
      clearTimers()
      stopAllAudio()
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [clearTimers, startCountdown, stopAllAudio])

  const toggleQueuedBet = () => {
    if (rocketState !== 'countdown') return

    if (queuedBet) {
      setQueuedBet(false)
      setRoundMessage('Bet cancelled. You can join again anytime before launch.')
      return
    }

    const normalizedWager = Math.max(1, Math.round(wager || 0))
    if (normalizedWager > balance) {
      alert('Not enough balance!')
      return
    }

    setWager(normalizedWager)
    setQueuedBet(true)
    setRoundMessage(`Prepared ${normalizedWager} ⭐ for the next round.`)
  }

  const progress = clamp((currentMultiplier - 1) / Math.max(plannedCrashPoint - 1, 0.2), 0, 1)
  const rocketStyle = {
    left: `${16 + progress * 70}%`,
    bottom: `${16 + Math.pow(progress, 1.35) * 54}%`,
    transform: `translate3d(0, 0, 0) rotate(${72 - progress * 60}deg)`,
  }

  const multiplierColor = rocketState === 'crash' ? '#ff7070' : rocketState === 'win' ? '#72ff9f' : '#ffffff'

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
            {rocketState === 'countdown' ? `Launch in ${countdown}s` : rocketState === 'flying' ? 'Round in progress' : 'Round finished'}
          </RoundBadge>
          <RoundInfo>
            Active wager: {activeWager || 0} ⭐
            <br />
            Target: {(rocketState === 'flying' || rocketState === 'win') ? activeTarget.toFixed(2) : multiplierTarget.toFixed(2)}x
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
            <CardLabel>Wager • Telegram Stars</CardLabel>
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
            <CardLabel>Target multiplier</CardLabel>
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
              ? 'Flight in progress'
              : queuedBet
                ? `Joined • ${wager} ⭐ • Cancel`
                : 'Join next round'}
          </MainAction>
        </ControlsGrid>
      </GambaUi.Portal>
    </>
  )
}
