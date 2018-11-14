import theme from '@/styles/theme';
import promptu from 'promptu';
import { css } from 'styled-components';

export default css`
  ${promptu.normalize()} /* stylelint-disable-line max-empty-lines */

  html,
  body {
    background: ${theme.backgroundColor};
    font-family: 'Roboto', sans-serif;
    height: 100%;
    width: 100%;
  }
`;
