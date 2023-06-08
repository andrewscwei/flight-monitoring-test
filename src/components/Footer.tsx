import promptu from 'promptu'
import React, { ReactNode, SFC } from 'react'
import styled from 'styled-components'

export interface Props {
  children?: ReactNode;
  onSettingsButtonClick: () => void;
}

const Footer: SFC<Props> = ({ onSettingsButtonClick }) => (
  <StyledRoot>
    <nav>
      <button onClick={() => onSettingsButtonClick() } dangerouslySetInnerHTML={{ __html: require('!raw-loader!@/assets/images/icon-settings.svg') }}/>
    </nav>
  </StyledRoot>
);

export default Footer;

const StyledRoot = styled.footer`
  ${promptu.container.fhcl}
  ${promptu.align.fbl}
  padding: 2.4rem;
  width: 100%;
  position: fixed;
  z-index: 10;

  nav {
    ${promptu.container.fhcr}
    flex-grow: 1;
  }

  nav > button {
    background: transparent;
    width: 2rem;
    height: 2rem;
    transition: all .2s ease-out;
    display: block;

    &:not(:last-child) {
      margin-right: 1rem;
    }

    & svg {
      width: 100%;
      height: 100%;
    }

    @media (hover: hover) {
      &:hover {
        opacity: .6;
      }
    }
  }
`;

