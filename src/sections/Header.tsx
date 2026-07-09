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
`

const Balance = styled.div`
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  font-weight: 700;
`

export default function Header({ openDeposit, openWithdraw }: { openDeposit?: () => void; openWithdraw?: () => void }) {
  const user = useUserStore((state) => state.currentUser)
  const balance = useUserStore((state) => state.balance)
  const logout = useUserStore((state) => state.logout)

  return (
    <StyledHeader>
      <Brand to="/">
        <img alt={SITE_NAME} src="/logo.svg" style={{ width: 34, height: 34 }} />
        <span>{SITE_NAME}</span>
      </Brand>
      <Actions>
        <Balance>{balance} ⭐</Balance>
        {user && <Button onClick={openWithdraw}>Çıxarış</Button>}
        {user && <Button $accent onClick={openDeposit}>Deposit</Button>}
        {user && <Button onClick={logout}>{user.displayName}</Button>}
      </Actions>
    </StyledHeader>
  )
}
