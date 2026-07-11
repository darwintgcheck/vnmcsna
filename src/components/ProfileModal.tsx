import React from 'react'
import styled from 'styled-components'
import { useUserStore } from '../hooks/useUserStore'
import { Modal } from './Modal'
import UserAvatar from './UserAvatar'

const Wrap = styled.div`
  width: min(100%, 460px);
  padding: 28px;
`

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding-top: 10px;
`

const ProfileName = styled.div`
  font-size: 22px;
  font-weight: 800;
  text-align: center;
`

const ProfileSub = styled.div`
  color: #bfc3d4;
  font-size: 14px;
  text-align: center;
`

const Grid = styled.div`
  margin-top: 24px;
  display: grid;
  gap: 12px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
`

const Label = styled.span`
  color: #bfc3d4;
  font-size: 13px;
`

const Value = styled.span`
  font-weight: 700;
  text-align: right;
  word-break: break-word;
`

const Footer = styled.div`
  margin-top: 20px;
  display: grid;
  gap: 10px;
`

const Button = styled.button<{ $danger?: boolean }>`
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 14px 16px;
  cursor: pointer;
  font-weight: 800;
  background: ${({ $danger }) => ($danger ? 'linear-gradient(90deg, #ff7a7a, #ffb86b)' : 'linear-gradient(90deg, #8c62ff, #5ee7ff)')};
  color: ${({ $danger }) => ($danger ? '#240c0c' : '#05050b')};
`

function renderText(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const user = useUserStore((state) => state.currentUser)
  const realBalance = useUserStore((state) => state.realBalance)
  const logout = useUserStore((state) => state.logout)

  if (!user) return null

  return (
    <Modal onClose={onClose}>
      <Wrap>
        <ProfileHeader>
          <UserAvatar name={user.displayName} photoUrl={user.photoUrl} size={84} />
          <div>
            <ProfileName>{user.displayName || user.firstName}</ProfileName>
            <ProfileSub>{user.username ? `@${user.username}` : 'Telegram istifadəçisi'}</ProfileSub>
          </div>
        </ProfileHeader>

        <Grid>
          <Row>
            <Label>Telegram ID</Label>
            <Value>{user.telegramId}</Value>
          </Row>
          <Row>
            <Label>Ad</Label>
            <Value>{renderText(user.firstName)}</Value>
          </Row>
          <Row>
            <Label>Soyad</Label>
            <Value>{renderText(user.lastName)}</Value>
          </Row>
          <Row>
            <Label>Profil şəkli</Label>
            <Value>{user.photoUrl ? 'Mövcuddur' : 'Yoxdur'}</Value>
          </Row>
          <Row>
            <Label>Real balans</Label>
            <Value>{realBalance} ⭐</Value>
          </Row>
          <Row>
            <Label>Ümumi deposit</Label>
            <Value>{Number(user.totalDeposited || 0).toFixed(2)} ⭐</Value>
          </Row>
          <Row>
            <Label>Ümumi çıxarış</Label>
            <Value>{Number(user.totalWithdrawn || 0).toFixed(2)} ⭐</Value>
          </Row>
        </Grid>

        <Footer>
          <Button onClick={onClose}>Bağla</Button>
          <Button
            $danger
            onClick={() => {
              logout()
              onClose()
            }}
          >
            Çıxış
          </Button>
        </Footer>
      </Wrap>
    </Modal>
  )
}
