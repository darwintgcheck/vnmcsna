import { StoreApi, create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { authDev, authTelegram, createDeposit, createWithdraw, fetchUser, syncBalance } from '../lib/api'
import { getTelegramInitData, getTelegramUnsafeUser, isTelegramMiniApp, prepareTelegramUi } from '../lib/telegram'
import type { DepositRequestResult, PublicConfig, User, WithdrawRequestResult } from '../types'

type GameMode = 'real' | 'demo'

const DEMO_START_BALANCE = 1000

interface UserStore {
  initialized: boolean
  loading: boolean
  error: string | null
  currentUser: User | null
  user: User | null
  balance: number
  realBalance: number
  demoBalance: number
  gameMode: GameMode
  activeGameId: string | null
  config: PublicConfig | null
  set: StoreApi<UserStore>['setState']
  setUser: (user: User | null) => void
  init: () => Promise<void>
  refreshUser: () => Promise<void>
  setGameMode: (mode: GameMode, gameId?: string) => void
  updateBalance: (nextBalance: number, reason?: string) => void
  addBalance: (amount: number, reason?: string) => void
  withdrawBalance: (amount: number, reason?: string) => boolean
  requestDeposit: (amount: number) => Promise<DepositRequestResult>
  requestWithdraw: (amount: number) => Promise<WithdrawRequestResult>
  logout: () => void
}

const normalizeBalance = (value: number) => Math.round(Math.max(0, Number(value || 0)))

const toDevAuthPayload = (user: ReturnType<typeof getTelegramUnsafeUser>) => ({
  telegramId: Number(user?.id || 0),
  firstName: user?.first_name || 'Telegram',
  lastName: user?.last_name,
  username: user?.username,
  photoUrl: user?.photo_url,
  languageCode: user?.language_code,
})

const buildUserState = (state: Pick<UserStore, 'gameMode' | 'demoBalance'>, user: User | null) => {
  const realBalance = normalizeBalance(user?.balance ?? 0)
  return {
    currentUser: user,
    user,
    realBalance,
    balance: state.gameMode === 'demo' ? normalizeBalance(state.demoBalance) : realBalance,
  }
}

const applyUser = (set: StoreApi<UserStore>['setState'], get: StoreApi<UserStore>['getState'], user: User | null) => {
  set((state) => ({
    ...buildUserState(
      {
        gameMode: state.gameMode,
        demoBalance: state.demoBalance,
      },
      user,
    ),
  }))
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
      realBalance: 0,
      demoBalance: DEMO_START_BALANCE,
      gameMode: 'real',
      activeGameId: null,
      config: null,
      set,
      setUser: (user) => applyUser(set, get, user),
      init: async () => {
        if (get().loading) return
        set({ loading: true, error: null })

        try {
          prepareTelegramUi()
          const unsafeUser = getTelegramUnsafeUser()

          if (isTelegramMiniApp()) {
            const initData = getTelegramInitData()

            if (initData) {
              try {
                const response = await authTelegram(initData)
                applyUser(set, get, response.user)
                set({ config: response.config, initialized: true, loading: false, error: null })
                return
              } catch (telegramError: any) {
                console.warn('Telegram auth failed, trying mini-app fallback:', telegramError)
              }
            }

            if (unsafeUser?.id) {
              const response = await authDev(toDevAuthPayload(unsafeUser))
              applyUser(set, get, response.user)
              set({ config: response.config, initialized: true, loading: false, error: null })
              return
            }

            throw new Error('Telegram hesabı oxunmadı. Mini App-i bot daxilindən yenidən açın.')
          }

          const persistedUser = get().currentUser
          if (persistedUser?.telegramId) {
            try {
              const response = await fetchUser(persistedUser.telegramId)
              applyUser(set, get, response.user)
              set({ config: response.config, initialized: true, loading: false, error: null })
              return
            } catch {
              applyUser(set, get, null)
            }
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
        applyUser(set, get, response.user)
        set({ config: response.config, error: null })
      },
      setGameMode: (mode, gameId) => {
        const currentUser = get().currentUser
        const nextDemoBalance = mode === 'demo' ? DEMO_START_BALANCE : get().demoBalance
        const nextRealBalance = normalizeBalance(currentUser?.balance ?? get().realBalance)

        set({
          gameMode: mode,
          activeGameId: gameId || null,
          demoBalance: nextDemoBalance,
          realBalance: nextRealBalance,
          balance: mode === 'demo' ? nextDemoBalance : nextRealBalance,
          error: null,
        })
      },
      updateBalance: (nextBalance, reason = 'game-sync') => {
        const current = get().currentUser
        const safeBalance = normalizeBalance(nextBalance)

        if (get().gameMode === 'demo') {
          set({ demoBalance: safeBalance, balance: safeBalance, error: null })
          return
        }

        if (!current) return

        const nextUser = { ...current, balance: safeBalance }
        set({
          currentUser: nextUser,
          user: nextUser,
          realBalance: safeBalance,
          balance: safeBalance,
          error: null,
        })

        void syncBalance({ telegramId: current.telegramId, balance: safeBalance, reason })
          .then((response) => {
            applyUser(set, get, response.user)
          })
          .catch((error: any) => {
            set({ error: error?.message || 'Balans sinxronlaşmadı' })
          })
      },
      addBalance: (amount, reason = 'balance-add') => {
        const numericAmount = Number(amount || 0)
        if (numericAmount <= 0) return
        get().updateBalance(get().balance + numericAmount, reason)
      },
      withdrawBalance: (amount, reason = 'balance-withdraw') => {
        const numericAmount = Number(amount || 0)
        if (numericAmount <= 0 || get().balance < numericAmount) return false
        get().updateBalance(get().balance - numericAmount, reason)
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

        if (result.user) {
          applyUser(set, get, result.user)
        } else {
          const nextUser = {
            ...current,
            balance: normalizeBalance(current.balance - amount),
            totalWithdrawn: normalizeBalance((current.totalWithdrawn || 0) + result.netAmount),
          }
          applyUser(set, get, nextUser)
        }

        return result
      },
      logout: () => {
        window.localStorage.removeItem('venom-user-store')
        applyUser(set, get, null)
        set({
          error: null,
          initialized: true,
          realBalance: 0,
          demoBalance: DEMO_START_BALANCE,
          gameMode: 'real',
          activeGameId: null,
          balance: 0,
          config: null,
        })
      },
    }),
    {
      name: 'venom-user-store',
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        user: state.user,
        realBalance: state.realBalance,
        config: state.config,
      }),
    },
  ),
)
