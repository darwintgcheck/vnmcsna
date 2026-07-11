import styled from 'styled-components'

export const StyledSlots = styled.div`
  perspective: 100px;
  user-select: none;
  width: 100%;

  & > div {
    display: grid;
    gap: 18px;
    transform: rotateX(3deg) rotateY(0deg);
    padding: 18px;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(14, 16, 26, 0.96), rgba(8, 9, 15, 0.96));
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .slots {
    display: flex;
    gap: 14px;
    justify-content: center;
    box-sizing: border-box;
    flex-wrap: wrap;
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
