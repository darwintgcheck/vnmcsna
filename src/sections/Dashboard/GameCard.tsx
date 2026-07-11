import { GameBundle } from 'gamba-react-ui-v2'
import { NavLink } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'

const tileAnimation = keyframes`
  0% {
    background-position: -100px 100px;
  }
  100% {
    background-position: 100px -100px;
  }
`

const StyledGameCard = styled(NavLink)<{ $background: string }>`
  width: 100%;
  aspect-ratio: 1 / 0.72;
  border-radius: 20px;
  color: white;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  background: ${(props) => props.$background};
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
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
    background: linear-gradient(180deg, rgba(7, 9, 16, 0.12), rgba(7, 9, 16, 0.68));
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
    outline: #9564ff33 solid 4px;
    outline-offset: 0;

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
`

export function GameCard({ game }: { game: GameBundle }) {
  return (
    <StyledGameCard to={'/' + game.id} $background={game.meta?.background}>
      <div className="background" />
      <div className="gradient" />
      <div className="image" style={{ backgroundImage: `url(${game.meta.image})` }} />
      <div className="play">Play</div>
    </StyledGameCard>
  )
}
