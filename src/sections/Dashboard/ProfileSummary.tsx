import styled from 'styled-components'
import UserAvatar from '../../components/UserAvatar'
import { useUserStore } from '../../hooks/useUserStore'

const Card = styled.section`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: center;
  padding: 20px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(21, 21, 32, 0.96), rgba(10, 10, 16, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.08);
`

const Meta = styled.div`
  display: grid;
  gap: 8px;
`

const Name = styled.div`
  font-size: 20px;
  font-weight: 800;
`

const Hint = styled.div`
  color: #bfc3d4;
  font-size: 14px;
`

const Rows = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 4px;
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const Label = styled.span`
  color: #98a0b8;
  font-size: 13px;
`

const Value = styled.span`
  font-size: 14px;
  font-weight: 700;
`

export default function ProfileSummary() {
  const user = useUserStore((state) => state.currentUser)

  if (!user) return null

  return (
    <Card>
      <UserAvatar name={user.displayName} photoUrl={user.photoUrl} size={72} />
      <Meta>
        <div>
          <Hint>Profil bölməsi</Hint>
          <Name>{user.displayName || user.firstName}</Name>
          <Hint>{user.username ? `@${user.username}` : 'Telegram istifadəçisi'}</Hint>
        </div>

        <Rows>
          <Row>
            <Label>Telegram ID</Label>
            <Value>{user.telegramId}</Value>
          </Row>
          <Row>
            <Label>Ad</Label>
            <Value>{user.firstName || '—'}</Value>
          </Row>
          <Row>
            <Label>Soyad</Label>
            <Value>{user.lastName || '—'}</Value>
          </Row>
        </Rows>
      </Meta>
    </Card>
  )
}
