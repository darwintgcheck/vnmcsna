import { GameBundle } from 'gamba-react-ui-v2'
import { NavLink, useLocation } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'

const tileAnimation = keyframes`
  0% {
    background-position: -100px 100px;
  }
  100% {
    background-position: 100px -100px;
  }
`

const StyledGameCard = styled(NavLink)<{ $small: boolean; $background: string }>`
  width: 100%;
  aspect-ratio: ${(props) => (props.$small ? '1/.54' : '1/.7')};
  background-size: cover;
  border-radius: 20px;
  color: white;
  text-decoration: none;
  font-size: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  transform: scale(1);
  background: ${(props) => props.$background};
  max-height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 0;
  flex-shrink: 0;
  background-size: 100% auto;
  background-position: center;
  font-weight: bold;
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);

  & > .background {
    position: absolute;
    inset: 0;
    background-size: 100%;
    background-position: center;
    background-image: url(/stuff.png);
    background-repeat: repeat;
    transition: transform 0.2s ease, opacity 0.3s;
    animation: ${tileAnimation} 5s linear infinite;
    opacity: 0.08;
  }

  & > .gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(7, 9, 16, 0.12), rgba(7, 9, 16, 0.65));
    z-index: 1;
  }

  & > .image {
    position: absolute;
    inset: 0;
    background-size: 80% auto;
    background-position: center;
    background-repeat: no-repeat;
    transform: scale(0.92);
    transition: transform 0.2s ease;
    z-index: 2;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 32px rgba(0, 0, 0, 0.28);

    .image {
      transform: scale(0.98);
    }

    .background {
      opacity: 0.18;
    }
  }

  .play {
    font-size: 13px;
    border-radius: 999px;
    padding: 7px 12px;
    background: #00000088;
    position: absolute;
    right: 10px;
    bottom: 10px;
    opacity: 1;
    text-transform: uppercase;
    backdrop-filter: blur(20px);
    letter-spacing: 0.04em;
    z-index: 3;
  }

  @media (hover: hover) {
    .play {
      opacity: 0;
    }

    &:hover .play {
      opacity: 1;
    }
  }

  &:hover {
    outline: #9564ff33 solid 4px;
    outline-offset: 0px;
  }
`

export function GameCard({ game }: { game: GameBundle }) {
  const small = useLocation().pathname !== '/'

  return (
    <StyledGameCard to={'/' + game.id} $small={small ?? false} $background={game.meta?.background}>
      <div className="background" />
      <div className="gradient" />
      <div className="image" style={{ backgroundImage: `url(${game.meta.image})` }} />
      <div className="play">Oyna</div>
    </StyledGameCard>
  )
}
