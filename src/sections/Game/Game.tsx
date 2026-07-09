import { GambaUi, useSoundStore } from 'gamba-react-ui-v2'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { GAMES } from '../../games'
import { useUserStore } from '../../hooks/useUserStore'
import { GameSlider } from '../Dashboard/Dashboard'
import { Container, Controls, IconButton, MetaControls, Screen, Splash } from './Game.styles'

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

  return (
    <>
      {game ? (
        <GambaUi.Game game={game} errorFallback={<CustomError />}>
          <CustomRenderer />
        </GambaUi.Game>
      ) : (
        <h1>Oyun tapılmadı</h1>
      )}
      <GameSlider />
    </>
  )
}
