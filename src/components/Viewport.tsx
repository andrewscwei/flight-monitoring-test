import anime from 'animejs';
import debug from 'debug';
import _ from 'lodash';
import promptu from 'promptu';
import React, { createRef, PureComponent } from 'react';
import styled from 'styled-components';
import { defaultOptions } from './Settings';

const log = debug('app:viewport');

export interface Props {
  className?: string;
  count: number;
  radius: number;
  dotRadius: number;
  speed: number;
}

export interface State {

}

class Viewport extends PureComponent<Props, State> {
  nodeRefs = {
    root: createRef(),
  };

  componentDidMount() {
    this.reshuffle();
  }

  componentWillUnmount() {
    this.stopShuffling();
  }

  componentWillUpdate() {
    this.stopShuffling();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.count !== this.props.count) {
      this.reshuffle();
    }
  }

  reshuffle = () => {
    const root = this.nodeRefs.root.current as HTMLElement;

    if (!root) return;

    log('Reshuffling...');

    const dots = root.querySelectorAll('div');
    const n = dots.length;

    for (let i = 0; i < n; i++) {
      this.shuffleDot(dots[i]);
    }
  }

  stopShuffling = () => {
    const root = this.nodeRefs.root.current as HTMLElement;

    if (!root) return;

    log('Stopping shuffling...');

    const dots = root.querySelectorAll('div');
    const n = dots.length;

    for (let i = 0; i < n; i++) {
      anime.remove(dots[i]);
    }
  }

  shuffleDot(dot: HTMLElement, from: [number, number] = this.randomCoordinate()) {
    const to = this.randomCoordinate();

    anime.remove(dot);

    anime({
      targets: dot,
      translateX: [from[0], to[0]],
      translateY: [from[1], to[1]],
      translateZ: 0,
      easing: 'easeOutCubic',
      delay: this.getRandomDelay(),
      duration: this.getRandomDuration(),
      complete: () => {
        this.shuffleDot(dot, to);
      },
    });
  }

  getRandomDelay = (): number => {
    const modifier = (this.props.speed - (defaultOptions['speed'] / 2)) * .02;
    const min = .1 - modifier;
    const max = .5 - modifier;

    return _.random(min, max, true) * 1000;
  }

  getRandomDuration = (): number => {
    const modifier = (this.props.speed - (defaultOptions['speed'] / 2)) * .15;
    const min = 1.3 - modifier;
    const max = 1.7 - modifier;

    return _.random(min, max, true) * 1000;
  }

  randomCoordinate = (): [number, number] => {
    const min = -this.props.radius;
    const max = this.props.radius;
    const modifier = .5;

    return [
      _.random(min * modifier, max * modifier, false),
      _.random(min * modifier, max * modifier, false),
    ];
  }

  render() {
    return (
      <StyledRoot ref={this.nodeRefs.root} className={this.props.className} radius={this.props.radius}>
      { Array.from(Array(this.props.count).keys()).map((v, i) => (
        <StyledDot key={`dot${i}`} radius={this.props.dotRadius}/>
      )) }
      </StyledRoot>
    );
  }
}

export default Viewport;

const StyledRoot = styled.div<any>`
  ${promptu.align.tl}
  ${promptu.container.box}
  font-family: ${props => props.theme.font};
  height: ${props => props.radius * 2}px;
  width: ${props => props.radius * 2}px;
  border-radius: ${props => props.radius * 2}px;
  overflow: hidden;
  transform: translate3d(0, 0, 0);
  background: #fff;
`;

const StyledDot = styled.div<any>`
  width: ${props => props.radius * 2}px;
  height: ${props => props.radius * 2}px;
  background: #000;
  overflow: hidden;
  border-radius: ${props => props.radius * 2}px;
  left: calc(50% - ${props => props.radius}px);
  top: calc(50% - ${props => props.radius}px);
  transform: translate3d(0, 0, 0);
  position: absolute;
`;

const StyledBackground = styled.div`
  ${promptu.align.cc}
  width: 90vh;
  height: 90vh;
  border-radius: 90vh;
  overflow: hidden;
  background: #fff;
`;
