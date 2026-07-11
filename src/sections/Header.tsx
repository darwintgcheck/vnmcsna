import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { SITE_NAME } from '../constants'
import { useUserStore } from '../hooks/useUserStore'

const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: calc(10px + env(safe-area-inset-top)) 14px 12px;
  background: rgba(8, 8, 13, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`

const Inner = styled.div`
  width: min(1120px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const Brand = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: #fff;

  img {
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
  }
`

const BrandTitle = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

const Title = styled.div`
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.02em;
`

const SubTitle = styled.div`
  color: #97a0ba;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 720px) {
    justify-content: stretch;
  }
`

const Balance = styled.div`
  min-height: 42px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 800;
  font-size: 13px;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const Button = styled.button<{ $accent?: boolean }>`
  min-height: 42px;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid ${({ $accent }) => ($accent ? 'transparent' : 'rgba(255,255,255,0.12)')};
  background: ${({ $accent }) => ($accent ? 'linear-gradient(90deg, #fbbf24, #fb7185)' : 'rgba(255,255,255,0.06)')};
  color: ${({ $accent }) => ($accent ? '#140b0b' : '#fff')};
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 720px) {
    flex: 1 1 0;
  }
`

export default function Header({ openDeposit, openWithdraw }: { openDeposit?: () => void; openWithdraw?: () => void }) {
  const user = useUserStore((state) => state.currentUser)
  const realBalance = useUserStore((state) => state.realBalance)

  return (
    <StyledHeader>
      <Inner>
        <Brand to="/">
          <img alt={SITE_NAME} src="/logo.svg" />
          <BrandTitle>
            <Title>{SITE_NAME}</Title>
            <SubTitle>Telegram Stars casino experience</SubTitle>
          </BrandTitle>
        </Brand>

        <Actions>
          <Balance>⭐ {realBalance}</Balance>
          {user ? (
            <>
              <Button onClick={openWithdraw}>Withdraw</Button>
              <Button $accent onClick={openDeposit}>Deposit</Button>
            </>
          ) : (
            <Button $accent disabled>
              Connecting…
            </Button>
          )}
        </Actions>
      </Inner>
    </StyledHeader>
  )
}
