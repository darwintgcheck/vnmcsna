import type { TelegramWebAppUser } from '../types'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any
    }
  }
}

export function getTelegramWebApp() {
  return window.Telegram?.WebApp ?? null
}

export function isTelegramMiniApp() {
  return Boolean(getTelegramWebApp())
}

export function getTelegramInitData() {
  return getTelegramWebApp()?.initData ?? ''
}

export function getTelegramUnsafeUser(): TelegramWebAppUser | null {
  return getTelegramWebApp()?.initDataUnsafe?.user ?? null
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
    webApp.requestFullscreen?.()
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
