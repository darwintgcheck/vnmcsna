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

const Section = styled.section`
  display: grid;
  gap: 14px;
`

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

const HeadingWrap = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

const Eyebrow = styled.div`
  color: #9aa5c8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const Heading = styled.h2`
  margin: 4px 0 0;
  font-size: clamp(26px, 5vw, 34px);
`

const SubText = styled.p`
  margin: 0;
  color: #c3cce4;
  line-height: 1.6;
  font-size: 14px;
  max-width: 560px;
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
      <Section>
        <HeadingWrap>
          <div>
            <Eyebrow>Games first</Eyebrow>
            <Heading>Choose a game</Heading>
          </div>
          <SubText>Mobile layout was cleaned up so the games open first and the product information stays lower on the page.</SubText>
        </HeadingWrap>
        <GameGrid />
      </Section>

      <WelcomeBanner />
      <ProfileSummary />
    </>
  )
}
