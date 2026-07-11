import { GameBundle } from 'gamba-react-ui-v2'
import React from 'react'

export const GAMES: GameBundle[] = [
  {
    id: 'dice',
    meta: {
      background: '#ff6490',
      name: 'Dice',
      image: '/games/dice.png',
      description: 'Pick your number, roll the dice, and chase a clean instant win with simple odds and clear payouts.',
    },
    app: React.lazy(() => import('./Dice')),
  },
  {
    id: 'slots',
    meta: {
      background: '#5465ff',
      name: 'Slots',
      image: '/games/slots.png',
      description: 'Classic three-reel casino action with faster spins, cleaner controls, and sharper mobile visuals.',
    },
    app: React.lazy(() => import('./Slots')),
  },
  {
    id: 'flip',
    meta: {
      name: 'Flip',
      description: 'A fast coin flip round with simple risk, instant settlement, and a clean heads-or-tails experience.',
      image: '/games/flip.png',
      background: '#ffe694',
    },
    app: React.lazy(() => import('./Flip')),
  },
  {
    id: 'hilo',
    meta: {
      name: 'HiLo',
      image: '/games/hilo.png',
      description: 'Guess whether the next card will be higher or lower and turn every correct read into a quick payout.',
      background: '#ff4f4f',
    },
    props: { logo: '/logo.svg' },
    app: React.lazy(() => import('./HiLo')),
  },
  {
    id: 'mines',
    meta: {
      name: 'Mines',
      description: 'Open safe tiles, avoid the hidden mines, and cash out before your luck runs out.',
      image: '/games/mines.png',
      background: '#8376ff',
    },
    app: React.lazy(() => import('./Mines')),
  },
  {
    id: 'roulette',
    meta: {
      name: 'Roulette',
      image: '/games/roulette.png',
      description: 'Place chips across the table, spin the wheel, and hunt for the perfect landing spot.',
      background: '#1de87e',
    },
    app: React.lazy(() => import('./Roulette')),
  },
  {
    id: 'plinko',
    meta: {
      background: '#7272ff',
      image: '/games/plinko.png',
      name: 'Plinko',
      description: 'Drop the ball, watch the bounce path, and hope it lands in a strong payout lane.',
    },
    app: React.lazy(() => import('./Plinko')),
  },
  {
    id: 'crash',
    meta: {
      background: '#de95e8',
      image: '/games/crash.png',
      name: 'Crash',
      description: 'Ride the flight multiplier, cash out manually when you want, or enable auto cash out at your chosen target.',
    },
    app: React.lazy(() => import('./CrashGame')),
  },
  {
    id: 'blackjack',
    meta: {
      background: '#084700',
      image: '/games/blackjack.png',
      name: 'BlackJack',
      description: 'Quick blackjack rounds with clean card totals, simple controls, and instant balance updates.',
    },
    app: React.lazy(() => import('./BlackJack')),
  },
]
