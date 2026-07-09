import { StoreApi, create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { authDev, authTelegram, createDeposit, createWithdraw, fetchUser, syncBalance } from '../lib/api'
import { getTelegramInitData, getTelegramUnsafeUser, isTelegramMiniApp, prepareTelegramUi } from '../lib/telegram'
import type { DepositRequestResult, PublicConfig, User, WithdrawRequestResult } from '../types'

interface UserStore {
  initialized: boolean
  loading: boolean
  error: string | null
  currentUser: User | null
  user: User | null
  balance: number
  config: PublicConfig | null
  set: StoreApi<UserStore>['setState']
  setUser: (user: User | null) => void
  init: () => Promise<void>
  refreshUser: () => Promise<void>
  updateBalance: (nextBalance: number, reason?: string) => Promise<void>
  addBalance: (amount: number, reason?: string) => Promise<void>
  withdrawBalance: (amount: number, reason?: string) => Promise<boolean>
  requestDeposit: (amount: number) => Promise<DepositRequestResult>
  requestWithdraw: (amount: number) => Promise<WithdrawRequestResult>
  logout: () => void
}

const applyUser = (set: StoreApi<UserStore>['setState'], user: User | null) => {
  set({
    currentUser: user,
    user,
    balance: user?.balance ?? 0,
  })
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      initialized: false,
      loading: false,
      error: null,
      currentUser: null,
      user: null,
      balance: 0,
      config: null,
      set,
      setUser: (user) => applyUser(set, user),
      init: async () => {
        if (get().loading) return
        set({ loading: true, error: null })
        try {
          prepareTelegramUi()
          if (isTelegramMiniApp()) {
            const initData = getTelegramInitData()
            if (!initData) throw new Error('Telegram məlumatı tapılmadı')
            const response = await authTelegram(initData)
            applyUser(set, response.user)
            set({ config: response.config, initialized: true, loading: false })
            return
          }

          const unsafeUser = getTelegramUnsafeUser()
          if (unsafeUser?.id) {
            const response = await authDev({
              telegramId: unsafeUser.id,
              firstName: unsafeUser.first_name || 'Telegram',
              username: unsafeUser.username,
            })
            applyUser(set, response.user)
            set({ config: response.config, initialized: true, loading: false })
            return
          }

          const saved = window.localStorage.getItem('venom-dev-user')
          if (saved) {
            const response = await authDev(JSON.parse(saved))
            applyUser(set, response.user)
            set({ config: response.config, initialized: true, loading: false })
            return
          }

          set({ initialized: true, loading: false })
        } catch (error: any) {
          set({
            initialized: true,
            loading: false,
            error: error?.message || 'İstifadəçi yüklənmədi',
          })
        }
      },
      refreshUser: async () => {
        const telegramId = get().currentUser?.telegramId
        if (!telegramId) return
        const response = await fetchUser(telegramId)
        applyUser(set, response.user)
        set({ config: response.config })
      },
      updateBalance: async (nextBalance, reason = 'game-sync') => {
        const current = get().currentUser
        if (!current) return
        const safeBalance = Math.max(0, Number(nextBalance || 0))
        const nextUser = { ...current, balance: safeBalance }
        applyUser(set, nextUser)
        await syncBalance({ telegramId: current.telegramId, balance: safeBalance, reason })
      },
      addBalance: async (amount, reason = 'balance-add') => {
        const current = get().currentUser
        if (!current) return
        await get().updateBalance((current.balance || 0) + Number(amount || 0), reason)
      },
      withdrawBalance: async (amount, reason = 'balance-withdraw') => {
        const current = get().currentUser
        const numericAmount = Number(amount || 0)
        if (!current || numericAmount <= 0 || current.balance < numericAmount) return false
        await get().updateBalance(current.balance - numericAmount, reason)
        return true
      },
      requestDeposit: async (amount) => {
        const current = get().currentUser
        if (!current) throw new Error('İstifadəçi tapılmadı')
        return createDeposit({ telegramId: current.telegramId, amount })
      },
      requestWithdraw: async (amount) => {
        const current = get().currentUser
        if (!current) throw new Error('İstifadəçi tapılmadı')
        const result = await createWithdraw({ telegramId: current.telegramId, amount })
        applyUser(set, {
          ...current,
          balance: Math.max(0, current.balance - amount),
          totalWithdrawn: (current.totalWithdrawn || 0) + result.netAmount,
        })
        return result
      },
      logout: () => {
        window.localStorage.removeItem('venom-user-store')
        applyUser(set, null)
        set({ error: null, initialized: true })
      },
    }),
    {
      name: 'venom-user-store',
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        user: state.user,
        balance: state.balance,
        config: state.config,
      }),
    },
  ),
)
