import styled, { css, keyframes } from 'styled-components'

const appear = keyframes`
  0% { transform: scale(.85) translateY(30px) rotateY(30deg); opacity: 0; }
  100% { transform: scale(1) translateY(0) rotateY(0deg); opacity: 1; }
`

export const Container = styled.div`
  user-select: none;
  display: grid;
  gap: 22px;
  padding: 18px;
  min-height: 100%;
`

export const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const Option = styled.button<{ selected?: boolean }>`
  background: ${({ selected }) => (selected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)')};
  border: 1px solid ${({ selected }) => (selected ? 'rgba(94,231,255,0.4)' : 'rgba(255,255,255,0.08)')};
  margin: 0;
  padding: 12px 14px;
  transition: opacity .2s, background .2s ease, transform .2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 18px;
  color: white;
  font-weight: 800;

  & > div:first-child {
    font-size: 28px;
    line-height: 1;
  }

  &:hover {
    transform: translateY(-1px);
  }
`

export const Profit = styled.div`
  font-size: 18px;
  color: #0c260f;
  justify-self: center;
  border-radius: 999px;
  background: #69ff6d;
  padding: 10px 16px;
  font-weight: 900;
  animation: ${appear} .25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
`

export const CardPreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  border-radius: 12px;
  gap: 6px;
  justify-content: center;
`

export const CardsContainer = styled.div`
  min-height: 190px;
  transition: transform .2s ease;
  perspective: 500px;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  padding-left: 120px;

  @media (max-width: 640px) {
    padding-left: 80px;
    min-height: 170px;
  }
`

export const CardContainer = styled.div`
  position: absolute;
  transition: transform .25s cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity .25s ease;
  filter: drop-shadow(-10px 10px 0px #00000011);
  transform-origin: bottom;
  perspective: 500px;

  & > div {
    animation: ${appear} .25s cubic-bezier(0.5, 0.9, 0.35, 1.05);
  }
`

export const Card = styled.div<{$small?: boolean}>`
  ${(props) => props.$small ? css`
    height: 38px;
    font-size: 15px;
    padding: 5px;
    border-radius: 6px;
  ` : css`
    height: 160px;
    font-size: 70px;
    padding: 10px;
    border-radius: 10px;
  `}
  box-shadow: -5px 5px 10px 1px #0000003d;
  background: white;
  aspect-ratio: 4/5.5;
  position: relative;
  color: #333;
  overflow: hidden;

  .rank {
    font-weight: bold;
    line-height: 1em;
  }

  .suit {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 44%;
    height: 44%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: right bottom;
    opacity: .92;
  }
`
