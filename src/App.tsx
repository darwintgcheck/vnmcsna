import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AuthModal from './components/AuthModal'
import DepositModal from './components/DepositModal'
import WithdrawModal from './components/WithdrawModal'
import { useUserStore } from './hooks/useUserStore'
import Dashboard from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import Header from './sections/Header'
import { MainWrapper } from './styles'

export default function App() {
  const init = useUserStore((state) => state.init)
  const initialized = useUserStore((state) => state.initialized)
  const loading = useUserStore((state) => state.loading)
  const user = useUserStore((state) => state.currentUser)
  const error = useUserStore((state) => state.error)

  const [depositOpen, setDepositOpen] = React.useState(false)
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)

  React.useEffect(() => {
    init()
  }, [init])

  return (
    <>
      <Header openDeposit={() => setDepositOpen(true)} openWithdraw={() => setWithdrawOpen(true)} />
      {depositOpen && <DepositModal onClose={() => setDepositOpen(false)} />}
      {withdrawOpen && <WithdrawModal onClose={() => setWithdrawOpen(false)} />}
      {!loading && initialized && !user && <AuthModal />}
      <MainWrapper>
        {loading && <p style={{ textAlign: 'center' }}>Loading…</p>}
        {!loading && error && !user && <p style={{ textAlign: 'center', color: '#ff8080' }}>{error}</p>}
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
