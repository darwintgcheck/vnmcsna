import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import ProfileModal from '../components/ProfileModal'
import UserAvatar from '../components/UserAvatar'
import { SITE_NAME } from '../constants'
import { useUserStore } from '../hooks/useUserStore'

const StyledHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  background: rgba(8, 8, 13, 0.86);
  backdrop-filter: blur(18px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 720px) {
    flex-wrap: wrap;
    align-items: flex-start;
  }
`

const Brand = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 16px;
  text-decoration: none;
  color: #fff;
  min-width: 0;

  span {
    white-space: nowrap;
  }

  @media (max-width: 420px) {
    span {
      display: none;
    }
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 720px) {
    width: 100%;
  }
`

const Button = styled.button<{ $accent?: boolean }>`
  border: none;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
  color: ${({ $accent }) => ($accent ? '#090911' : '#fff')};
  background: ${({ $accent }) => ($accent ? 'linear-gradient(90deg, #8c62ff, #5ee7ff)' : 'rgba(255,255,255,0.08)')};
  font-size: 13px;
  transition: all 0.2s;
  min-height: 40px;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Balance = styled.div`
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  font-weight: 700;
  font-size: 13px;
  white-space: nowrap;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
`

const UserWidget = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  border-radius: 16px;
  padding: 6px 10px 6px 6px;
  cursor: pointer;
  min-width: 0;
`

const UserText = styled.div`
  display: grid;
  gap: 2px;
  text-align: left;
  line-height: 1.1;
  min-width: 0;
`

const UserName = styled.div`
  font-size: 13px;
  font-weight: 800;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const UserSub = styled.div`
  font-size: 11px;
  color: #aeb4c7;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export default function Header({ openDeposit, openWithdraw }: { openDeposit?: () => void; openWithdraw?: () => void }) {
  const user = useUserStore((state) => state.currentUser)
  const realBalance = useUserStore((state) => state.realBalance)
  const [profileOpen, setProfileOpen] = React.useState(false)

  return (
    <>
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      <StyledHeader>
        <Brand to="/">
          <img alt={SITE_NAME} src="/logo.svg" style={{ width: 34, height: 34 }} />
          <span style={{ marginTop: '2px' }}>{SITE_NAME}</span>
        </Brand>

        <Actions>
          <Balance>⭐ {realBalance}</Balance>

          {user ? (
            <>
              <Button onClick={openWithdraw}>Çıxarış</Button>
              <Button $accent onClick={openDeposit}>Depozit</Button>
              <UserWidget onClick={() => setProfileOpen(true)} title="Profil">
                <UserAvatar name={user.displayName} photoUrl={user.photoUrl} size={36} />
                <UserText>
                  <UserName>{user.displayName || 'Telegram User'}</UserName>
                  <UserSub>{user.username ? `@${user.username}` : `ID: ${user.telegramId}`}</UserSub>
                </UserText>
              </UserWidget>
            </>
          ) : (
            <Button $accent disabled>
              Giriş yoxdur
            </Button>
          )}
        </Actions>
      </StyledHeader>
    </>
  )
}
