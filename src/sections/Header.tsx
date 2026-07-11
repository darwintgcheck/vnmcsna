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
  padding: calc(10px + env(safe-area-inset-top)) 12px 12px;
  background: rgba(8, 8, 13, 0.92);
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
    gap: 10px;
  }
`

const Brand = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: #fff;
  text-decoration: none;

  img {
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
  }
`

const BrandTitle = styled.div`
  display: grid;
  gap: 3px;
  min-width: 0;
`

const Title = styled.div`
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SubTitle = styled.div`
  color: #97a0ba;
  font-size: 12px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 720px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const Balance = styled.div`
  min-height: 44px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 800;
  font-size: 13px;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  text-align: center;
`

const Button = styled.button<{ $accent?: boolean }>`
  min-height: 44px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid ${({ $accent }) => ($accent ? 'transparent' : 'rgba(255,255,255,0.12)')};
  background: ${({ $accent }) => ($accent ? 'linear-gradient(90deg, #fbbf24, #fb7185)' : 'rgba(255,255,255,0.06)')};
  color: ${({ $accent }) => ($accent ? '#140b0b' : '#fff')};
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 720px) {
    width: 100%;
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
            <Button $accent disabled style={{ gridColumn: 'span 2' }}>
              Connecting…
            </Button>
          )}
        </Actions>
      </Inner>
    </StyledHeader>
  )
}
