import React from 'react'
import styled from 'styled-components'
import { useUserStore } from '../hooks/useUserStore'

const StyledToken = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 16px;
  color: #fff;
`

export default function TokenSelect() {
  const balance = useUserStore((state) => state.balance)
  return <StyledToken>{balance} ⭐</StyledToken>
}
