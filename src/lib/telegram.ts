import type { TelegramWebAppUser } from '../types'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any
    }
  }
}

function getUrlTelegramData() {
  try {
    const params = new URLSearchParams(window.location.search)
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
  if (!webApp) return false

  const hasInitData = Boolean(getTelegramInitData())
  const hasUnsafeUser = Boolean(getTelegramUnsafeUser()?.id)
  const hasPlatform = Boolean(webApp.platform) && webApp.platform !== 'unknown'

  return hasInitData || hasUnsafeUser || hasPlatform
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
