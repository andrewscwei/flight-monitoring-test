import Footer from '@/components/Footer';
import Settings, { defaultOptions, SettingsOptions } from '@/components/Settings';
import Viewport from '@/components/Viewport';
import { AppState } from '@/store';
import theme from '@/styles/theme';
import { styleByTransitionState } from '@/styles/utils';
import anime from 'animejs';
import debug from 'debug';
import _ from 'lodash';
import promptu from 'promptu';
import React, { createRef, Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Transition } from 'react-transition-group';
import { TransitionStatus } from 'react-transition-group/Transition';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';

const log = debug('app');

interface StateProps {
  t: TranslationData;
}

interface DispatchProps {

}

export interface Props extends StateProps, DispatchProps {

}

export interface State {
  areSettingsVisible: boolean;
  currAnswer: number;
  index: number;
  isGameOver: boolean;
  numChoices: number;
  difficulty: number;
  correct: number;
  settings: SettingsOptions;
}

class Home extends PureComponent<Props, State> {
  state = {
    areSettingsVisible: false,
    currAnswer: 0,
    index: -1,
    isGameOver: false,
    numChoices: 5,
    difficulty: 8,
    settings: defaultOptions,
    correct: 0,
  };

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
    timer: createRef<HTMLDivElement>(),
  };

  interval?: number;

  componentDidMount() {
    if (!this.state.areSettingsVisible) this.next();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  openSettings = () => {
    this.setState({ areSettingsVisible: true });

    if (this.state.index < this.state.settings['num-questions']) {
      this.reset();
    }
  }

  closeSettings = () => {
    this.setState({ areSettingsVisible: false });
    this.retry();
  }

  updateSettings = (options: SettingsOptions) => {
    log(`Settings changed: ${JSON.stringify(options, undefined, 0)}`);

    this.setState({
      settings: {
        ...this.state.settings,
        ...options,
      },
    });
  }

  clearTimer = () => {
    const timerRef = this.nodeRefs.timer.current;

    if (!timerRef) return;

    if (this.interval) {
      anime.remove(timerRef);
      window.clearInterval(this.interval);
    }
  }

  startTimer = () => {
    this.clearTimer();

    const timerRef = this.nodeRefs.timer.current;

    if (!timerRef) return;

    const t = this.state.settings['timer'] * 1000;

    this.interval = window.setInterval(() => this.handleWrongAnswer(), t);

    anime({
      targets: this.nodeRefs.timer.current,
      scaleX: [1, 0],
      translateZ: 0,
      easing: 'linear',
      duration: t,
    });
  }

  reset = () => {
    this.clearTimer();

    this.setState({
      currAnswer: 0,
      index: -1,
    });
  }

  retry = () => {
    this.setState({
      isGameOver: false,
    });

    this.reset();
    this.next();
  }

  next = () => {
    this.clearTimer();

    if ((this.state.index + 1) < this.state.settings['num-questions']) {
      log('Next question');

      this.startTimer();

      this.setState({
        currAnswer: this.generateAnswer(),
        index: this.state.index + 1,
      });
    }
    else {
      log('Game over');

      this.reset();

      this.setState({
        isGameOver: true,
      });
    }
  }

  handleCorrectAnswer = () => {
    log('Bingo!');

    anime({
      targets: document.body,
      backgroundColor: [theme.correctBackbroundColor, theme.backgroundColor],
      duration: 1000,
      easing: 'easeOutCubic',
    });

    this.setState({
      correct: this.state.correct + 1,
    });

    this.increaseDifficulty();
    this.next();
  }

  handleWrongAnswer = () => {
    log('Wrong :(');

    anime({
      targets: document.body,
      backgroundColor: [theme.incorrectBackgroundColor, theme.backgroundColor],
      duration: 1000,
      easing: 'easeOutCubic',
    });

    this.decreaseDifficulty();
    this.next();
  }

  increaseDifficulty = () => {
    this.setState({
      difficulty: this.state.difficulty + 1,
    });
  }

  decreaseDifficulty = () => {
    this.setState({
      difficulty: this.state.difficulty - 1,
    });
  }

  generateAnswer = (): number => {
    const d = this.state.difficulty;
    const t = _.random(d - 5, d + 5, false);
    const [min, max] = this.state.settings['aircraft-count'];

    return _.clamp(t, min, max);
  }

  generateChoices = (): number[] => {
    const num = this.state.numChoices;
    const idx = _.random(0, num - 1, false);
    const ans = [];

    for (let i = 0; i < num; i++) {
      ans.push(this.state.currAnswer - (idx - i));
    }

    while (ans[0] <= 0) {
      const a: number = ans[ans.length - 1];
      ans.shift();
      ans.push(a + 1);
    }

    return ans;
  }

  chooseAnswer = (answer: number) => {
    log(`Chose answer: ${answer}`);

    if (answer === this.state.currAnswer) {
      this.handleCorrectAnswer();
    }
    else {
      this.handleWrongAnswer();
    }
  }

  renderChoices() {
    const answers = this.generateChoices();

    return (
      <StyledChoices>
        { Array.from(Array(this.state.numChoices).keys()).map((v, i) => (
          <Transition key={`answer-${this.state.index}-${i}`} in={true} appear={true} timeout={i * 80}>
            {(state: TransitionStatus) => (
              <StyledChoice transitionState={state} onClick={() => this.chooseAnswer(answers[i])}>{answers[i]}</StyledChoice>
            )}
          </Transition>
        )) }
      </StyledChoices>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <StyledRoot ref={this.nodeRefs.root}>
        { this.state.isGameOver &&
          <Fragment>
            <StyledGameOver>
              <h1>{t['game-over']}</h1>
              <h2><strong>{this.state.correct}</strong> / {this.state.settings['num-questions']}</h2>
              <button onClick={() => this.retry()}>{t['retry']}</button>
            </StyledGameOver>
          </Fragment>
          ||
          <Fragment>
            <StyledQuestionLabel>{this.state.index > -1 ? `${this.state.index + 1}` : ''}</StyledQuestionLabel>
            <StyledTimer ref={this.nodeRefs.timer}/>
            <StyledViewport
              key={this.state.index}
              count={this.state.currAnswer}
              dotRadius={10}
              radius={200}
              minDuration={1.5}
              maxDuration={1.5}
              minDelay={0.1}
              maxDelay={.5}
            />
            {this.state.index > -1 && this.renderChoices()}
          </Fragment>
        }
        <Footer onSettingsButtonClick={this.openSettings}/>
        <Transition in={this.state.areSettingsVisible} timeout={0}>
          {(state: TransitionStatus) => (
            <StyledSettings
              transitionState={state}
              onSave={this.closeSettings}
              onChange={this.updateSettings}
            />
          )}
        </Transition>
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    t: state.intl.translations,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({

  }, dispatch),
)(Home);

const StyledRoot = styled.div`
  ${promptu.align.tl}
  ${promptu.container.fvcc}
  font-family: ${props => props.theme.font};
  height: 100%;
  width: 100%;
`;

const StyledSettings = styled(Settings)<any>`
  opacity: ${props => styleByTransitionState(props.transitionState, 0, 1, 1, 0)};
  z-index: 100;
  transform: scale(${props => styleByTransitionState(props.transitionState, 1.2, 1, 1, 1.2)});
  transition-property: opacity, transform;
  transition-duration: .2s;
  transition-timing-function: ease-out;
  pointer-events: ${props => styleByTransitionState(props.transitionState, 'none', 'auto', 'auto', 'none')};
`;

const StyledQuestionLabel = styled.span`
  ${promptu.container.fvcc}
  ${promptu.align.tl}
  ${props => props.theme.text(800, 400, undefined, -40)}
  width: 100%;
  height: 100%;
  color: #fff;
  opacity: .05;
`;

const StyledGameOver = styled.div`
  ${promptu.align.tl}
  ${promptu.container.fvcc}
  width: 100%;
  height: 100%;

  h1 {
    ${props => props.theme.title(24)}
    color: #aaa;
    margin-bottom: 2rem;
  }

  h2 {
    ${props => props.theme.text(100)}
    color: #aaa;
    margin-bottom: 4rem;

    strong {
      color: #fff;
    }
  }

  button {
    ${promptu.container.fhcl}
    ${props => props.theme.text(22)}
    width: 15rem;
    height: 4rem;
    padding: 0 1rem;
    color: #000;
    transition: background .2s ease-out;
    text-align: center;
    background: #fff;

    &:hover {
      background: #ccc;
    }
  }
`;

const StyledTimer = styled.div`
  ${promptu.align.ftl}
  height: 5px;
  width: 100%;
  background: #fff;
  transform-origin: center left;
`;

const StyledChoices = styled.div`
  ${promptu.align.bc}
  ${promptu.container.fhcc}
  bottom: 10rem;
`;

const StyledChoice = styled.button<any>`
  ${promptu.container.fhcc}
  ${props => props.theme.text(22, 700)}
  padding: .1rem 0 0 .1rem;
  width: 4rem;
  height: 4rem;
  overflow: hidden;
  border-radius: 4rem;
  background: #000;
  color: #fff;
  transition-property: background, opacity, transform;
  transition-duration: .2s;
  transition-timing-function: ease-out;
  transform: translate3d(0, ${props => styleByTransitionState(props.transitionState, 10, 0, 0, -10)}px, 0);
  opacity: ${props => styleByTransitionState(props.transitionState, 0, 1, 1, 0)};

  &:hover {
    background: #222;
  }

  &:not(:last-child) {
    margin-right: 2rem;
  }
`;

const StyledViewport = styled(Viewport)`
  ${promptu.align.cc}
`;
