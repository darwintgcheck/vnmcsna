import React from 'react'
import styled from 'styled-components'

const AvatarWrap = styled.div<{ $size: number }>`
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #8c62ff, #5ee7ff);
  color: #05050b;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'TG'
}

export default function UserAvatar({
  name,
  photoUrl,
  size = 42,
}: {
  name?: string
  photoUrl?: string
  size?: number
}) {
  return (
    <AvatarWrap $size={size} aria-label={name || 'Telegram user'} title={name || 'Telegram user'}>
      {photoUrl ? <img alt={name || 'Telegram user'} src={photoUrl} /> : <span>{getInitials(name || 'Telegram User')}</span>}
    </AvatarWrap>
  )
}
