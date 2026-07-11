import React from 'react'
import styled from 'styled-components'
import { GambaUi, useSound } from 'gamba-react-ui-v2'
import { useUserStore } from '../../hooks/useUserStore'
import { SOUND_LOSE, SOUND_PLAY, SOUND_WIN } from './constants'

const ScreenCard = styled.div`
  display: grid;
  gap: 14px;
  width: 100%;
`

const WheelCard = styled.div`
  padding: 16px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(16, 20, 14, 0.98), rgba(10, 12, 9, 0.98));
  border: 1px solid rgba(255,255,255,0.08);
  display: grid;
  gap: 12px;
`

const ResultRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const ResultBall = styled.div<{ $red?: boolean; $green?: boolean }>`
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #fff;
  background: ${({ $green, $red }) => ($green ? '#1fb85d' : $red ? '#dd374f' : '#101318')};
  border: 1px solid rgba(255,255,255,0.1);
`

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`

const StatCard = styled.div`
  padding: 12px;
  border-radius: 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  text-align: center;
`

const StatLabel = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9fb0d7;
  font-weight: 800;
`

const StatValue = styled.div`
  margin-top: 4px;
  font-size: 20px;
  font-weight: 900;
`

const Table = styled.div`
  display: grid;
  gap: 10px;
`

const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: 60px repeat(12, minmax(0, 1fr));
  gap: 6px;

  @media (max-width: 720px) {
    grid-template-columns: 48px repeat(12, minmax(0, 1fr));
    gap: 4px;
  }
`

const OutsideGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
`

const BetSquare = styled.button<{ $tone?: 'red' | 'black' | 'green'; $active?: boolean }>`
  position: relative;
  min-height: 54px;
  border-radius: 14px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255,230,127,0.75)' : 'rgba(255,255,255,0.08)')};
  background: ${({ $tone }) => ($tone === 'green' ? '#0d7c46' : $tone === 'red' ? '#b22235' : '#101318')};
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? '0 0 0 2px rgba(255,230,127,0.18) inset' : 'none')};

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`

const Chip = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffe37e, #ff8b61);
  color: #140b0b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  padding: 0 6px;
`

const Controls = styled.div`
  display: grid;
  gap: 12px;
  width: 100%;
`

const ChipSelector = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const ChipButton = styled.button<{ $active?: boolean }>`
  min-height: 42px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255,230,127,0.75)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $active }) => ($active ? 'linear-gradient(135deg, rgba(255,224,117,0.22), rgba(255,130,99,0.18))' : 'rgba(255,255,255,0.05)')};
  color: #fff;
  font-weight: 800;
  padding: 0 14px;
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

const Status = styled.div<{ $win?: boolean; $loss?: boolean }>`
  padding: 12px 14px;
  border-radius: 16px;
  background: ${({ $win, $loss }) => ($win ? 'rgba(72, 255, 143, 0.12)' : $loss ? 'rgba(255, 99, 99, 0.12)' : 'rgba(255,255,255,0.05)')};
  border: 1px solid ${({ $win, $loss }) => ($win ? 'rgba(72,255,143,0.35)' : $loss ? 'rgba(255,99,99,0.3)' : 'rgba(255,255,255,0.1)')};
  color: ${({ $win, $loss }) => ($win ? '#7cffb1' : $loss ? '#ff9f9f' : '#dfe8ff')};
  font-weight: 800;
  text-align: center;
`

const CHIP_VALUES = [1, 5, 10, 25]
const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])
const HISTORY_LIMIT = 8

const numbers = Array.from({ length: 36 }, (_, index) => index + 1)

const rows = [
  numbers.filter((number) => number % 3 === 1),
  numbers.filter((number) => number % 3 === 2),
  numbers.filter((number) => number % 3 === 0),
]

type BetKey = string

type BetMap = Record<BetKey, number>

const outsideBets: Array<{ key: BetKey; label: string }> = [
  { key: '1-18', label: '1-18' },
  { key: 'even', label: 'Even' },
  { key: 'red', label: 'Red' },
  { key: 'black', label: 'Black' },
  { key: 'odd', label: 'Odd' },
  { key: '19-36', label: '19-36' },
]

function isRed(number: number) {
  return RED_NUMBERS.has(number)
}

function getTone(number: number): 'red' | 'black' | 'green' {
  if (number === 0) return 'green'
  return isRed(number) ? 'red' : 'black'
}

function getWinningNumbers(betKey: BetKey) {
  if (betKey === '0') return [0]
  if (/^n-\d+$/.test(betKey)) return [Number(betKey.replace('n-', ''))]
  if (betKey === 'red') return numbers.filter(isRed)
  if (betKey === 'black') return numbers.filter((number) => !isRed(number))
  if (betKey === 'even') return numbers.filter((number) => number % 2 === 0)
  if (betKey === 'odd') return numbers.filter((number) => number % 2 === 1)
  if (betKey === '1-18') return numbers.filter((number) => number >= 1 && number <= 18)
  if (betKey === '19-36') return numbers.filter((number) => number >= 19 && number <= 36)
  return []
}

function getMultiplier(betKey: BetKey) {
  if (betKey === '0' || /^n-\d+$/.test(betKey)) return 36
  return 2
}

export default function Roulette() {
  const { balance, withdrawBalance, addBalance } = useUserStore()
  const [selectedChip, setSelectedChip] = React.useState(5)
  const [bets, setBets] = React.useState<BetMap>({})
  const [history, setHistory] = React.useState<number[]>([])
  const [spinning, setSpinning] = React.useState(false)
  const [currentNumber, setCurrentNumber] = React.useState<number | null>(null)
  const [status, setStatus] = React.useState('Place chips on the table and spin the wheel.')
  const [lastNet, setLastNet] = React.useState<number | null>(null)

  const sounds = useSound({
    play: SOUND_PLAY,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
  })

  const totalWager = Object.values(bets).reduce((sum, value) => sum + value, 0)

  const placeBet = (betKey: BetKey) => {
    if (spinning) return
    setBets((current) => ({ ...current, [betKey]: (current[betKey] || 0) + selectedChip }))
  }

  const clearBets = () => {
    if (spinning) return
    setBets({})
    setStatus('All chips were cleared.')
    setLastNet(null)
  }

  const spin = () => {
    if (spinning || !totalWager) return
    if (!withdrawBalance(totalWager, 'roulette-bet')) {
      setStatus('Not enough balance for the selected chips.')
      setLastNet(null)
      return
    }

    setSpinning(true)
    setLastNet(null)
    setStatus('The wheel is spinning…')
    sounds.play('play')

    const winningNumber = Math.floor(Math.random() * 37)
    window.setTimeout(() => {
      let payout = 0
      Object.entries(bets).forEach(([betKey, chipValue]) => {
        if (getWinningNumbers(betKey).includes(winningNumber)) {
          payout += chipValue * getMultiplier(betKey)
        }
      })

      setCurrentNumber(winningNumber)
      setHistory((current) => [winningNumber, ...current].slice(0, HISTORY_LIMIT))

      if (payout > 0) {
        addBalance(payout, 'roulette-win')
        setLastNet(payout - totalWager)
        setStatus(`Winning number ${winningNumber}. You won ${payout} ⭐.`)
        sounds.play('win')
      } else {
        setLastNet(-totalWager)
        setStatus(`Winning number ${winningNumber}. No payout this round.`)
        sounds.play('lose')
      }

      setBets({})
      setSpinning(false)
    }, 1400)
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <ScreenCard>
          <WheelCard>
            <Stats>
              <StatCard>
                <StatLabel>Total bet</StatLabel>
                <StatValue>{totalWager} ⭐</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Selected chip</StatLabel>
                <StatValue>{selectedChip} ⭐</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Current ball</StatLabel>
                <StatValue>{currentNumber === null ? '—' : currentNumber}</StatValue>
              </StatCard>
            </Stats>

            <ResultRow>
              {history.length ? history.map((value, index) => (
                <ResultBall key={`${value}-${index}`} $green={value === 0} $red={value !== 0 && isRed(value)}>
                  {value}
                </ResultBall>
              )) : <ResultBall>—</ResultBall>}
            </ResultRow>
          </WheelCard>

          <Table>
            <NumberGrid>
              <BetSquare type="button" $tone="green" $active={Boolean(bets['0'])} onClick={() => placeBet('0')} disabled={spinning}>
                0
                {bets['0'] ? <Chip>{bets['0']}</Chip> : null}
              </BetSquare>
              {rows[0].map((number) => (
                <BetSquare key={`r1-${number}`} type="button" $tone={getTone(number)} $active={Boolean(bets[`n-${number}`])} onClick={() => placeBet(`n-${number}`)} disabled={spinning}>
                  {number}
                  {bets[`n-${number}`] ? <Chip>{bets[`n-${number}`]}</Chip> : null}
                </BetSquare>
              ))}
              <div />
              {rows[1].map((number) => (
                <BetSquare key={`r2-${number}`} type="button" $tone={getTone(number)} $active={Boolean(bets[`n-${number}`])} onClick={() => placeBet(`n-${number}`)} disabled={spinning}>
                  {number}
                  {bets[`n-${number}`] ? <Chip>{bets[`n-${number}`]}</Chip> : null}
                </BetSquare>
              ))}
              <div />
              {rows[2].map((number) => (
                <BetSquare key={`r3-${number}`} type="button" $tone={getTone(number)} $active={Boolean(bets[`n-${number}`])} onClick={() => placeBet(`n-${number}`)} disabled={spinning}>
                  {number}
                  {bets[`n-${number}`] ? <Chip>{bets[`n-${number}`]}</Chip> : null}
                </BetSquare>
              ))}
            </NumberGrid>

            <OutsideGrid>
              {outsideBets.map((bet) => (
                <BetSquare
                  key={bet.key}
                  type="button"
                  $tone={bet.key === 'red' ? 'red' : bet.key === 'black' ? 'black' : 'green'}
                  $active={Boolean(bets[bet.key])}
                  onClick={() => placeBet(bet.key)}
                  disabled={spinning}
                >
                  {bet.label}
                  {bets[bet.key] ? <Chip>{bets[bet.key]}</Chip> : null}
                </BetSquare>
              ))}
            </OutsideGrid>
          </Table>
        </ScreenCard>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <Controls>
          <ChipSelector>
            {CHIP_VALUES.map((chip) => (
              <ChipButton key={chip} type="button" $active={selectedChip === chip} onClick={() => setSelectedChip(chip)}>
                {chip} ⭐
              </ChipButton>
            ))}
          </ChipSelector>
          <ActionRow>
            <ActionButton type="button" onClick={clearBets} disabled={spinning || !totalWager}>Clear chips</ActionButton>
            <ActionButton type="button" $accent onClick={spin} disabled={spinning || !totalWager || totalWager > balance}>
              {spinning ? 'Spinning…' : 'Spin Wheel'}
            </ActionButton>
          </ActionRow>
          <Status $win={Boolean(lastNet && lastNet > 0)} $loss={Boolean(lastNet !== null && lastNet < 0)}>
            {status}
          </Status>
        </Controls>
      </GambaUi.Portal>
    </>
  )
}
