import anime from 'animejs';
import debug from 'debug';
import _ from 'lodash';
import promptu from 'promptu';
import React, { createRef, PureComponent } from 'react';
import styled from 'styled-components';

const log = debug('app:viewport');

export interface Props {
  className?: string;
  count: number;
  radius: number;
  dotRadius: number;
  minDuration: number;
  maxDuration: number;
  minDelay: number;
  maxDelay: number;
}

export interface State {

}

class Viewport extends PureComponent<Props, State> {
  nodeRefs = {
    root: createRef(),
  };

  componentDidMount() {
    this.componentDidUpdate({}, {});
  }

  componentWillUnmount() {
    const root = this.nodeRefs.root.current as HTMLElement;

    if (!root) return;

    const dots = root.querySelectorAll('div');
    const n = dots.length;

    for (let i = 0; i < n; i++) {
      anime.remove(dots[i]);
    }
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (prevProps.count !== this.props.count) {
      this.reshuffle();
    }
  }

  reshuffle = () => {
    const root = this.nodeRefs.root.current as HTMLElement;

    if (!root) return;

    const dots = root.querySelectorAll('div');
    const n = dots.length;

    for (let i = 0; i < n; i++) {
      this.shuffleDot(dots[i]);
    }
  }

  shuffleDot(dot: HTMLElement, from: [number, number] = this.randomCoordinate()) {
    const to = this.randomCoordinate();

    anime({
      targets: dot,
      translateX: [from[0], to[0]],
      translateY: [from[1], to[1]],
      easing: 'easeOutCubic',
      delay: _.random(this.props.minDelay, this.props.maxDelay, true) * 1000,
      duration: _.random(this.props.minDuration, this.props.maxDuration, true) * 1000,
      complete: () => {
        this.shuffleDot(dot, to);
      },
    });
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
