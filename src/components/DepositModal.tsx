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
  const refreshUser = useUserStore((state) => state.refreshUser)
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
        const openedInTelegram = openTelegramInvoice(response.invoiceLink, async (status) => {
          if (status === 'paid') {
            await refreshUser()
            setMessage('Payment completed. Your balance has been refreshed ✅')
            return
          }

          if (status === 'cancelled') {
            setMessage('Payment cancelled.')
            return
          }

          if (status && status !== 'opened') {
            setMessage(`Payment status: ${status}`)
          }
        })

        setMessage(
          openedInTelegram
            ? 'The Telegram invoice window is open. Your balance will refresh automatically after payment.'
            : 'The invoice was opened in a new window. Return to the app after paying.'
        )
      } else {
        setMessage(response.message || 'Deposit request created.')
      }
    } catch (error: any) {
      telegramAlert(error?.message || 'Deposit request failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <Wrap>
        <h1>Deposit ⭐</h1>
        <p>Your balance can be topped up with Telegram Stars only.</p>
        <Input type="number" min={1} step={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Stars amount" />
        <Button disabled={busy || amount <= 0} onClick={submit}>
          {busy ? 'Preparing…' : 'Start deposit'}
        </Button>
        {config?.adminGiftUsername && (
          <Secondary type="button" onClick={() => setMessage(`Alternative gift account: @${config.adminGiftUsername}`)}>
            Show gift account
          </Secondary>
        )}
        {message && <p style={{ marginTop: 14 }}>{message}</p>}
      </Wrap>
    </Modal>
  )
}
