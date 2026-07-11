import styled from 'styled-components'
import { SITE_NAME } from '../constants'
import { getTelegramUnsafeUser, isTelegramMiniApp } from '../lib/telegram'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
`

const Card = styled.div`
  width: min(100%, 420px);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(21, 21, 32, 0.95), rgba(10, 10, 16, 0.96));
  border: 1px solid rgba(140, 98, 255, 0.24);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  padding: 28px;
  color: #fff;
`

const Logo = styled.img`
  width: 84px;
  height: 84px;
  display: block;
  margin: 0 auto 18px;
`

const Title = styled.h2`
  text-align: center;
  font-size: 28px;
  margin-bottom: 12px;
`

const Text = styled.p`
  margin: 0 0 16px;
  line-height: 1.6;
  color: #c7c9d4;
  text-align: center;
  font-size: 14px;
`

const Button = styled.button`
  width: 100%;
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(90deg, #8c62ff, #5ee7ff);
  color: #05050b;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
  }
`

export default function AuthModal() {
  const isMiniApp = isTelegramMiniApp()
  const tgUser = getTelegramUnsafeUser()

  if (isMiniApp) {
    if (tgUser?.id) {
      return (
        <Overlay>
          <Card>
            <Logo alt={SITE_NAME} src="/logo.svg" />
            <Title>{SITE_NAME}</Title>
            <Text>Your Telegram account is being read and you will be signed in automatically…</Text>
          </Card>
        </Overlay>
      )
    }

    return (
      <Overlay>
        <Card>
          <Logo alt={SITE_NAME} src="/logo.svg" />
          <Title>{SITE_NAME}</Title>
          <Text>Telegram account data was not found. Please reopen the Mini App directly from the bot.</Text>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </Card>
      </Overlay>
    )
  }

  return (
    <Overlay>
      <Card>
        <Logo alt={SITE_NAME} src="/logo.svg" />
        <Title>{SITE_NAME}</Title>
        <Text>This site opens automatically with your Telegram account inside the Telegram Mini App.</Text>
        <Button onClick={() => window.location.reload()}>Refresh page</Button>
      </Card>
    </Overlay>
  )
}
