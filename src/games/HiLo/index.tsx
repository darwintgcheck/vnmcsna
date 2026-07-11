import React from 'react'
import styled from 'styled-components'
import { GambaUi, useSound } from 'gamba-react-ui-v2'
import { useUserStore } from '../../hooks/useUserStore'
import { SOUND_CARD, SOUND_FINISH, SOUND_LOSE, SOUND_PLAY, SOUND_WIN } from './constants'

const ScreenCard = styled.div`
  width: 100%;
  min-height: 100%;
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(18, 13, 24, 0.96), rgba(8, 8, 14, 0.98));
  border: 1px solid rgba(255,255,255,0.08);
`

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
`

const Card = styled.div<{ $hidden?: boolean; $red?: boolean }>`
  min-height: 190px;
  border-radius: 22px;
  background: ${({ $hidden }) => ($hidden ? 'linear-gradient(135deg, #28213c, #14111f)' : 'linear-gradient(180deg, #ffffff, #f3f4f8)')};
  border: 1px solid ${({ $hidden }) => ($hidden ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  color: ${({ $hidden, $red }) => ($hidden ? '#d9cbff' : $red ? '#b91c1c' : '#161616')};
  box-shadow: 0 12px 24px rgba(0,0,0,0.24);
`

const CardRank = styled.div`
  font-size: clamp(34px, 8vw, 64px);
  font-weight: 900;
  z-index: 2;
`

const CardSuit = styled.div<{ $hidden?: boolean }>`
  position: absolute;
  right: 14px;
  bottom: 10px;
  font-size: 68px;
  opacity: ${({ $hidden }) => ($hidden ? 0.2 : 0.16)};
`

const Corner = styled.div<{ $top?: boolean; $red?: boolean }>`
  position: absolute;
  ${({ $top }) => ($top ? 'top: 12px; left: 12px;' : 'right: 12px; bottom: 12px; transform: rotate(180deg);')}
  display: grid;
  gap: 2px;
  line-height: 1;
  font-weight: 900;
  color: ${({ $red }) => ($red ? '#b91c1c' : 'inherit')};

  span:last-child {
    font-size: 18px;
  }
`

const CardLabel = styled.div`
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
`

const Status = styled.div<{ $win?: boolean; $loss?: boolean }>`
  padding: 14px;
  border-radius: 18px;
  background: ${({ $win, $loss }) => ($win ? 'rgba(72,255,143,0.12)' : $loss ? 'rgba(255,99,99,0.12)' : 'rgba(255,255,255,0.05)')};
  border: 1px solid ${({ $win, $loss }) => ($win ? 'rgba(72,255,143,0.35)' : $loss ? 'rgba(255,99,99,0.3)' : 'rgba(255,255,255,0.1)')};
  color: ${({ $win, $loss }) => ($win ? '#7cffb1' : $loss ? '#ff9f9f' : '#dfe8ff')};
  font-weight: 800;
  text-align: center;
`

const Controls = styled.div`
  width: 100%;
  display: grid;
  gap: 12px;
`

const WagerInput = styled.input`
  width: 100%;
  min-height: 56px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: #fff;
  padding: 0 16px;
  font-size: 18px;
  font-weight: 800;
  outline: none;
`

const GuessRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

const GuessButton = styled.button<{ $active?: boolean }>`
  min-height: 54px;
  border-radius: 18px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255,224,117,0.7)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $active }) => ($active ? 'linear-gradient(135deg, rgba(255,224,117,0.22), rgba(255,130,99,0.18))' : 'rgba(255,255,255,0.05)')};
  color: #fff;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
`

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

const ActionButton = styled.button<{ $accent?: boolean }>`
  min-height: 56px;
  border: none;
  border-radius: 18px;
  background: ${({ $accent }) => ($accent ? 'linear-gradient(90deg, #f3b533, #ff6d7e)' : 'rgba(255,255,255,0.06)')};
  color: ${({ $accent }) => ($accent ? '#1e0909' : '#fff')};
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  border: ${({ $accent }) => ($accent ? 'none' : '1px solid rgba(255,255,255,0.12)')};

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  color: #9fb0d7;
  font-size: 13px;
  font-weight: 700;
`

type Choice = 'hi' | 'lo'
type Suit = '♠' | '♥' | '♦' | '♣'

interface PlayingCard {
  id: string
  rank: number
  rankLabel: string
  suit: Suit
  isRed: boolean
}

export interface HiLoConfig {
  logo: string
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
const RANK_LABELS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

function shuffleDeck() {
  const deck: PlayingCard[] = []
  SUITS.forEach((suit) => {
    RANK_LABELS.forEach((rankLabel, rank) => {
      deck.push({
        id: `${rankLabel}-${suit}`,
        rank,
        rankLabel,
        suit,
        isRed: suit === '♥' || suit === '♦',
      })
    })
  })

  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }

  return deck
}

function pullNextPlayableCard(deck: PlayingCard[], currentCard: PlayingCard) {
  let index = deck.findIndex((card) => card.rank !== currentCard.rank)
  if (index < 0) {
    index = 0
  }
  const [card] = deck.splice(index, 1)
  return card
}

function createFreshRound() {
  const deck = shuffleDeck()
  const currentCard = deck.shift()!
  return { currentCard, deck }
}

export default function HiLo({ logo }: HiLoConfig) {
  const { balance, withdrawBalance, addBalance } = useUserStore()
  const initialRound = React.useMemo(() => createFreshRound(), [])
  const [deck, setDeck] = React.useState<PlayingCard[]>(initialRound.deck)
  const [currentCard, setCurrentCard] = React.useState<PlayingCard>(initialRound.currentCard)
  const [nextCard, setNextCard] = React.useState<PlayingCard | null>(null)
  const [choice, setChoice] = React.useState<Choice>('hi')
  const [wager, setWager] = React.useState(10)
  const [status, setStatus] = React.useState('Choose higher or lower and deal the next card.')
  const [lastNet, setLastNet] = React.useState<number | null>(null)
  const [busy, setBusy] = React.useState(false)

  const sounds = useSound({
    play: SOUND_PLAY,
    card: SOUND_CARD,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    finish: SOUND_FINISH,
  })

  const resetRound = React.useCallback((message = 'New shuffled deck. Choose higher or lower and deal the next card.') => {
    const fresh = createFreshRound()
    setDeck(fresh.deck)
    setCurrentCard(fresh.currentCard)
    setNextCard(null)
    setStatus(message)
    setLastNet(null)
    sounds.play('finish', { playbackRate: 0.9 })
  }, [sounds])

  const play = () => {
    const nextWager = Math.max(1, Math.round(Number(wager) || 1))
    setWager(nextWager)

    if (busy) return
    if (!withdrawBalance(nextWager, 'hilo-bet')) {
      setStatus('Not enough balance for that card deal.')
      setLastNet(null)
      return
    }

    let workingDeck = [...deck]
    let workingCurrentCard = currentCard

    if (workingDeck.length < 2) {
      const fresh = createFreshRound()
      workingDeck = fresh.deck
      workingCurrentCard = fresh.currentCard
      setCurrentCard(fresh.currentCard)
    }

    const dealtCard = pullNextPlayableCard(workingDeck, workingCurrentCard)
    if (!dealtCard) {
      resetRound()
      return
    }

    setBusy(true)
    setStatus('Dealing the next card…')
    setLastNet(null)
    sounds.play('play')

    window.setTimeout(() => {
      setNextCard(dealtCard)
      sounds.play('card', { playbackRate: 0.9 })

      const won = choice === 'hi' ? dealtCard.rank > workingCurrentCard.rank : dealtCard.rank < workingCurrentCard.rank
      if (won) {
        const payout = nextWager * 2
        addBalance(payout, 'hilo-win')
        setLastNet(payout - nextWager)
        setStatus(`Correct guess. ${dealtCard.rankLabel}${dealtCard.suit} was ${choice === 'hi' ? 'higher' : 'lower'} and you won ${payout} ⭐.`)
        sounds.play('win')
      } else {
        setLastNet(-nextWager)
        setStatus(`Wrong guess. The next card was ${dealtCard.rankLabel}${dealtCard.suit}.`)
        sounds.play('lose')
      }

      setCurrentCard(dealtCard)
      setDeck(workingDeck)
      setBusy(false)
    }, 500)
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <ScreenCard>
          <Cards>
            <Card $red={currentCard.isRed}>
              <CardLabel>Current card</CardLabel>
              <Corner $top $red={currentCard.isRed}>
                <span>{currentCard.rankLabel}</span>
                <span>{currentCard.suit}</span>
              </Corner>
              <Corner $red={currentCard.isRed}>
                <span>{currentCard.rankLabel}</span>
                <span>{currentCard.suit}</span>
              </Corner>
              <CardRank>{currentCard.rankLabel}</CardRank>
              <CardSuit>{currentCard.suit}</CardSuit>
            </Card>
            <Card $hidden={nextCard === null} $red={nextCard?.isRed}>
              <CardLabel>Next card</CardLabel>
              {nextCard ? (
                <>
                  <Corner $top $red={nextCard.isRed}>
                    <span>{nextCard.rankLabel}</span>
                    <span>{nextCard.suit}</span>
                  </Corner>
                  <Corner $red={nextCard.isRed}>
                    <span>{nextCard.rankLabel}</span>
                    <span>{nextCard.suit}</span>
                  </Corner>
                </>
              ) : null}
              <CardRank>{nextCard === null ? '?' : nextCard.rankLabel}</CardRank>
              <CardSuit $hidden={nextCard === null}>{nextCard === null ? '🂠' : nextCard.suit}</CardSuit>
            </Card>
          </Cards>

          <Status $win={Boolean(lastNet && lastNet > 0)} $loss={Boolean(lastNet !== null && lastNet < 0)}>
            {status}
          </Status>

          <Footer>
            <span>Cards left: {deck.length}</span>
            <span>Deck mode: no duplicate rank streaks</span>
          </Footer>
        </ScreenCard>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <Controls>
          <WagerInput
            type="number"
            min={1}
            max={Math.max(balance, 1)}
            value={wager}
            onChange={(e) => setWager(Math.max(1, Math.round(Number(e.target.value) || 1)))}
            placeholder="Enter bet amount"
          />
          <GuessRow>
            <GuessButton type="button" $active={choice === 'hi'} onClick={() => setChoice('hi')}>Higher</GuessButton>
            <GuessButton type="button" $active={choice === 'lo'} onClick={() => setChoice('lo')}>Lower</GuessButton>
          </GuessRow>
          <ActionRow>
            <ActionButton type="button" onClick={() => resetRound()}>Reset Deck</ActionButton>
            <ActionButton type="button" $accent disabled={busy || wager > balance} onClick={play}>Deal Card</ActionButton>
          </ActionRow>
        </Controls>
      </GambaUi.Portal>
    </>
  )
}
