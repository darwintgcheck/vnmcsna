import React from 'react'
import { SLOT_ITEMS, SlotItem } from './constants'
import styled, { css, keyframes } from 'styled-components'
import { StyledSpinner } from './Slot.styles'

interface SlotProps {
  revealed: boolean
  good: boolean
  index: number
  item?: SlotItem
}

const reveal = keyframes`
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0%);
    opacity: 1;
  }
`

const pulse = keyframes`
  0%, 30% {
    transform: scale(1);
  }
  10% {
    transform: scale(1.3);
  }
`

const StyledSlot = styled.div<{ $good: boolean; $revealed: boolean }>`
  width: min(30vw, 116px);
  min-width: 92px;
  aspect-ratio: 1 / 1.5;
  position: relative;
  background: #4444ff11;
  overflow: hidden;
  border-radius: 16px;
  border: 2px solid #2d2d57;
  transition: background 0.2s, border 0.2s, box-shadow 0.2s;

  ${(props) => props.$revealed && css`
    box-shadow: 0 0 18px rgba(255, 236, 99, 0.2);
  `}

  ${(props) => props.$good && css`
    border-color: #ffec63;
  `}
`

const Revealed = styled.div<{ $revealed: boolean; $good: boolean }>`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 10px;
  transition: opacity 0.2s, transform 0.3s ease;
  transform: translateY(-100%);
  opacity: 0;

  ${(props) => props.$revealed && css`
    opacity: 1;
    transform: translateY(0%);
    animation: ${reveal} cubic-bezier(0.18, 0.89, 0.32, 1.3) 0.25s;
  `}

  ${(props) => props.$good && css`
    & > img {
      animation: ${pulse} 2s 0.25s cubic-bezier(0.04, 1.14, 0.48, 1.63) infinite;
    }
  `}
`

export function Slot({ revealed, good, item, index }: SlotProps) {
  const items = React.useMemo(() => [...SLOT_ITEMS].sort(() => Math.random() - 0.5), [])

  return (
    <StyledSlot $good={good} $revealed={revealed}>
      <StyledSpinner data-spinning={!revealed}>
        {items.map((slotItem, i) => (
          <div key={i}>
            <img className="slotImage" src={slotItem.image} />
          </div>
        ))}
      </StyledSpinner>
      {item && (
        <Revealed className="revealedSlot" $revealed={revealed} $good={revealed && good}>
          <img className="slotImage" src={item.image} style={{ animationDelay: index * 0.25 + 's' }} />
        </Revealed>
      )}
    </StyledSlot>
  )
}
