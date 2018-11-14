import promptu from 'promptu';
import React, { ReactNode, SFC } from 'react';
import styled from 'styled-components';

export interface Props {
  children?: ReactNode;
  onSettingsButtonClick: () => void;
}

const Footer: SFC<Props> = ({ onSettingsButtonClick }) => (
  <StyledRoot>
    <StyledMonogram href='https://www.andr.mu' dangerouslySetInnerHTML={{ __html: require('!raw-loader!@/assets/images/mu.svg') }}/>
    <nav>
      <button onClick={() => onSettingsButtonClick() } dangerouslySetInnerHTML={{ __html: require('!raw-loader!@/assets/images/settings-icon.svg') }}/>
      <a dangerouslySetInnerHTML={{ __html: require('!raw-loader!@/assets/images/github-icon.svg') }} href='https://github.com/andrewscwei/flight-monitoring-test'/>
    </nav>
  </StyledRoot>
);

export default Footer;

const StyledRoot = styled.footer`
  ${promptu.container.fhcl}
  ${promptu.align.fbl}
  height: 50px;
  padding: 0 5%;
  width: 100%;
  position: fixed;
  z-index: 10;

  nav {
    ${promptu.container.fhcr}
    flex-grow: 1;
  }

  nav > a,
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

    &:hover {
      opacity: .6;
    }
  }
`;

const StyledMonogram = styled.a`
  ${promptu.container.box}
  height: 2rem;
  transition: opacity .2s ease-out;

  & svg {
    width: auto;
    height: 100%;
  }

  &:hover {
    opacity: .6;
  }
`;
