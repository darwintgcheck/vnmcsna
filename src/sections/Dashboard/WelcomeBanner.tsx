import styled from 'styled-components'
import { SITE_NAME } from '../../constants'
import { useUserStore } from '../../hooks/useUserStore'

const Welcome = styled.section`
  background:
    radial-gradient(circle at top left, rgba(140, 98, 255, 0.45), transparent 35%),
    radial-gradient(circle at bottom right, rgba(94, 231, 255, 0.2), transparent 30%),
    linear-gradient(135deg, #11111a, #09090f);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(220px, 320px);
  gap: 18px;
  align-items: center;
  color: white;
  overflow: hidden;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`

const Eyebrow = styled.div`
  display: inline-flex;
  width: fit-content;
  margin-bottom: 10px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const Title = styled.h1`
  margin: 0;
  font-size: clamp(30px, 6vw, 44px);
  line-height: 1.05;
`

const Description = styled.p`
  margin: 14px 0 0;
  color: #d7dcef;
  line-height: 1.7;
  font-size: 15px;
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
`

const Chip = styled.div`
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 13px;
  font-weight: 700;
`

const Visual = styled.div`
  min-height: 240px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(10, 10, 16, 0.1), rgba(10, 10, 16, 0.7)),
    url('/stuff.png') center/cover no-repeat;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);

  @media (max-width: 860px) {
    min-height: 220px;
  }
`

export function WelcomeBanner() {
  const user = useUserStore((state) => state.currentUser)

  return (
    <Welcome>
      <div>
        <Eyebrow>Mini app</Eyebrow>
        <Title>{SITE_NAME}</Title>
        <Description>
          Welcome {user?.firstName || user?.displayName || 'player'}. The lobby is now cleaner, account actions are grouped inside the Telegram profile panel, and the games feel closer to a real mobile casino.
        </Description>
        <Chips>
          <Chip>Cleaner header</Chip>
          <Chip>Profile-based account actions</Chip>
          <Chip>Improved mobile game flow</Chip>
        </Chips>
      </div>
      <Visual aria-label="Casino preview artwork" />
    </Welcome>
  )
}
