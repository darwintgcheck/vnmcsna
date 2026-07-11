import { GambaUi, useSoundStore } from 'gamba-react-ui-v2'
import React from 'react'
import { useUserStore } from '../hooks/useUserStore'
import { getCrashLiveStats, updateCrashPresence } from '../../lib/api'
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
const LIVE_POLL_INTERVAL = 2000
const CRASH_HOUSE_EDGE = 0.03
const MAX_CRASH_POINT = 100

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const generateCrashPoint = () => {
  const seed = Math.random()

  if (seed < CRASH_HOUSE_EDGE) {
    return 1
  }

  const rawPoint = (1 - CRASH_HOUSE_EDGE) / Math.max(1 - Math.random(), 0.0001)
  return Number(clamp(Number(rawPoint.toFixed(2)), 1, MAX_CRASH_POINT).toFixed(2))
}

export default function CrashGame() {
  const { balance, withdrawBalance, addBalance, currentUser } = useUserStore()
  const soundStore = useSoundStore()

  const [wager, setWager] = React.useState(10)
  const [multiplierTarget, setMultiplierTarget] = React.useState(1.5)
  const [currentMultiplier, setCurrentMultiplier] = React.useState(1)
  const [rocketState, setRocketState] = React.useState<'countdown' | 'flying' | 'win' | 'crash'>('countdown')
  const [countdown, setCountdown] = React.useState(COUNTDOWN_SECONDS)
  const [roundMessage, setRoundMessage] = React.useState('')
  const [queuedBet, setQueuedBet] = React.useState(false)
  const [activeWager, setActiveWager] = React.useState(0)
  const [activeTarget, setActiveTarget] = React.useState(1.5)
  const [plannedCrashPoint, setPlannedCrashPoint] = React.useState(1.5)
  const [roundNonce, setRoundNonce] = React.useState(0)
  const [liveBettors, setLiveBettors] = React.useState(0)

  const roundRef = React.useRef(0)
  const lastLaunchedNonceRef = React.useRef(0)
  const countdownTimerRef = React.useRef<number | null>(null)
  const animationFrameRef = React.useRef<number | null>(null)
  const timeoutRef = React.useRef<number | null>(null)
  const ambientAudioRef = React.useRef<HTMLAudioElement | null>(null)
  const activeSoundsRef = React.useRef<Set<HTMLAudioElement>>(new Set())
  const soundVolumeRef = React.useRef(soundStore.volume)
  const currentUserIdRef = React.useRef<number | null>(currentUser?.telegramId || null)
  const wagerRef = React.useRef(wager)
  const multiplierTargetRef = React.useRef(multiplierTarget)

  React.useEffect(() => {
    soundVolumeRef.current = soundStore.volume
  }, [soundStore.volume])

  React.useEffect(() => {
    currentUserIdRef.current = currentUser?.telegramId || null
  }, [currentUser?.telegramId])

  React.useEffect(() => {
    wagerRef.current = wager
  }, [wager])

  React.useEffect(() => {
    multiplierTargetRef.current = multiplierTarget
  }, [multiplierTarget])

  const registerAudio = React.useCallback((audio: HTMLAudioElement) => {
    activeSoundsRef.current.add(audio)
    audio.addEventListener('ended', () => activeSoundsRef.current.delete(audio), { once: true })
  }, [])

  const playSound = React.useCallback((src: string, loop = false, volume = 0.55) => {
    const currentVolume = soundVolumeRef.current

    if (!currentVolume) {
      return null
    }

    try {
      const audio = new Audio(src)
      audio.loop = loop
      audio.volume = Math.min(1, volume * Math.max(currentVolume, 0.15))
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

  const syncPresence = React.useCallback(async (active: boolean) => {
    const telegramId = currentUserIdRef.current
    if (!telegramId) return

    try {
      const response = await updateCrashPresence({
        telegramId,
        active,
        wager: wagerRef.current,
        target: multiplierTargetRef.current,
      })
      setLiveBettors(response.queuedBettors)
    } catch {
      // noop
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
    setRoundMessage('')

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

  const finishRound = React.useCallback((won: boolean, wagerAmount: number, target: number, finalPoint: number) => {
    stopAmbient()

    if (wagerAmount > 0) {
      playSound(won ? WIN_SOUND : CRASH_SOUND, false, 0.8)
    }

    setRocketState(won ? 'win' : 'crash')
    setCurrentMultiplier(finalPoint)

    if (won && wagerAmount > 0) {
      const payout = Math.round(wagerAmount * target)
      addBalance(payout, 'crash-win')
      setRoundMessage(`Auto cash out hit ${target.toFixed(2)}x. You won +${payout} ⭐.`)
    } else if (wagerAmount > 0) {
      setRoundMessage(`The rocket crashed at ${finalPoint.toFixed(2)}x. This round was lost.`)
    } else {
      setRoundMessage(`Round ended at ${finalPoint.toFixed(2)}x. Join the next round to play.`)
    }

    setActiveWager(0)
    timeoutRef.current = window.setTimeout(() => {
      startCountdown()
    }, ROUND_RESULT_DELAY)
  }, [addBalance, playSound, startCountdown, stopAmbient])

  const launchRound = React.useCallback(() => {
    roundRef.current += 1
    const roundId = roundRef.current
    const spectatorMode = !queuedBet
    const nextTarget = Number(multiplierTargetRef.current.toFixed(2))
    const nextWager = Math.max(0, Math.round(wagerRef.current))

    if (queuedBet) {
      if (nextWager <= 0) {
        setRoundMessage('The wager must be at least 1 ⭐.')
        setQueuedBet(false)
        void syncPresence(false)
        startCountdown()
        return
      }

      if (!withdrawBalance(nextWager, 'crash-bet')) {
        setRoundMessage('Not enough balance. The bet was cancelled for the next round.')
        setQueuedBet(false)
        void syncPresence(false)
        startCountdown()
        return
      }
    }

    const crashPoint = generateCrashPoint()
    const playerWon = !spectatorMode && crashPoint >= nextTarget
    const roundEndPoint = spectatorMode ? crashPoint : (playerWon ? nextTarget : crashPoint)

    setActiveWager(spectatorMode ? 0 : nextWager)
    setActiveTarget(nextTarget)
    setCurrentMultiplier(1)
    setRocketState('flying')
    setQueuedBet(false)
    setPlannedCrashPoint(roundEndPoint)
    void syncPresence(false)
    setRoundMessage(
      spectatorMode
        ? 'Spectator round started.'
        : `Bet accepted: ${nextWager} ⭐ • Auto cash out: ${nextTarget.toFixed(2)}x`,
    )
    ambientAudioRef.current = playSound(SOUND, true, 0.35)

    const durationMs = Math.max(3800, Math.round(3200 + Math.log2(Math.max(roundEndPoint, 1) + 1) * 2400))
    const startTime = performance.now()

    const animate = (now: number) => {
      if (roundRef.current !== roundId) return

      const elapsed = now - startTime
      const timeProgress = clamp(elapsed / durationMs, 0, 1)
      const easedProgress = Math.pow(timeProgress, 1.35)
      const nextMultiplier = Number(
        Math.min(
          roundEndPoint,
          Math.max(1, Math.exp(Math.log(Math.max(roundEndPoint, 1)) * easedProgress)),
        ).toFixed(2),
      )

      if (timeProgress >= 1 || nextMultiplier >= roundEndPoint) {
        finishRound(playerWon, spectatorMode ? 0 : nextWager, nextTarget, roundEndPoint)
        return
      }

      setCurrentMultiplier(nextMultiplier)
      animationFrameRef.current = window.requestAnimationFrame(animate)
    }

    animationFrameRef.current = window.requestAnimationFrame(animate)
  }, [finishRound, playSound, queuedBet, startCountdown, syncPresence, withdrawBalance])

  React.useEffect(() => {
    if (roundNonce <= 0 || lastLaunchedNonceRef.current === roundNonce) return
    lastLaunchedNonceRef.current = roundNonce
    launchRound()
  }, [launchRound, roundNonce])

  React.useEffect(() => {
    startCountdown()
    void refreshLiveBettors()

    const pollId = window.setInterval(() => {
      void refreshLiveBettors()
    }, LIVE_POLL_INTERVAL)

    const handlePageHide = () => {
      stopAllAudio()
      void syncPresence(false)
    }

    window.addEventListener('pagehide', handlePageHide)
    return () => {
      clearTimers()
      stopAllAudio()
      void syncPresence(false)
      window.clearInterval(pollId)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [clearTimers, refreshLiveBettors, startCountdown, stopAllAudio, syncPresence])

  React.useEffect(() => {
    if (!soundStore.volume) {
      stopAllAudio()
    }
  }, [soundStore.volume, stopAllAudio])

  React.useEffect(() => {
    if (queuedBet && rocketState === 'countdown') {
      void syncPresence(true)
      const heartbeat = window.setInterval(() => {
        void syncPresence(true)
      }, 12_000)

      return () => {
        window.clearInterval(heartbeat)
      }
    }

    if (currentUser?.telegramId) {
      void syncPresence(false)
    }
  }, [currentUser?.telegramId, queuedBet, rocketState, syncPresence])

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
    bottom: `${16 + Math.pow(progress, 1.22) * 52}%`,
    transform: `translate3d(0, 0, 0) rotate(${70 - progress * 52}deg)`,
  }

  const multiplierColor = rocketState === 'crash' ? '#ff7070' : rocketState === 'win' ? '#72ff9f' : '#ffffff'
  const statusText = rocketState === 'countdown' ? `Launch in ${countdown}s` : rocketState === 'flying' ? 'Round in progress' : 'Round finished'
  const screenMessage = rocketState === 'countdown' ? (queuedBet ? roundMessage : '') : roundMessage

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

          <RoundBadge>{statusText}</RoundBadge>
          <RoundInfo>
            Live bettors: {liveBettors}
            <br />
            Active wager: {activeWager || 0} ⭐
            <br />
            Target: {(rocketState === 'flying' || rocketState === 'win') ? activeTarget.toFixed(2) : multiplierTarget.toFixed(2)}x
          </RoundInfo>

          <CrashCurve $progress={progress} />
          <MultiplierText $color={multiplierColor}>{currentMultiplier.toFixed(2)}x</MultiplierText>
          <Rocket style={rocketStyle} />
          {screenMessage && <Message>{screenMessage}</Message>}
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
