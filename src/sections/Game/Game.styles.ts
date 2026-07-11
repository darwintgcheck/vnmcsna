import styled, { css, keyframes } from 'styled-components'

const splashAnimation = keyframes`
  0% {
    opacity: 1;
  }
  30%, 75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`

export const loadingAnimation = keyframes`
  0% { left: 0%; transform: translateX(-100%); }
  100% { left: 100%; transform: translateX(50%); }
`

export const Container = styled.div`
  width: 100%;
  position: relative;
  display: grid;
  gap: 12px;
`

export const Splash = styled.div`
  pointer-events: none;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  animation: ${splashAnimation} .75s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  background: #0c0c11;
  font-size: 42px;
  font-weight: bold;
`

export const Screen = styled.div`
  position: relative;
  flex-grow: 1;
  background: #0c0c11;
  border-radius: 18px;
  overflow: hidden;
  transition: height .2s ease;
  height: clamp(260px, 44vh, 520px);
  min-height: 260px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`

export const IconButton = styled.button`
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 0;
  min-width: 46px;
  height: 46px;
  justify-content: center;
  align-items: center;
  display: flex;
  margin: 0;
  cursor: pointer;
  font-size: 16px;
  border-radius: 14px;
  color: white;

  &:hover {
    background: #ffffff22;
  }
`

export const ExitButton = styled.a`
  min-height: 46px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.08);
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`

export const Controls = styled.div`
  width: 100%;
  background: linear-gradient(180deg, rgba(26, 27, 40, 0.98), rgba(18, 19, 29, 0.98));
  padding: 14px;
  color: white;
  border-radius: 18px;
  z-index: 6;
  border: 1px solid rgba(255, 255, 255, 0.08);

  & > div {
    width: 100%;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  @media (max-width: 800px) {
    padding: 12px;

    & > div {
      flex-direction: column;
      align-items: stretch;
    }
  }
`

export const MetaControls = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 6;
  gap: 12px;
`

export const MetaGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

export const spinnerAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const Spinner = styled.div<{$small?: boolean}>`
  --spinner-size: 1em;
  --spinner-border: 2px;
  --color: white;
  animation: ${spinnerAnimation} 1s ease infinite;
  transform: translateZ(0);

  border-top: var(--spinner-border) solid var(--color);
  border-right: var(--spinner-border) solid var(--color);
  border-bottom: var(--spinner-border) solid var(--color);
  border-left: var(--spinner-border) solid transparent;
  background: transparent;
  height: var(--spinner-size);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
`
