import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
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
`

const Brand = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 16px;
  text-decoration: none;
  color: #fff;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
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
  background: rgba(255,255,255,0.06);
  font-weight: 700;
  font-size: 13px;
  white-space: nowrap;
`

const UserWidget = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8c62ff, #5ee7ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #05050b;
`

export default function Header({ openDeposit, openWithdraw }: { openDeposit?: () => void; openWithdraw?: () => void }) {
  const user = useUserStore((state) => state.currentUser)
  const balance = useUserStore((state) => state.balance)
  const logout = useUserStore((state) => state.logout)
  const [showMenu, setShowMenu] = React.useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <StyledHeader>
      <Brand to="/">
        <img alt={SITE_NAME} src="/logo.svg" style={{ width: 34, height: 34 }} />
        <span style={{ marginTop: '2px' }}>{SITE_NAME}</span>
      </Brand>
      
      <Actions>
        <Balance>💰 {balance} ⭐</Balance>
        
        {user ? (
          <>
            <Button onClick={openWithdraw}>Çıxarış</Button>
            <Button $accent onClick={openDeposit}>Deposit</Button>
            <UserWidget>
              <Avatar title={user.displayName}>
                {getInitials(user.displayName || 'User')}
              </Avatar>
              <div style={{ fontSize: '12px', lineHeight: '1.2' }}>
                <div style={{ fontWeight: '600' }}>{user.displayName || 'User'}</div>
                <Button 
                  onClick={logout}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '11px',
                    color: '#8c62ff',
                    cursor: 'pointer',
                    marginTop: '2px'
                  }}
                >
                  Çıxış
                </Button>
              </div>
            </UserWidget>
          </>
        ) : (
          <Button $accent disabled>Giriş yoxdur</Button>
        )}
      </Actions>
    </StyledHeader>
  )
}
