import React from 'react'
import styled from 'styled-components'
import { Modal } from './Modal'
import { telegramAlert } from '../lib/telegram'
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
  background: linear-gradient(90deg, #ff7a7a, #ffb86b);
  color: #140b0b;
  font-weight: 800;
  cursor: pointer;
`

export default function WithdrawModal({ onClose }: { onClose: () => void }) {
  const balance = useUserStore((state) => state.balance)
  const requestWithdraw = useUserStore((state) => state.requestWithdraw)
  const config = useUserStore((state) => state.config)
  const [amount, setAmount] = React.useState(100)
  const [busy, setBusy] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const feePercent = config?.withdrawFeePercent || 8
  const fee = Number(((amount * feePercent) / 100).toFixed(2))
  const net = Number((amount - fee).toFixed(2))

  const submit = async () => {
    try {
      setBusy(true)
      const response = await requestWithdraw(Number(amount))
      setMessage(`Request received. Net amount: ${response.netAmount} ⭐ | Fee: ${response.feeAmount} ⭐`)
    } catch (error: any) {
      telegramAlert(error?.message || 'Withdraw request failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <Wrap>
        <h1>Withdraw</h1>
        <p>Current balance: {balance} ⭐</p>
        <Input type="number" min={1} max={balance} value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Withdraw amount" />
        <p>
          Fee: {feePercent}% · Fee amount: {fee} ⭐ · You receive: {net} ⭐
        </p>
        <Button disabled={busy || amount <= 0 || amount > balance} onClick={submit}>
          {busy ? 'Sending…' : 'Send withdraw request'}
        </Button>
        {message && <p style={{ marginTop: 14 }}>{message}</p>}
      </Wrap>
    </Modal>
  )
}
