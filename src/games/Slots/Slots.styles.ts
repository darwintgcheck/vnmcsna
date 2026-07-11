import styled from 'styled-components'

export const StyledSlots = styled.div`
  perspective: 100px;
  user-select: none;
  width: 100%;

  & > div {
    display: grid;
    gap: 18px;
    transform: rotateX(3deg) rotateY(0deg);
    padding: 20px;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(14, 16, 26, 0.96), rgba(8, 9, 15, 0.96));
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  @keyframes pulse {
    0%, 30% {
      transform: scale(1);
    }
    10% {
      transform: scale(1.3);
    }
  }

  @keyframes reveal-glow {
    0%, 30% {
      border-color: #2d2d57;
      background: #ffffff00;
    }
    10% {
      border-color: white;
      background: #ffffff33;
    }
  }

  @keyframes shine {
    0%, 30% {
      background: #ffffff00;
    }
    10% {
      background: #ffffff33;
    }
  }

  @keyframes result-flash {
    25%, 75% {
      background-color: #ffec63;
      color: #333;
    }
    50% {
      background-color: #ffec6311;
      color: #ffec63;
    }
  }

  @keyframes result-flash-2 {
    0%, 50% {
      background-color: #ffec6388;
      filter: brightness(2.5) contrast(1.5) saturate(10);
    }
    100% {
      background-color: #ffec6300;
      filter: brightness(1) contrast(1);
    }
  }

  .result {
    width: 100%;
    border-radius: 16px;
    border: 1px solid #ffec63;
    background-color: #ffec6311;
    color: #ffec63;
    font-size: 15px;
    font-weight: 800;
    text-align: center;
    padding: 14px 16px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .result[data-good='true'] {
    animation: result-flash 5s infinite;
  }

  .slots {
    display: flex;
    gap: 14px;
    justify-content: center;
    box-sizing: border-box;
    border-radius: 10px;
    flex-wrap: wrap;
  }

  .slot::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
  }

  .slotImage {
    aspect-ratio: 1 / 1;
    max-width: 100%;
    max-height: 100%;
  }

  @media (max-width: 640px) {
    & > div {
      padding: 16px;
    }

    .slots {
      gap: 10px;
    }
  }
`
