import type { DepositRequestResult, PublicConfig, User, WithdrawRequestResult } from '../types'

async function parseResponse(response: Response) {
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(data?.error || 'Sorğu uğursuz oldu')
  }
  return data
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  })

  return parseResponse(response)
}

export function authTelegram(initData: string) {
  return apiRequest<{ user: User; config: PublicConfig }>('/api/auth/telegram', {
    method: 'POST',
    body: JSON.stringify({ initData }),
  })
}

export function authDev(payload: { telegramId: number; firstName: string; username?: string }) {
  return apiRequest<{ user: User; config: PublicConfig }>('/api/auth/dev', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function syncBalance(payload: { telegramId: number; balance: number; reason?: string; meta?: Record<string, unknown> }) {
  return apiRequest<{ user: User }>('/api/balance/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchUser(telegramId: number) {
  return apiRequest<{ user: User; config: PublicConfig }>(`/api/users/${telegramId}`)
}

export function createDeposit(payload: { telegramId: number; amount: number }) {
  return apiRequest<DepositRequestResult>('/api/deposits/request', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createWithdraw(payload: { telegramId: number; amount: number }) {
  return apiRequest<WithdrawRequestResult>('/api/withdrawals/request', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
