import { css } from 'styled-components';

export default {
  backgroundColor: '#0f0e13',
  correctBackbroundColor: '#1ace09',
  incorrectBackgroundColor: '#940f0f',
  greenColor: '#1ace09',
  purpleColor: '#3e0098',
  title: (sizeInPixels = 16, weight = 400, lineHeight = sizeInPixels * 1.4, letterSpacing = sizeInPixels * .1) => css`
    font-family: Roboto;
    font-size: ${(sizeInPixels || 16) / 10}rem;
    font-weight: ${weight || 400};
    line-height: ${lineHeight / 10}rem;
    letter-spacing: ${letterSpacing / 10}rem;
    text-transform: uppercase;
  `,
  text: (sizeInPixels = 16, weight = 400, lineHeight = sizeInPixels * 1.4, letterSpacing = sizeInPixels * .01) => css`
    font-family: Roboto;
    font-size: ${(sizeInPixels || 16) / 10}rem;
    font-weight: ${weight || 400};
    line-height: ${lineHeight / 10}rem;
    letter-spacing: ${letterSpacing / 10}rem;
  `,
};
