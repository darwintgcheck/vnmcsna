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
  const fakeAccount = useFakeAccountStore()

  React.useEffect(() => {
    fakeAccount.set(() => ({ balance: Math.max(0, balance || 0) }))
  }, [balance, fakeAccount])

  return null
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
                    <FakeBalanceSync />
                    <App />
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
