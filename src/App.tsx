import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AuthModal from './components/AuthModal'
import DepositModal from './components/DepositModal'
import ProfileModal from './components/ProfileModal'
import WithdrawModal from './components/WithdrawModal'
import { useUserStore } from './hooks/useUserStore'
import Dashboard from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import Header from './sections/Header'
import { MainWrapper } from './styles'

const USER_REFRESH_INTERVAL_MS = 1500

export default function App() {
  const init = useUserStore((state) => state.init)
  const initialized = useUserStore((state) => state.initialized)
  const loading = useUserStore((state) => state.loading)
  const user = useUserStore((state) => state.currentUser)
  const refreshUser = useUserStore((state) => state.refreshUser)

  const [depositOpen, setDepositOpen] = React.useState(false)
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)

  React.useEffect(() => {
    init()
  }, [init])

  React.useEffect(() => {
    if (!user?.telegramId) return

    const refresh = () => {
      void refreshUser().catch(() => undefined)
    }

    const intervalId = window.setInterval(refresh, USER_REFRESH_INTERVAL_MS)
    const handleVisibility = () => {
      if (!document.hidden) {
        refresh()
      }
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [refreshUser, user?.telegramId])

  return (
    <>
      <Header openProfile={() => setProfileOpen(true)} />
      {depositOpen && <DepositModal onClose={() => setDepositOpen(false)} />}
      {withdrawOpen && <WithdrawModal onClose={() => setWithdrawOpen(false)} />}
      {profileOpen && (
        <ProfileModal
          onClose={() => setProfileOpen(false)}
          onDeposit={() => {
            setProfileOpen(false)
            setDepositOpen(true)
          }}
          onWithdraw={() => {
            setProfileOpen(false)
            setWithdrawOpen(true)
          }}
        />
      )}
      {!loading && initialized && !user && <AuthModal />}
      <MainWrapper>
        {loading && <p style={{ textAlign: 'center' }}>Loading…</p>}
        {!loading && user && (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/:gameId" element={<Game />} />
          </Routes>
        )}
      </MainWrapper>
    </>
  )
}
