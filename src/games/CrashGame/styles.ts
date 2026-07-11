import styled, { keyframes } from 'styled-components'
import rocketAnimation from './rocket.gif'

const generateMultipleBoxShadows = (n: number) => {
  const maxX = typeof window === 'undefined' ? 1440 : window.innerWidth
  const maxY = 4000

  let value = `${Math.random() * maxX}px ${Math.random() * maxY}px #ffffff`
  for (let i = 2; i <= n; i++) {
    value += `, ${Math.random() * maxX}px ${Math.random() * maxY}px #ffffff`
  }
  return value
}

const shadowsSmall = generateMultipleBoxShadows(700)
const shadowsMedium = generateMultipleBoxShadows(200)
const shadowsBig = generateMultipleBoxShadows(100)

export const animStar = keyframes`
  from {
    transform: translateY(-100vh);
  }
  to {
    transform: translateY(0);
  }
`

export const StarsLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  animation: ${animStar} linear infinite;
`

export const StarsLayer1 = styled(StarsLayer)`
  width: 1px;
  height: 1px;
  animation-duration: 150s;
  opacity: 1;
  transition: opacity 12s;
  box-shadow: ${shadowsSmall};
`

export const LineLayer1 = styled(StarsLayer)`
  width: 1px;
  height: 12px;
  top: -12px;
  animation-duration: 75s;
  opacity: 0;
  transition: opacity 2s;
  box-shadow: ${shadowsSmall};
`

export const StarsLayer2 = styled(StarsLayer)`
  width: 2px;
  height: 2px;
  animation-duration: 100s;
  box-shadow: ${shadowsMedium};
`

export const LineLayer2 = styled(StarsLayer)`
  width: 2px;
  height: 25px;
  top: -25px;
  animation-duration: 6s;
  opacity: 0;
  transition: opacity 1s;
  box-shadow: ${shadowsMedium};
`

export const StarsLayer3 = styled(StarsLayer)`
  width: 3px;
  height: 3px;
  animation-duration: 50s;
  box-shadow: ${shadowsBig};
`

export const LineLayer3 = styled(StarsLayer)`
  width: 2px;
  height: 50px;
  top: -50px;
  animation-duration: 3s;
  opacity: 0;
  transition: opacity 1s;
  box-shadow: ${shadowsBig};
`

export const ScreenWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
`

export const CrashCurve = styled.div<{ $progress: number }>`
  position: absolute;
  left: 32px;
  bottom: 32px;
  width: min(72vw, 520px);
  height: min(46vh, 280px);
  border-left: 2px solid rgba(255, 255, 255, 0.16);
  border-bottom: 2px solid rgba(255, 255, 255, 0.16);

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: ${({ $progress }) => `${Math.max(3, $progress * 100)}%`};
    height: ${({ $progress }) => `${Math.max(3, Math.pow($progress, 1.45) * 100)}%`};
    border-top: 3px solid #31e981;
    border-right: 3px solid #31e981;
    border-radius: 0 22px 0 0;
    box-shadow: 0 0 24px rgba(49, 233, 129, 0.35);
  }

  @media (max-width: 640px) {
    left: 16px;
    bottom: 20px;
    width: calc(100% - 32px);
    height: 200px;
  }
`

export const MultiplierText = styled.div<{ $color?: string }>`
  font-size: clamp(38px, 10vw, 76px);
  color: ${({ $color }) => $color || '#fff'};
  text-shadow: 0 0 20px rgba(255,255,255,0.45);
  z-index: 2;
  font-family: monospace;
  font-weight: 800;
`

export const RoundBadge = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(7, 12, 24, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #dbe8ff;
  font-size: 13px;
  font-weight: 700;
  backdrop-filter: blur(14px);
`

export const RoundInfo = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  padding: 8px 12px;
  border-radius: 14px;
  background: rgba(7, 12, 24, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #dbe8ff;
  font-size: 13px;
  font-weight: 700;
  backdrop-filter: blur(14px);
  text-align: right;
`

export const Message = styled.div`
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(7, 12, 24, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e6efff;
  font-size: 13px;
  font-weight: 700;
  backdrop-filter: blur(14px);
  max-width: calc(100% - 32px);
  text-align: center;
`

export const Rocket = styled.div`
  position: absolute;
  width: clamp(64px, 14vw, 120px);
  aspect-ratio: 1 / 1;
  background-image: url(${rocketAnimation});
  background-size: contain;
  background-repeat: no-repeat;
  transition: left 0.016s linear, bottom 0.016s linear, transform 0.016s linear;
  will-change: left, bottom, transform;
  z-index: 2;
`

export const ControlsGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

export const ControlCard = styled.div`
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 10px;
`

export const CardLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #98a7ce;
`

export const ValueRow = styled.div`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  gap: 8px;
`

export const StepButton = styled.button`
  min-height: 50px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
`

export const ValueInput = styled.input`
  min-height: 50px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  padding: 0 14px;
  font-size: 20px;
  font-weight: 800;
  text-align: center;
  outline: none;
`

export const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

export const QuickButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #dce5ff;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`

export const MainAction = styled.button<{ $armed?: boolean; $disabled?: boolean }>`
  min-height: 64px;
  border: none;
  border-radius: 18px;
  background: ${({ $armed }) => ($armed ? 'linear-gradient(135deg, #fbbf24, #fb7185)' : 'linear-gradient(135deg, #34d399, #22c55e)')};
  color: #08110f;
  font-size: 18px;
  font-weight: 900;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`
