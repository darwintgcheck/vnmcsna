export interface TelegramWebAppUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  language_code?: string
}

export interface User {
  _id?: string
  telegramId: number
  username?: string
  firstName: string
  lastName?: string
  displayName: string
  photoUrl?: string
  languageCode?: string
  balance: number
  totalDeposited?: number
  totalWithdrawn?: number
  createdAt?: string
  lastLoginAt?: string
}

export interface PublicConfig {
  siteName: string
  botUsername?: string
  adminGiftUsername?: string
  depositMode: 'invoice' | 'gift' | 'invoice_or_gift'
  withdrawFeePercent: number
}

export interface DepositRequestResult {
  ok: boolean
  mode: 'invoice' | 'gift' | 'invoice_or_gift'
  requestId?: string
  invoiceLink?: string
  amount: number
  adminGiftUsername?: string
  botUsername?: string
  message?: string
}

export interface WithdrawRequestResult {
  ok: boolean
  requestId: string
  amount: number
  feeAmount: number
  netAmount: number
  status: string
}
