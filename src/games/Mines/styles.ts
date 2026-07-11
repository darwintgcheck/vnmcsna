import styled, { css, keyframes } from 'styled-components'
import { CellStatus } from './types'

const tickingAnimation = keyframes`
  0%, 50%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  25% {
    transform: scale(0.95);
    filter: brightness(1.5);
  }
`

const goldReveal = keyframes`
  0% {
    filter: brightness(1);
    transform: scale(1.1);
  }
  75% {
    filter: brightness(2);
    transform: scale(1.2);
  }
`

const mineReveal = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  51% {
    background: #ffffff;
    transform: scale(1.6);
  }
`

export const Container2 = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 12px;
  min-height: 100%;
  padding: 18px;
`

export const Container = styled.div`
  display: grid;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  user-select: none;
  backdrop-filter: blur(20px);
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 10px;
`

export const Levels = styled.div`
  border-radius: 18px;
  color: gray;
  background: rgba(41, 42, 48, 0.72);
  overflow-x: auto;
  width: 100%;
  display: flex;
  align-items: stretch;
  min-height: 62px;
  padding: 6px;
  gap: 6px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const Level = styled.div<{$active: boolean}>`
  flex: 0 0 96px;
  text-align: center;
  padding: 10px 8px;
  opacity: .7;
  border-radius: 14px;
  color: #d9dceb;
  background: rgba(255, 255, 255, 0.03);

  & > div:first-child {
    font-size: 11px;
    color: #9ea6c7;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  & > div:last-child {
    margin-top: 4px;
    font-weight: 800;
  }

  ${(props) => props.$active && css`
    background: rgba(255, 255, 255, 0.12);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
    color: #32cd5e;
    opacity: 1;
  `}
`

export const CellButton = styled.button<{status: CellStatus, selected: boolean}>`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  background: #9358ff;
  background-size: 100%;
  border: none;
  border-bottom: 5px solid #00000055;
  border-radius: 10px;
  font-weight: bold;
  aspect-ratio: 1;
  width: min(72px, 18vw);
  min-width: 58px;
  transition: background 0.3s, opacity .3s, filter .2s ease;
  font-size: 12px;
  cursor: pointer;

  ${(props) => props.selected && css`
    animation: ${tickingAnimation} .5s ease infinite;
    z-index: 10;
    opacity: 1!important;
  `}

  ${(props) => props.status === 'gold' && css`
    color: white;
    background: linear-gradient(180deg, #25d366, #138a4d);
    animation: ${goldReveal} .5s ease;
    opacity: 1;
  `}

  ${(props) => props.status === 'mine' && css`
    background: #ff5252;
    z-index: 10;
    animation: ${mineReveal} .3s ease;
    opacity: 1;
  `}

  ${(props) => props.status === 'hidden' && css`
    &:disabled {
      opacity: .5;
    }
  `}

  &:disabled {
    cursor: default;
  }

  &:hover:not(:disabled) {
    filter: brightness(1.12);
  }
`

export const StatusBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: white;

  & > div:first-child {
    display: flex;
    color: #ffffffCC;
    gap: 20px;
    flex-wrap: wrap;
  }
`
