import styled from 'styled-components'

const Card = styled.section`
  display: grid;
  grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
  padding: 20px;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(21, 21, 32, 0.96), rgba(10, 10, 16, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`

const Visual = styled.div`
  border-radius: 20px;
  min-height: 240px;
  background:
    linear-gradient(180deg, rgba(10, 10, 16, 0.18), rgba(10, 10, 16, 0.72)),
    url('/fakemoney.png') center/cover no-repeat;
  border: 1px solid rgba(255, 255, 255, 0.08);
`

const Meta = styled.div`
  display: grid;
  gap: 14px;
`

const Eyebrow = styled.div`
  color: #98a0b8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const Title = styled.h2`
  margin: 0;
  font-size: clamp(24px, 5vw, 32px);
`

const Description = styled.p`
  margin: 0;
  color: #ccd3e7;
  line-height: 1.75;
  font-size: 15px;
`

const Facts = styled.div`
  display: grid;
  gap: 12px;
`

const Fact = styled.div`
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
`

const FactTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 5px;
`

const FactText = styled.div`
  color: #bfc7db;
  line-height: 1.6;
  font-size: 14px;
`

export default function ProfileSummary() {
  return (
    <Card>
      <Visual aria-label="Casino information artwork" />
      <Meta>
        <div>
          <Eyebrow>About the casino</Eyebrow>
          <Title>Built for Telegram, designed like a real casino</Title>
        </div>

        <Description>
          The lower part of the home page now carries the product story instead of pushing the games out of view.
          Layout blocks, artwork framing, and mobile spacing were cleaned up to feel closer to a real casino mini app.
        </Description>

        <Facts>
          <Fact>
            <FactTitle>Cleaner structure</FactTitle>
            <FactText>Important actions stay visible without squeezing the title or cutting the content on smaller screens.</FactText>
          </Fact>
          <Fact>
            <FactTitle>Game-first flow</FactTitle>
            <FactText>The games are surfaced first, while the showcase and information sections remain lower and more organized.</FactText>
          </Fact>
          <Fact>
            <FactTitle>Crash polish</FactTitle>
            <FactText>Crash now avoids fake spectator wins, follows a slower aviator-style flight, and reports queued bettors live.</FactText>
          </Fact>
        </Facts>
      </Meta>
    </Card>
  )
}
