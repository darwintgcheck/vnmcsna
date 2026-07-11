import { GambaUi, useSoundStore } from 'gamba-react-ui-v2'
import React from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { GAMES } from '../../games'
import { useUserStore } from '../../hooks/useUserStore'
import { Container, Controls, ExitButton, IconButton, MetaControls, MetaGroup, Screen, ScreenViewport, Splash } from './Game.styles'

const TopMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
`

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
`

const ResultBadge = styled.div<{ $win?: boolean; $loss?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: ${({ $win, $loss }) => ($win ? 'rgba(52, 211, 153, 0.18)' : $loss ? 'rgba(248, 113, 113, 0.16)' : 'rgba(255,255,255,0.08)')};
  border: 1px solid ${({ $win, $loss }) => ($win ? 'rgba(52, 211, 153, 0.35)' : $loss ? 'rgba(248, 113, 113, 0.35)' : 'rgba(255,255,255,0.08)')};
  color: #fff;
  font-size: 13px;
  font-weight: 800;
`

function CustomError() {
  return (
    <GambaUi.Portal target="error">
      <GambaUi.Responsive>
        <h1>⚠️ Error</h1>
        <p>The game could not be loaded.</p>
      </GambaUi.Responsive>
    </GambaUi.Portal>
  )
}

function CustomRenderer() {
  const { game } = GambaUi.useGame()
  const [info, setInfo] = React.useState(false)
  const soundStore = useSoundStore()
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 300)
    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <>
      {info && (
        <Modal onClose={() => setInfo(false)}>
          <h1>
            <img height="100px" title={game.meta.name} src={game.meta.image} />
          </h1>
          <p>{game.meta.description}</p>
          <button style={{ marginTop: 16 }} onClick={() => setInfo(false)}>
            Continue
          </button>
        </Modal>
      )}
      <Container>
        <MetaControls>
          <ExitButton as={Link} to="/">← Exit game</ExitButton>
          <MetaGroup>
            <IconButton onClick={() => setInfo(true)}>
              <Icon.Info />
            </IconButton>
            <IconButton onClick={() => soundStore.set(soundStore.volume ? 0 : 0.5)}>
              {soundStore.volume ? <Icon.Volume /> : <Icon.VolumeMuted />}
            </IconButton>
          </MetaGroup>
        </MetaControls>

        <Screen>
          <Splash>
            <img height="150px" src={game.meta.image} />
          </Splash>
          <ScreenViewport>
            <GambaUi.PortalTarget target="error" />
            {ready && <GambaUi.PortalTarget target="screen" />}
          </ScreenViewport>
        </Screen>
        <Controls>
          <div>
            <GambaUi.PortalTarget target="controls" />
            <GambaUi.PortalTarget target="play" />
          </div>
        </Controls>
      </Container>
    </>
  )
}

export default function Game() {
  const { gameId } = useParams()
  const game = GAMES.find((x) => x.id === gameId)
  const realBalance = useUserStore((state) => state.realBalance)
  const setGameMode = useUserStore((state) => state.setGameMode)
  const gameResult = useUserStore((state) => (game?.id ? state.gameResults[game.id] : undefined))

  React.useEffect(() => {
    if (game) {
      setGameMode('real', game.id)
    }
  }, [game?.id, setGameMode])

  if (!game) {
    return <h1>Game not found</h1>
  }

  return (
    <>
      <TopMeta>
        <Badge>Balance: {realBalance} ⭐</Badge>
        {gameResult && (
          <ResultBadge $win={gameResult.net > 0} $loss={gameResult.net < 0}>
            Last result: {gameResult.net > 0 ? '+' : ''}{gameResult.net} ⭐{gameResult.label ? ` • ${gameResult.label}` : ''}
          </ResultBadge>
        )}
      </TopMeta>

      <GambaUi.Game game={game} errorFallback={<CustomError />}>
        <CustomRenderer />
      </GambaUi.Game>
    </>
  )
}
