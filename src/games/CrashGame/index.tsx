import React from 'react'
import { useUserStore } from '../hooks/useUserStore'
import CustomSlider from './Slider'
import CRASH_SOUND from './crash.mp3'
import SOUND from './music.mp3'
import WIN_SOUND from './win.mp3'
import {
  LineLayer1,
  LineLayer2,
  LineLayer3,
  MultiplierText,
  Rocket,
  ScreenWrapper,
  StarsLayer1,
  StarsLayer2,
  StarsLayer3,
} from './styles'

export default function CrashGame() {
  const { balance, withdrawBalance, addBalance } = useUserStore()
  const [wager, setWager] = React.useState(0)
  const [multiplierTarget, setMultiplierTarget] = React.useState(1.5)
  const [currentMultiplier, setCurrentMultiplier] = React.useState(0)
  const [rocketState, setRocketState] = React.useState<'idle' | 'win' | 'crash'>('idle')

  // Sadə audio controller
  const playSound = (src: string) => {
    const audio = new Audio(src)
    audio.play()
  }

  const getRocketStyle = () => {
    const maxMultiplier = 1
    const progress = Math.min(currentMultiplier / maxMultiplier, 1)

    const leftOffset = 20
    const bottomOffset = 30
    const left = progress * (100 - leftOffset)
    const bottom = Math.pow(progress, 5) * (100 - bottomOffset)
    const rotationProgress = Math.pow(progress, 2.3)
    const startRotationDeg = 90
    const rotation = (1 - rotationProgress) * startRotationDeg

    return {
      bottom: `${bottom}%`,
      left: `${left}%`,
      transform: `rotate(${rotation}deg)`,
    }
  }

  const doTheIntervalThing = (
    currentMultiplier: number,
    targetMultiplier: number,
    win: boolean,
  ) => {
    const nextIncrement = 0.01 * (Math.floor(currentMultiplier) + 1)
    const nextValue = currentMultiplier + nextIncrement

    setCurrentMultiplier(nextValue)

    if (nextValue >= targetMultiplier) {
      playSound(win ? WIN_SOUND : CRASH_SOUND)
      setRocketState(win ? 'win' : 'crash')
      setCurrentMultiplier(targetMultiplier)
      return
    }

    setTimeout(() => doTheIntervalThing(nextValue, targetMultiplier, win), 50)
  }

  const multiplierColor =
    rocketState === 'crash' ? '#ff0000' :
    rocketState === 'win' ? '#00ff00' :
    '#ffffff'

  // Məğlub olma ehtimalını hesablamaq
  const calculateBiasedLowMultiplier = (targetMultiplier: number) => {
    const randomValue = Math.random()
    const maxPossibleMultiplier = Math.min(targetMultiplier, 12)
    const exponent = randomValue > 0.95 ? 2.8 : (targetMultiplier > 10 ? 5 : 6)
    const result = 1 + Math.pow(randomValue, exponent) * (maxPossibleMultiplier - 1)
    return parseFloat(result.toFixed(2))
  }

  const play = async () => {
    if (wager <= 0 || wager > balance) {
      alert("Balans kifayət deyil!")
      return
    }

    // Mərc çıxılır
    withdrawBalance(wager)

    setRocketState('idle')
    playSound(SOUND)

    // Qazanc olub-olmamasını random təyin edirik
    const win = Math.random() > 0.5
    const multiplierResult = win ? multiplierTarget : calculateBiasedLowMultiplier(multiplierTarget)

    doTheIntervalThing(0, multiplierResult, win)

    // Əgər udursa → uduş əlavə olunur
    if (win) {
      addBalance(wager * multiplierTarget)
    }
  }

  return (
    <>
      {/* Oyun ekranı */}
      <div>
        <ScreenWrapper>
          <StarsLayer1 style={{ opacity: currentMultiplier > 3 ? 0 : 1 }} />
          <LineLayer1 style={{ opacity: currentMultiplier > 3 ? 1 : 0 }} />
          <StarsLayer2 style={{ opacity: currentMultiplier > 2 ? 0 : 1 }} />
          <LineLayer2 style={{ opacity: currentMultiplier > 2 ? 1 : 0 }} />
          <StarsLayer3 style={{ opacity: currentMultiplier > 1 ? 0 : 1 }} />
          <LineLayer3 style={{ opacity: currentMultiplier > 1 ? 1 : 0 }} />
          <MultiplierText color={multiplierColor}>
            {currentMultiplier.toFixed(2)}x
          </MultiplierText>
          <Rocket style={getRocketStyle()} />
        </ScreenWrapper>
      </div>

      {/* İdarəetmə paneli */}
      <div style={{ marginTop: 20 }}>
        <input
          type="number"
          value={wager}
          onChange={(e) => setWager(Number(e.target.value))}
          placeholder="Mərc məbləği"
        />
        <CustomSlider
          value={multiplierTarget}
          onChange={setMultiplierTarget}
        />
        <button onClick={play}>Play</button>
      </div>
    </>
  )
}
