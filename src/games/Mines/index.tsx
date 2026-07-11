import React from 'react'
import { GambaUi, useSound } from 'gamba-react-ui-v2'
import { BPS_PER_WHOLE } from 'gamba-core-v2'
import { GRID_SIZE, MINE_SELECT, PITCH_INCREASE_FACTOR, SOUND_EXPLODE, SOUND_FINISH, SOUND_STEP, SOUND_TICK, SOUND_WIN } from './constants'
import { CellButton, Container, Container2, Grid, Level, Levels, StatusBar } from './styles'
import { generateGrid, revealAllMines, revealGold } from './utils'
import { useUserStore } from '../hooks/useUserStore'
import { didPlayerWin } from '../../utils/houseEdge'

function Mines() {
  const { withdrawBalance, addBalance } = useUserStore()
  const sounds = useSound({
    tick: SOUND_TICK,
    win: SOUND_WIN,
    finish: SOUND_FINISH,
    step: SOUND_STEP,
    explode: SOUND_EXPLODE,
  })

  const [grid, setGrid] = React.useState(generateGrid(GRID_SIZE))
  const [currentLevel, setLevel] = React.useState(0)
  const [selected, setSelected] = React.useState(-1)
  const [totalGain, setTotalGain] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [started, setStarted] = React.useState(false)

  const [initialWager, setInitialWager] = React.useState(10)
  const [mines, setMines] = React.useState(MINE_SELECT[2])

  const getMultiplierForLevel = (level: number) => {
    const remainingCells = GRID_SIZE - level
    return Number(BigInt(remainingCells * BPS_PER_WHOLE) / BigInt(remainingCells - mines)) / BPS_PER_WHOLE
  }

  const levels = React.useMemo(() => {
    const totalLevels = GRID_SIZE - mines
    let cumProfit = 0
    let previousBalance = initialWager

    return Array.from({ length: totalLevels }).map((_, level) => {
      const wager = level === 0 ? initialWager : previousBalance
      const multiplier = getMultiplierForLevel(level)
      const remainingCells = GRID_SIZE - level
      const bet = Array.from({ length: remainingCells }, (_, i) => (i < mines ? 0 : multiplier))

      const profit = wager * (multiplier - 1)
      cumProfit += profit
      const balance = wager + profit

      previousBalance = balance
      return { bet, wager, profit, cumProfit, balance }
    })
  }, [initialWager, mines])

  const remainingCells = GRID_SIZE - currentLevel
  const gameFinished = remainingCells <= mines
  const canPlay = started && !loading && !gameFinished

  const { wager } = levels[currentLevel] ?? {}

  const stopLoopSounds = React.useCallback(() => {
    sounds.sounds.tick.player.stop()
    sounds.sounds.step.player.stop()
  }, [sounds])

  React.useEffect(() => {
    return () => stopLoopSounds()
  }, [stopLoopSounds])

  const start = () => {
    if (!withdrawBalance(initialWager, 'mines-start')) return
    setGrid(generateGrid(GRID_SIZE))
    setLoading(false)
    setLevel(0)
    setTotalGain(0)
    setStarted(true)
  }

  const endGame = () => {
    sounds.play('finish')
    reset()
  }

  const reset = () => {
    setGrid(generateGrid(GRID_SIZE))
    setLoading(false)
    setLevel(0)
    setTotalGain(0)
    setStarted(false)
    stopLoopSounds()
  }

  const play = async (cellIndex: number) => {
    if (!wager) return
    setLoading(true)
    setSelected(cellIndex)
    try {
      sounds.sounds.step.player.loop = true
      sounds.play('step')
      sounds.sounds.tick.player.loop = true
      sounds.play('tick')

      const isSafe = didPlayerWin()
      stopLoopSounds()

      if (!isSafe) {
        setStarted(false)
        setGrid(revealAllMines(grid, cellIndex, mines))
        sounds.play('explode')
        return
      }

      const profit = Math.round(wager * (getMultiplierForLevel(currentLevel) - 1))
      addBalance(profit, 'mines-win')

      const nextLevel = currentLevel + 1
      setLevel(nextLevel)
      setGrid(revealGold(grid, cellIndex, profit))
      setTotalGain(totalGain + profit)

      if (nextLevel < GRID_SIZE - mines) {
        sounds.play('win', { playbackRate: Math.pow(PITCH_INCREASE_FACTOR, currentLevel) })
      } else {
        sounds.play('win', { playbackRate: 0.9 })
        sounds.play('finish')
      }
    } finally {
      setLoading(false)
      setSelected(-1)
      stopLoopSounds()
    }
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <Container2>
          <Levels>
            {levels.map(({ cumProfit }, i) => (
              <Level key={i} $active={currentLevel === i}>
                <div>LEVEL {i + 1}</div>
                <div>{Math.round(cumProfit)} ⭐</div>
              </Level>
            ))}
          </Levels>
          <StatusBar>
            <div>
              <span>Mines: {mines}</span>
              {totalGain > 0 && (
                <span>
                  +{Math.round(totalGain)} ⭐ +{Math.round((totalGain / initialWager) * 100 - 100)}%
                </span>
              )}
            </div>
          </StatusBar>
          <GambaUi.Responsive>
            <Container>
              <Grid>
                {grid.map((cell, index) => (
                  <CellButton
                    key={index}
                    status={cell.status}
                    selected={selected === index}
                    onClick={() => play(index)}
                    disabled={!canPlay || cell.status !== 'hidden'}
                  >
                    {cell.status === 'gold' && <div>+{Math.round(cell.profit)} ⭐</div>}
                  </CellButton>
                ))}
              </Grid>
            </Container>
          </GambaUi.Responsive>
        </Container2>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        {!started ? (
          <>
            <GambaUi.WagerInput value={initialWager} onChange={setInitialWager} />
            <GambaUi.Select options={MINE_SELECT} value={mines} onChange={setMines} label={(value) => <>{value} mines</>} />
            <GambaUi.PlayButton onClick={start}>Start</GambaUi.PlayButton>
          </>
        ) : (
          <GambaUi.Button onClick={endGame}>{totalGain > 0 ? 'Cash out' : 'Reset'}</GambaUi.Button>
        )}
      </GambaUi.Portal>
    </>
  )
}

export default Mines
