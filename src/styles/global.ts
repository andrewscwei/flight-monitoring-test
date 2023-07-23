import theme from '@/styles/theme';
import promptu from 'promptu';
import { css } from 'styled-components';

export default css`
  ${promptu.normalize()} /* stylelint-disable-line max-empty-lines */

  html {
    background: ${theme.backgroundColor};
    height: 100%;
    height: calc(100% + env(safe-area-inset-top));
    width: 100%;
  }

  body {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
`;
