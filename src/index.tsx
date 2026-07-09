import './bootstrap'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { GambaPlatformProvider, TokenMetaProvider, useFakeAccountStore } from 'gamba-react-ui-v2'
import { GambaProvider, SendTransactionProvider } from 'gamba-react-v2'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { DEFAULT_POOL, PLATFORM_CREATOR_ADDRESS, PLATFORM_CREATOR_FEE, PLATFORM_JACKPOT_FEE, PLATFORM_REFERRAL_FEE, RPC_ENDPOINT, TOKEN_METADATA } from './constants'
import { useUserStore } from './hooks/useUserStore'
import './styles.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

function FakeBalanceSync() {
  const balance = useUserStore((state) => state.balance)

  React.useEffect(() => {
    const nextBalance = Math.max(0, balance || 0)

    useFakeAccountStore.setState((state) => {
      if (state.balance === nextBalance) {
        return state
      }

      return {
        ...state,
        balance: nextBalance,
      }
    })
  }, [balance])

  return null
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean; message: string }> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error?.message || 'TÉ™tbiq yÃ¼klÉ™nÉ™rkÉ™n xÉ™ta baÅŸ verdi.',
    }
  }

  componentDidCatch(error: Error) {
    console.error('App render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#0b0b0e',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '420px' }}>
            <h2 style={{ marginBottom: '12px' }}>Sayt aÃ§Ä±larkÉ™n problem yarandÄ±</h2>
            <p style={{ margin: 0, color: '#c7c9d4', lineHeight: 1.6 }}>{this.state.message}</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function Root() {
  return (
    <BrowserRouter>
      <ConnectionProvider endpoint={RPC_ENDPOINT} config={{ commitment: 'processed' }}>
        <WalletProvider autoConnect={false} wallets={[]}>
          <WalletModalProvider>
            <TokenMetaProvider tokens={TOKEN_METADATA}>
              <SendTransactionProvider priorityFee={0}>
                <GambaProvider>
                  <GambaPlatformProvider
                    creator={PLATFORM_CREATOR_ADDRESS}
                    defaultCreatorFee={PLATFORM_CREATOR_FEE}
                    defaultJackpotFee={PLATFORM_JACKPOT_FEE}
                    defaultPool={DEFAULT_POOL}
                    referral={{ fee: PLATFORM_REFERRAL_FEE, prefix: 'code' }}
                  >
                    <AppErrorBoundary>
                      <FakeBalanceSync />
                      <App />
                    </AppErrorBoundary>
                  </GambaPlatformProvider>
                </GambaProvider>
              </SendTransactionProvider>
            </TokenMetaProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  )
}

root.render(<Root />)
