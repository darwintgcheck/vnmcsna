import React from 'react'
import styled from 'styled-components'
import { authDev } from '../lib/api'
import { isTelegramMiniApp, telegramAlert } from '../lib/telegram'
import { useUserStore } from '../hooks/useUserStore'

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
  margin: 0;
  line-height: 1.6;
  color: #c7c9d4;
  text-align: center;
`

const Input = styled.input`
  width: 100%;
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: #fff;
  outline: none;
`

const Button = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(90deg, #8c62ff, #5ee7ff);
  color: #05050b;
  font-weight: 800;
  cursor: pointer;
`

export default function AuthModal() {
  const setUser = useUserStore((state) => state.setUser)
  const set = useUserStore((state) => state.set)
  const [telegramId, setTelegramId] = React.useState('')
  const [firstName, setFirstName] = React.useState('Test')
  const [username, setUsername] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const devLogin = async () => {
    try {
      setBusy(true)
      const payload = {
        telegramId: Number(telegramId),
        firstName: firstName || 'Test',
        username: username || undefined,
      }
      window.localStorage.setItem('venom-dev-user', JSON.stringify(payload))
      const response = await authDev(payload)
      setUser(response.user)
      set({ config: response.config, error: null })
    } catch (error: any) {
      telegramAlert(error?.message || 'Giriş alınmadı')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Overlay>
      <Card>
        <Logo alt="Venom Kazino" src="/logo.svg" />
        <Title>Venom Kazino</Title>
        {isTelegramMiniApp() ? (
          <Text>
            Telegram hesabınız oxunur. Əgər giriş açılmırsa, mini app-i bot daxilindən yenidən başladın.
          </Text>
        ) : (
          <>
            <Text>
              Bu layihə Telegram Mini App üçün qurulub. Test məqsədi ilə aşağıdan müvəqqəti giriş edə bilərsiniz.
            </Text>
            <Input value={telegramId} onChange={(e) => setTelegramId(e.target.value)} type="number" placeholder="Telegram ID" />
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ad" />
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <Button disabled={busy || !telegramId} onClick={devLogin}>
              {busy ? 'Giriş edilir...' : 'Test girişi'}
            </Button>
          </>
        )}
      </Card>
    </Overlay>
  )
}
