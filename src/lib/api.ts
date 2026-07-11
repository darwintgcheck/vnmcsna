import type { DepositRequestResult, PublicConfig, User, WithdrawRequestResult } from '../types'

async function parseResponse(response: Response) {
  const text = await response.text()
  let data: any = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text }
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`)
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

export function authMiniApp(payload: {
  initData?: string
  user: {
    id: number
    first_name?: string
    last_name?: string
    username?: string
    photo_url?: string
    language_code?: string
  }
}) {
  return apiRequest<{ user: User; config: PublicConfig; fallbackAuth?: boolean }>('/api/auth/miniapp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function authDev(payload: {
  telegramId: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
  languageCode?: string
}) {
  return apiRequest<{ user: User; config: PublicConfig }>('/api/auth/dev', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function syncBalance(payload: { telegramId: number; balance: number; reason?: string; meta?: Record<string, unknown> }) {
  return apiRequest<{ ok: boolean; user: User }>('/api/balance/sync', {
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

export function getCrashLiveStats() {
  return apiRequest<{ ok: boolean; queuedBettors: number; updatedAt: string }>('/api/crash/live')
}

export function updateCrashPresence(payload: { telegramId: number; active: boolean; wager?: number; target?: number }) {
  return apiRequest<{ ok: boolean; queuedBettors: number }>('/api/crash/presence', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
