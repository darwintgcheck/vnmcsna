import styled from 'styled-components'
import { GAMES } from '../../games'
import { GameCard } from './GameCard'
import ProfileSummary from './ProfileSummary'
import { WelcomeBanner } from './WelcomeBanner'

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
  display: grid;
  gap: 10px;
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
  max-width: 680px;
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
            <Eyebrow>Casino lobby</Eyebrow>
            <Heading>Choose your game</Heading>
          </div>
          <SubText>
            Fast mobile navigation, cleaner English labels, and a more realistic casino layout keep the games first while account and product details stay organized below.
          </SubText>
        </HeadingWrap>
        <GameGrid />
      </Section>

      <WelcomeBanner />
      <ProfileSummary />
    </>
  )
}
