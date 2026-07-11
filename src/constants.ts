import { PublicKey } from '@solana/web3.js'
import { FAKE_TOKEN_MINT, TokenMeta } from 'gamba-react-ui-v2'

export const SITE_NAME = 'King Casino'
export const DEFAULT_BALANCE = 0
export const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT ?? 'https://api.mainnet-beta.solana.com'
export const PLATFORM_CREATOR_ADDRESS = new PublicKey('11111111111111111111111111111111')
export const EXPLORER_URL = ''
export const PLATFORM_SHARABLE_URL = ''
export const PLATFORM_CREATOR_FEE = 0
export const PLATFORM_JACKPOT_FEE = 0
export const PLATFORM_REFERRAL_FEE = 0
export const PLATFORM_ALLOW_REFERRER_REMOVAL = true
export const DEFAULT_POOL = { token: FAKE_TOKEN_MINT }
export const POOLS = [DEFAULT_POOL]
export const TOKEN_METADATA: (Partial<TokenMeta> & { mint: PublicKey })[] = [
  {
    mint: FAKE_TOKEN_MINT,
    name: 'Telegram Stars',
    symbol: '⭐',
    image: '/logo.svg',
    baseWager: 1,
    decimals: 0,
    usdPrice: 0,
  },
]
export const TOS_HTML = `
  <p><b>1.</b> The platform works with your Telegram account.</p>
  <p><b>2.</b> Balance, deposits, and withdrawals are calculated in Telegram Stars.</p>
  <p><b>3.</b> Withdrawals are reviewed by an admin before payout.</p>
  <p><b>4.</b> User balances, payment history, and withdrawal requests are stored in MongoDB.</p>
`
export const TOKEN_METADATA_FETCHER = undefined
export const ENABLE_LEADERBOARD = false
export const ENABLE_TROLLBOX = false
