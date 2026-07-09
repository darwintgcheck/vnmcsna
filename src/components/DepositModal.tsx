import React from 'react'
import styled from 'styled-components'
import { Modal } from './Modal'
import { openTelegramInvoice, telegramAlert } from '../lib/telegram'
import { useUserStore } from '../hooks/useUserStore'

const Wrap = styled.div`
  width: min(100%, 460px);
  padding: 28px;
`

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: #fff;
  outline: none;
`

const Button = styled.button`
  width: 100%;
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(90deg, #8c62ff, #5ee7ff);
  color: #05050b;
  font-weight: 800;
  cursor: pointer;
`

const Secondary = styled.button`
  width: 100%;
  margin-top: 10px;
  padding: 13px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`

export default function DepositModal({ onClose }: { onClose: () => void }) {
  const requestDeposit = useUserStore((state) => state.requestDeposit)
  const config = useUserStore((state) => state.config)
  const [amount, setAmount] = React.useState(100)
  const [busy, setBusy] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const submit = async () => {
    try {
      setBusy(true)
      setMessage('')
      const response = await requestDeposit(Number(amount))
      if (response.invoiceLink) {
        openTelegramInvoice(response.invoiceLink)
        setMessage('Ödəniş pəncərəsi açıldı. Ödəniş tamamlandıqdan sonra balans avtomatik yenilənəcək.')
      } else {
        setMessage(response.message || 'Depozit sorğusu yaradıldı.')
      }
    } catch (error: any) {
      telegramAlert(error?.message || 'Depozit yaradılmadı')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <Wrap>
        <h1>Deposit ⭐</h1>
        <p>Balans yalnız Telegram Stars ilə artırılır.</p>
        <Input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Stars məbləği" />
        <Button disabled={busy || amount <= 0} onClick={submit}>
          {busy ? 'Hazırlanır...' : 'Depozit başlat'}
        </Button>
        {config?.adminGiftUsername && (
          <Secondary type="button" onClick={() => setMessage(`Alternativ gift hesabı: @${config.adminGiftUsername}`)}>
            Gift hesabını göstər
          </Secondary>
        )}
        {message && <p style={{ marginTop: 14 }}>{message}</p>}
      </Wrap>
    </Modal>
  )
}
