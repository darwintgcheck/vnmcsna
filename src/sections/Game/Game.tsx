import { GambaUi, useSoundStore } from 'gamba-react-ui-v2'
import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { GAMES } from '../../games'
import { useUserStore } from '../../hooks/useUserStore'
import { GameSlider } from '../Dashboard/Dashboard'
import { Container, Controls, IconButton, MetaControls, Screen, Splash } from './Game.styles'

const ModeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
`

const ModeGrid = styled.div`
  width: min(100%, 460px);
  padding: 12px 24px 24px;
  display: grid;
  gap: 12px;
`

const ModeButton = styled.button<{ $accent?: boolean }>`
  width: 100%;
  border: none;
  border-radius: 18px;
  padding: 18px;
  cursor: pointer;
  text-align: left;
  background: ${({ $accent }) => ($accent ? 'linear-gradient(135deg, #8c62ff, #5ee7ff)' : 'rgba(255, 255, 255, 0.06)')};
  color: ${({ $accent }) => ($accent ? '#05050b' : '#fff')};
`

const ModeTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 6px;
`

const ModeText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.9;
`

function CustomError() {
  return (
    <GambaUi.Portal target="error">
      <GambaUi.Responsive>
        <h1>⚠️ Xəta</h1>
        <p>Oyun yüklənmədi.</p>
      </GambaUi.Responsive>
    </GambaUi.Portal>
  )
}

function CustomRenderer() {
  const { game } = GambaUi.useGame()
  const [info, setInfo] = React.useState(false)
  const soundStore = useSoundStore()
  const firstTimePlaying = useUserStore((state) => !state.currentUser || !state.currentUser._id ? false : !state.currentUser._id.includes(game.id))
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 300)
    const infoTimeout = setTimeout(() => setInfo(firstTimePlaying), 500)
    return () => {
      clearTimeout(timeout)
      clearTimeout(infoTimeout)
    }
  }, [firstTimePlaying])

  return (
    <>
      {info && (
        <Modal onClose={() => setInfo(false)}>
          <h1>
            <img height="100px" title={game.meta.name} src={game.meta.image} />
          </h1>
          <p>{game.meta.description}</p>
          <button style={{ marginTop: 16 }} onClick={() => setInfo(false)}>
            Oyna
          </button>
        </Modal>
      )}
      <Container>
        <Screen>
          <Splash>
            <img height="150px" src={game.meta.image} />
          </Splash>
          <GambaUi.PortalTarget target="error" />
          {ready && <GambaUi.PortalTarget target="screen" />}
          <MetaControls>
            <IconButton onClick={() => setInfo(true)}>
              <Icon.Info />
            </IconButton>
            <IconButton onClick={() => soundStore.set(soundStore.volume ? 0 : 0.5)}>
              {soundStore.volume ? <Icon.Volume /> : <Icon.VolumeMuted />}
            </IconButton>
          </MetaControls>
        </Screen>
        <Controls>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
  const gameMode = useUserStore((state) => state.gameMode)
  const realBalance = useUserStore((state) => state.realBalance)
  const setGameMode = useUserStore((state) => state.setGameMode)
  const [selectionOpen, setSelectionOpen] = React.useState(true)

  React.useEffect(() => {
    if (gameId) {
      setSelectionOpen(true)
    }
  }, [gameId])

  if (!game) {
    return <h1>Oyun tapılmadı</h1>
  }

  return (
    <>
      {selectionOpen && (
        <Modal>
          <h1>{game.meta.name} üçün balans seçimi</h1>
          <p>Hər oyuna daxil olduqda Demo və ya Real balans rejimini seçin.</p>
          <ModeGrid>
            <ModeButton
              $accent
              onClick={() => {
                setGameMode('real', game.id)
                setSelectionOpen(false)
              }}
            >
              <ModeTitle>Real balans</ModeTitle>
              <ModeText>Hazırkı hesab balansı ilə oynayın: {realBalance} ⭐</ModeText>
            </ModeButton>
            <ModeButton
              onClick={() => {
                setGameMode('demo', game.id)
                setSelectionOpen(false)
              }}
            >
              <ModeTitle>Demo balans</ModeTitle>
              <ModeText>Bu oyun üçün 1000 ⭐ demo balans ilə oynayın.</ModeText>
            </ModeButton>
          </ModeGrid>
        </Modal>
      )}

      <ModeBadge>Rejim: {gameMode === 'demo' ? 'Demo 1000 ⭐' : `Real ${realBalance} ⭐`}</ModeBadge>

      <GambaUi.Game game={game} errorFallback={<CustomError />}>
        <CustomRenderer />
      </GambaUi.Game>

      <GameSlider />
    </>
  )
}
