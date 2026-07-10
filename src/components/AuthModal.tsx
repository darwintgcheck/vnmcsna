import React from 'react'
import styled from 'styled-components'
import { authDev } from '../lib/api'
import { isTelegramMiniApp, getTelegramUnsafeUser, telegramAlert } from '../lib/telegram'
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
  margin: 0 0 16px;
  line-height: 1.6;
  color: #c7c9d4;
  text-align: center;
  font-size: 14px;
`

const Input = styled.input`
  width: 100%;
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: #fff;
  outline: none;
  
  &::placeholder {
    color: rgba(255,255,255,0.5);
  }
`

const Button = styled.button<{ $accent?: boolean; $full?: boolean }>`
  width: ${({ $full }) => ($full ? '100%' : 'auto')};
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  background: ${({ $accent }) => ($accent ? 'linear-gradient(90deg, #8c62ff, #5ee7ff)' : 'rgba(255,255,255,0.08)')};
  color: ${({ $accent }) => ($accent ? '#05050b' : '#fff')};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-direction: column;
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.12);
  }
`

export default function AuthModal() {
  const setUser = useUserStore((state) => state.setUser)
  const set = useUserStore((state) => state.set)
  const [mode, setMode] = React.useState<'login' | 'register'>('login')
  const [telegramId, setTelegramId] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const isMiniApp = isTelegramMiniApp()
  const tgUser = !isMiniApp ? getTelegramUnsafeUser() : null

  React.useEffect(() => {
    if (tgUser?.id) {
      setTelegramId(String(tgUser.id))
      setFirstName(tgUser.first_name || '')
    }
  }, [tgUser])

  const devLogin = async () => {
    try {
      setBusy(true)
      
      if (!telegramId) {
        telegramAlert('Telegram ID lazımdır')
        return
      }

      const payload = {
        telegramId: Number(telegramId),
        firstName: firstName || 'Istifadəçi',
        username: tgUser?.username || undefined,
      }
      
      window.localStorage.setItem('venom-dev-user', JSON.stringify(payload))
      const response = await authDev(payload)
      setUser(response.user)
      set({ config: response.config, error: null })
    } catch (error: any) {
      console.error('Auth error:', error)
      telegramAlert(error?.message || 'Giriş alınmadı')
    } finally {
      setBusy(false)
    }
  }

  if (isMiniApp) {
    return (
      <Overlay>
        <Card>
          <Logo alt="Venom Kazino" src="/logo.svg" />
          <Title>Venom Kazino</Title>
          <Text>
            Telegram hesabınız oxunur. Əgər giriş açılmırsa, mini app-i bot daxilindən yenidən başladın.
          </Text>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#ff8080', fontSize: '12px' }}>
              ⚠️ Telegram Mini App ID tapılmadı. Bot admin quraşdırması lazım olacaq.
            </p>
          </div>
        </Card>
      </Overlay>
    )
  }

  return (
    <Overlay>
      <Card>
        <Logo alt="Venom Kazino" src="/logo.svg" />
        <Title>Venom Kazino</Title>
        <Text>
          Telegram Stars ilə oyun oynayın və qazanın.
        </Text>

        {tgUser ? (
          <>
            <Text style={{ fontSize: '12px', color: '#8c62ff', marginBottom: '12px' }}>
              ✅ Telegram hesabı tanındı: @{tgUser.username || tgUser.first_name}
            </Text>
            <Button $accent $full onClick={devLogin} disabled={busy}>
              {busy ? '⏳ Giriş edilir...' : '📱 Telegram ilə giriş'}
            </Button>
          </>
        ) : (
          <>
            <ButtonGroup>
              <Button 
                $accent 
                $full 
                onClick={() => window.open('https://t.me/venom_kazino_bot', '_blank')}
              >
                📱 Telegram Bot
              </Button>
              <Button 
                $full 
                onClick={() => window.open('https://accounts.google.com', '_blank')}
              >
                📧 Gmail ilə giriş
              </Button>
            </ButtonGroup>
            
            <Divider>test</Divider>

            <Text style={{ fontSize: '12px' }}>
              Test məqsədi ilə giriş:
            </Text>
            <Input 
              value={telegramId} 
              onChange={(e) => setTelegramId(e.target.value)} 
              type="number" 
              placeholder="Telegram ID (rəqəm)" 
            />
            <Input 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              placeholder="Adınız" 
            />
            <Button 
              $accent 
              $full 
              onClick={devLogin} 
              disabled={busy || !telegramId}
              style={{ marginTop: '14px' }}
            >
              {busy ? '⏳ Giriş edilir...' : 'Test girişi'}
            </Button>
          </>
        )}
      </Card>
    </Overlay>
  )
}
