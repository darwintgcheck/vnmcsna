// src/games/HiLo.tsx
import React from 'react'
import { GambaUi, useSound } from 'gamba-react-ui-v2'
import { useUserStore } from '../hooks/useUserStore'
import { 
  MAX_CARD_SHOWN, 
  RANKS, 
  RANK_SYMBOLS, 
  SOUND_CARD, 
  SOUND_FINISH, 
  SOUND_LOSE, 
  SOUND_PLAY, 
  SOUND_WIN 
} from './constants'
import { 
  Card, 
  CardContainer, 
  CardPreview, 
  CardsContainer, 
  Container, 
  Option, 
  Options, 
  Profit 
} from './styles'

const randomRank = () => 1 + Math.floor(Math.random() * (RANKS - 1))

const card = (rank = randomRank()): Card => ({
  key: Math.random(),
  rank,
})

interface Card {
  key: number
  rank: number
}

export interface HiLoConfig {
  logo: string
}

export default function HiLo(props: HiLoConfig) {
  const { balance, withdrawBalance, addBalance } = useUserStore()

  const [cards, setCards] = React.useState([card()])
  const [claiming, setClaiming] = React.useState(false)
  const [initialWager, setInitialWager] = React.useState(10)
  const [profit, setProfit] = React.useState(0)
  const currentRank = cards[cards.length - 1].rank
  const [option, setOption] = React.useState<'hi' | 'lo'>(currentRank > RANKS / 2 ? 'lo' : 'hi')
  const [hoveredOption, hoverOption] = React.useState<'hi' | 'lo'>()

  const sounds = useSound({
    card: SOUND_CARD,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    play: SOUND_PLAY,
    finish: SOUND_FINISH,
  })

  const addCard = (rank: number) =>
    setCards((cards) => [...cards, card(rank)].slice(-MAX_CARD_SHOWN))

  const play = async () => {
    if (initialWager > balance) return alert('Balans kifayət etmir')

    sounds.play('play')
    withdrawBalance(initialWager)

    // Random nəticə
    const nextRank = randomRank()
    addCard(nextRank)

    const win =
      (option === 'hi' && nextRank >= currentRank) ||
      (option === 'lo' && nextRank <= currentRank)

    setTimeout(() => {
      if (win) {
        const payout = initialWager * 2 // sadələşdirilmiş payout
        addBalance(payout)
        setProfit(payout)
        sounds.play('win')
      } else {
        setProfit(0)
        sounds.play('lose')
      }
      sounds.play('card', { playbackRate: 0.8 })
    }, 300)
  }

  const resetGame = () => {
    sounds.play('finish', { playbackRate: 0.8 })
    setTimeout(() => {
      setProfit(0)
      addCard(randomRank())
      setClaiming(false)
    }, 300)
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <GambaUi.Responsive>
          <Container $disabled={claiming}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <CardsContainer>
                {cards.map((card, i) => {
                  const offset = -(cards.length - (i + 1))
                  const xxx = cards.length > 3 ? i / cards.length : 1
                  const opacity = Math.min(1, xxx * 3)
                  return (
                    <CardContainer
                      key={card.key}
                      style={{
                        transform: `translate(${offset * 30}px, ${-offset * 0}px) rotateZ(-5deg) rotateY(5deg)`,
                        opacity,
                      }}
                    >
                      <Card>
                        <div className="rank">{RANK_SYMBOLS[card.rank]}</div>
                        <div
                          className="suit"
                          style={{ backgroundImage: 'url(' + props.logo + ')' }}
                        />
                      </Card>
                    </CardContainer>
                  )
                })}
              </CardsContainer>
              <Options>
                <Option
                  selected={option === 'hi'}
                  onClick={() => setOption('hi')}
                  onMouseEnter={() => hoverOption('hi')}
                  onMouseLeave={() => hoverOption(undefined)}
                >
                  <div>👆</div>
                  <div>HI</div>
                </Option>
                <Option
                  selected={option === 'lo'}
                  onClick={() => setOption('lo')}
                  onMouseEnter={() => hoverOption('lo')}
                  onMouseLeave={() => hoverOption(undefined)}
                >
                  <div>👇</div>
                  <div>LO</div>
                </Option>
              </Options>
            </div>
            <CardPreview>
              {Array.from({ length: RANKS }).map((_, rankIndex) => (
                <Card
                  key={rankIndex}
                  $small
                  style={{ opacity: 0.7 }}
                  onClick={() => addCard(rankIndex)}
                >
                  <div className="rank">{RANK_SYMBOLS[rankIndex]}</div>
                </Card>
              ))}
            </CardPreview>
            {profit > 0 && (
              <Profit key={profit} onClick={resetGame}>
                +{profit}
              </Profit>
            )}
          </Container>
        </GambaUi.Responsive>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        {!profit ? (
          <>
            <GambaUi.WagerInput
              value={initialWager}
              onChange={setInitialWager}
            />
            <GambaUi.PlayButton disabled={!option} onClick={play}>
              Deal card
            </GambaUi.PlayButton>
          </>
        ) : (
          <>
            <div>Profit: {profit}</div>
            <GambaUi.Button onClick={resetGame}>Finish</GambaUi.Button>
            <GambaUi.PlayButton disabled={!option} onClick={play}>
              Deal card
            </GambaUi.PlayButton>
          </>
        )}
      </GambaUi.Portal>
    </>
  )
}
