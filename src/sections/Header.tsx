import styled from 'styled-components'
import { SITE_NAME } from '../constants'
import { useUserStore } from '../hooks/useUserStore'
import UserAvatar from '../components/UserAvatar'

const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: calc(14px + env(safe-area-inset-top)) 12px 10px;
  background: rgba(8, 8, 13, 0.94);
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

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  img {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    flex: 0 0 auto;
  }
`

const BrandTitle = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

const Title = styled.div`
  font-size: 18px;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SubTitle = styled.div`
  color: #97a0ba;
  font-size: 12px;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 110px) minmax(0, 1fr);
  }
`

const Balance = styled.div`
  min-height: 46px;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 800;
  font-size: 14px;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  text-align: center;
`

const AccountButton = styled.button`
  min-height: 46px;
  padding: 8px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.12);
  background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 210px;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 720px) {
    width: 100%;
    min-width: 0;
  }
`

const AccountMeta = styled.div`
  display: grid;
  gap: 2px;
  text-align: left;
  min-width: 0;
  flex: 1;
`

const AccountLabel = styled.div`
  font-size: 11px;
  color: #97a0ba;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`

const AccountName = styled.div`
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export default function Header({ openProfile }: { openProfile?: () => void }) {
  const user = useUserStore((state) => state.currentUser)
  const realBalance = useUserStore((state) => state.realBalance)

  return (
    <StyledHeader>
      <Inner>
        <Brand>
          <img alt={SITE_NAME} src="/logo.svg" />
          <BrandTitle>
            <Title>{SITE_NAME}</Title>
            <SubTitle>Telegram Stars casino experience</SubTitle>
          </BrandTitle>
        </Brand>

        <Actions>
          <Balance>⭐ {realBalance}</Balance>
          {user ? (
            <AccountButton type="button" onClick={openProfile}>
              <UserAvatar name={user.displayName} photoUrl={user.photoUrl} size={30} />
              <AccountMeta>
                <AccountLabel>Telegram profile</AccountLabel>
                <AccountName>{user.displayName || user.firstName}</AccountName>
              </AccountMeta>
            </AccountButton>
          ) : (
            <AccountButton type="button" disabled>
              <AccountMeta>
                <AccountLabel>Telegram profile</AccountLabel>
                <AccountName>Connecting…</AccountName>
              </AccountMeta>
            </AccountButton>
          )}
        </Actions>
      </Inner>
    </StyledHeader>
  )
}
