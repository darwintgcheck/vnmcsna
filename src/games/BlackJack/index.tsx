import React from 'react'
import { GambaUi, useSound, useWagerInput } from 'gamba-react-ui-v2'
import { useUserStore } from '../hooks/useUserStore'
import { didPlayerWin, pickRandom } from '../../utils/houseEdge'
import {
  CARD_VALUES,
  RANKS,
  RANK_SYMBOLS,
  SUIT_COLORS,
  SUIT_SYMBOLS,
  SUITS,
  SOUND_CARD,
  SOUND_LOSE,
  SOUND_PLAY,
  SOUND_WIN,
  SOUND_JACKPOT,
} from './constants'
import { Card, CardContainer, CardsContainer, Container, Profit, CardArea } from './styles'

const randomRank = () => Math.floor(Math.random() * RANKS)
const randomSuit = () => Math.floor(Math.random() * SUITS)

const createCard = (rank = randomRank(), suit = randomSuit()): CardType => ({
  key: Math.random(),
  rank,
  suit,
})

interface CardType {
  key: number
  rank: number
  suit: number
}

export interface BlackjackConfig {
  logo: string
}

export default function Blackjack(props: BlackjackConfig) {
  const { withdrawBalance, addBalance } = useUserStore()
  const [playerCards, setPlayerCards] = React.useState<CardType[]>([])
  const [dealerCards, setDealerCards] = React.useState<CardType[]>([])
  const [initialWager, setInitialWager] = useWagerInput()
  const [profit, setProfit] = React.useState<number | null>(null)
  const [claiming, setClaiming] = React.useState(false)

  const sounds = useSound({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    play: SOUND_PLAY,
    card: SOUND_CARD,
    jackpot: SOUND_JACKPOT,
  })

  const resetGame = () => {
    setProfit(null)
    setPlayerCards([])
    setDealerCards([])
  }

  const play = async () => {
    if (!withdrawBalance(initialWager, 'blackjack-bet')) {
      alert('Not enough balance!')
      return
    }

    resetGame()
    sounds.play('play')

    const didWinRound = didPlayerWin()
    const payoutMultiplier = didWinRound ? pickRandom([2, 2, 2, 2, 2, 2.5]) : 0

    let newPlayerCards: CardType[] = []
    let newDealerCards: CardType[] = []

    if (payoutMultiplier === 2.5) {
      newPlayerCards = generateBlackjackHand()
      newDealerCards = generateRandomHandBelow(21)
    } else if (payoutMultiplier === 2) {
      newPlayerCards = generateWinningHand()
      newDealerCards = generateLosingHand(newPlayerCards)
    } else {
      newPlayerCards = generateLosingHand()
      newDealerCards = generateWinningHandOver(newPlayerCards)
    }

    const dealCards = async () => {
      for (let i = 0; i < 2; i++) {
        if (i < newPlayerCards.length) {
          setPlayerCards((prev) => [...prev, newPlayerCards[i]])
          sounds.play('card')
          await new Promise((resolve) => setTimeout(resolve, 420))
        }
        if (i === 1 && payoutMultiplier === 2.5) {
          sounds.play('jackpot')
        }
        if (i < newDealerCards.length) {
          setDealerCards((prev) => [...prev, newDealerCards[i]])
          sounds.play('card')
          await new Promise((resolve) => setTimeout(resolve, 420))
        }
      }
    }

    await dealCards()

    const payout = initialWager * payoutMultiplier
    if (payout > 0) {
      addBalance(payout, 'blackjack-win')
    }

    setProfit(payout)

    if (payoutMultiplier === 2.5) {
      // jackpot sound already played above
    } else if (payoutMultiplier > 0) {
      sounds.play('win')
    } else {
      sounds.play('lose')
    }
  }

  const getHandValue = (hand: CardType[]): number => hand.reduce((sum, currentCard) => sum + CARD_VALUES[currentCard.rank], 0)

  const generateBlackjackHand = (): CardType[] => {
    const aceRank = 12
    const tenRanks = [8, 9, 10, 11]
    const tenCardRank = tenRanks[Math.floor(Math.random() * tenRanks.length)]
    return [createCard(aceRank, randomSuit()), createCard(tenCardRank, randomSuit())]
  }

  const generateRandomHandBelow = (maxTotal: number): CardType[] => {
    let handValue = maxTotal
    while (handValue >= maxTotal) {
      const card1 = createCard()
      const card2 = createCard()
      handValue = CARD_VALUES[card1.rank] + CARD_VALUES[card2.rank]
      if (handValue < maxTotal) {
        return [card1, card2]
      }
    }
    return []
  }

  const generateWinningHand = (): CardType[] => {
    const totals = [17, 18, 19, 20]
    const targetTotal = totals[Math.floor(Math.random() * totals.length)]
    return generateHandWithTotal(targetTotal)
  }

  const generateLosingHand = (opponentHand?: CardType[]): CardType[] => {
    const opponentTotal = opponentHand ? getHandValue(opponentHand) : 20
    let total = opponentTotal
    while (total >= opponentTotal) {
      const hand = [createCard(), createCard()]
      total = getHandValue(hand)
      if (total < opponentTotal) {
        return hand
      }
    }
    return []
  }

  const generateWinningHandOver = (opponentHand: CardType[]): CardType[] => {
    const opponentTotal = getHandValue(opponentHand)
    let total = opponentTotal
    while (total <= opponentTotal || total > 21) {
      const hand = [createCard(), createCard()]
      total = getHandValue(hand)
      if (total > opponentTotal && total <= 21) {
        return hand
      }
    }
    return []
  }

  const generateHandWithTotal = (targetTotal: number): CardType[] => {
    for (let i = 0; i < 100; i++) {
      const card1 = createCard()
      const card2 = createCard()
      if (CARD_VALUES[card1.rank] + CARD_VALUES[card2.rank] === targetTotal) {
        return [card1, card2]
      }
    }
    return generateRandomHandBelow(targetTotal)
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <GambaUi.Responsive>
          <Container $disabled={claiming}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2>Dealer&apos;s Hand</h2>
              <CardArea>
                <CardsContainer>
                  {dealerCards.map((currentCard) => (
                    <CardContainer key={currentCard.key}>
                      <Card color={SUIT_COLORS[currentCard.suit]}>
                        <div className="rank">{RANK_SYMBOLS[currentCard.rank]}</div>
                        <div className="suit">{SUIT_SYMBOLS[currentCard.suit]}</div>
                      </Card>
                    </CardContainer>
                  ))}
                </CardsContainer>
              </CardArea>

              <h2>Player&apos;s Hand</h2>
              <CardArea>
                <CardsContainer>
                  {playerCards.map((currentCard) => (
                    <CardContainer key={currentCard.key}>
                      <Card color={SUIT_COLORS[currentCard.suit]}>
                        <div className="rank">{RANK_SYMBOLS[currentCard.rank]}</div>
                        <div className="suit">{SUIT_SYMBOLS[currentCard.suit]}</div>
                      </Card>
                    </CardContainer>
                  ))}
                </CardsContainer>
              </CardArea>

              {profit !== null && (
                <Profit key={profit}>
                  {profit > 0 ? <>{Math.round(profit)} ⭐ (+{Math.round((profit / initialWager) * 100 - 100)}%)</> : <>Lost</>}
                </Profit>
              )}
            </div>
          </Container>
        </GambaUi.Responsive>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <>
          <GambaUi.WagerInput value={initialWager} onChange={setInitialWager} />
          <GambaUi.PlayButton onClick={play}>Deal cards</GambaUi.PlayButton>
        </>
      </GambaUi.Portal>
    </>
  )
}
