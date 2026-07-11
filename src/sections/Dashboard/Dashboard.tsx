import styled from 'styled-components'
import { SlideSection } from '../../components/Slider'
import { GAMES } from '../../games'
import { GameCard } from './GameCard'
import ProfileSummary from './ProfileSummary'
import { WelcomeBanner } from './WelcomeBanner'

export function GameSlider() {
  return (
    <SlideSection>
      {GAMES.map((game) => (
        <div key={game.id} style={{ width: '160px', display: 'flex' }}>
          <GameCard game={game} />
        </div>
      ))}
    </SlideSection>
  )
}

const Grid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (min-width: 600px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 1000px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const Heading = styled.h2`
  margin: 4px 0 0;
  text-align: center;
  font-size: 28px;
`

export function GameGrid() {
  return (
    <Grid>
      {GAMES.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </Grid>
  )
}

export default function Dashboard() {
  return (
    <>
      <WelcomeBanner />
      <ProfileSummary />
      <Heading>Games</Heading>
      <GameGrid />
    </>
  )
}
