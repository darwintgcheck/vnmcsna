import styled from 'styled-components'

export const MainWrapper = styled.div`
  position: relative;
  width: min(1120px, 100%);
  max-width: 100%;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: calc(104px + env(safe-area-inset-top));

  @media (max-width: 720px) {
    padding: 14px;
    gap: 16px;
    margin-top: calc(132px + env(safe-area-inset-top));
  }

  @media (min-width: 900px) {
    padding: 22px;
  }
`

export const TosWrapper = styled.div`
  position: relative;

  &:after {
    content: ' ';
    background: linear-gradient(180deg, transparent, #15151f);
    height: 50px;
    pointer-events: none;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
  }
`

export const TosInner = styled.div`
  max-height: 400px;
  padding: 10px;
  overflow: auto;
  position: relative;
`
