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
  const webApp = getTelegramWebApp()
  if (!webApp) return false

  // telegram-web-app.js is loaded unconditionally via a <script> tag, so it
  // injects a stub `window.Telegram.WebApp` object even when the page is
  // opened in a normal browser (e.g. Safari), not inside Telegram itself.
  // Only trust it as a real Mini App session when it actually carries launch
  // data (initData) or a known platform, otherwise we get false positives
  // that break the app for anyone opening the link outside Telegram.
  const hasInitData = Boolean(webApp.initData)
  const hasPlatform = Boolean(webApp.platform) && webApp.platform !== 'unknown'

  return hasInitData || hasPlatform
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
