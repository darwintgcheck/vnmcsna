import React from 'react'
import styled from 'styled-components'
import { SITE_NAME } from '../../constants'
import { useUserStore } from '../../hooks/useUserStore'

const Welcome = styled.div`
  background:
    radial-gradient(circle at top left, rgba(140, 98, 255, 0.45), transparent 35%),
    radial-gradient(circle at bottom right, rgba(94, 231, 255, 0.25), transparent 30%),
    linear-gradient(135deg, #11111a, #09090f);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 22px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
  color: white;
`

export function WelcomeBanner() {
  const user = useUserStore((state) => state.currentUser)

  return (
    <Welcome>
      <div>
        <h1>{SITE_NAME}</h1>
        <p style={{ marginBottom: 0 }}>
          Telegram Mini App formatında stars balanslı kazino. Xoş gəldin, {user?.firstName || user?.displayName || 'oyunçu'}.
        </p>
      </div>
      <img alt={SITE_NAME} src="/logo.svg" style={{ width: 72, height: 72 }} />
    </Welcome>
  )
}
