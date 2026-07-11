import type { TelegramWebAppUser } from '../types'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any
    }
  }
}

function getAllTelegramParams() {
  const collected = new URLSearchParams()

  const append = (raw: string) => {
    if (!raw) return
    const normalized = raw.replace(/^[#?]/, '').replace(/^\/?/, '')
    const params = new URLSearchParams(normalized)
    params.forEach((value, key) => {
      if (!collected.has(key)) {
        collected.set(key, value)
      }
    })
  }

  try {
    append(window.location.search)
    append(window.location.hash)
  } catch {
    // noop
  }

  return collected
}

function getUrlTelegramData() {
  try {
    const params = getAllTelegramParams()
    return params.get('tgWebAppData') || ''
  } catch {
    return ''
  }
}

export function getTelegramWebApp() {
  return window.Telegram?.WebApp ?? null
}

export function getTelegramInitData() {
  const webApp = getTelegramWebApp()
  return String(webApp?.initData || getUrlTelegramData() || '')
}

export function getTelegramUnsafeUser(): TelegramWebAppUser | null {
  const webApp = getTelegramWebApp()
  const unsafeUser = webApp?.initDataUnsafe?.user
  if (unsafeUser?.id) {
    return unsafeUser
  }

  try {
    const rawUser = new URLSearchParams(getTelegramInitData()).get('user')
    return rawUser ? JSON.parse(rawUser) : null
  } catch {
    return null
  }
}

export function isTelegramMiniApp() {
  const webApp = getTelegramWebApp()
  const params = getAllTelegramParams()
  const hasInitData = Boolean(getTelegramInitData())
  const hasUnsafeUser = Boolean(getTelegramUnsafeUser()?.id)
  const hasPlatform = Boolean(webApp?.platform) && webApp.platform !== 'unknown'
  const hasMiniAppParams = params.has('tgWebAppPlatform') || params.has('tgWebAppData')

  return Boolean(webApp || hasInitData || hasUnsafeUser || hasPlatform || hasMiniAppParams)
}

export function prepareTelegramUi() {
  const webApp = getTelegramWebApp()
  if (!webApp) return

  try {
    webApp.ready?.()
    webApp.expand?.()
    webApp.disableVerticalSwipes?.()
    webApp.setHeaderColor?.('#08080d')
    webApp.setBackgroundColor?.('#08080d')
    webApp.BackButton?.hide?.()
    webApp.MainButton?.hide?.()
  } catch {
    // noop
  }
}

export async function waitForTelegramSession(timeoutMs = 3000, pollMs = 120) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const initData = getTelegramInitData()
    const user = getTelegramUnsafeUser()
    if (initData || user?.id) {
      return { initData, user }
    }

    await new Promise((resolve) => window.setTimeout(resolve, pollMs))
  }

  return {
    initData: getTelegramInitData(),
    user: getTelegramUnsafeUser(),
  }
}

export function openTelegramInvoice(invoiceLink: string, onStatus?: (status: string) => void) {
  const webApp = getTelegramWebApp()
  if (webApp?.openInvoice) {
    webApp.openInvoice(invoiceLink, (status: string) => {
      onStatus?.(status)
    })
    return true
  }

  window.open(invoiceLink, '_blank', 'noopener,noreferrer')
  onStatus?.('opened')
  return false
}

export function telegramAlert(message: string) {
  const webApp = getTelegramWebApp()
  if (webApp?.showAlert) {
    webApp.showAlert(message)
    return
  }

  window.alert(message)
}
