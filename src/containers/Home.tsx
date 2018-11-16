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

    if (!this.state.isGameOver) {
      this.reset();
    }
  }

  closeSettings = () => {
    this.setState({ areSettingsVisible: false });

    if (!this.state.isGameOver) {
      this.next();
    }
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

  reset = (isGameOver: boolean = false) => {
    this.clearTimer();

    this.setState({
      isGameOver,
      currAnswer: 0,
      index: -1,
    });
  }

  next = () => {
    if ((this.state.index + 1) < this.state.settings['num-questions']) {
      log('Next question');

      this.startTimer();

      this.setState({
        isGameOver: false,
        currAnswer: this.generateAnswer(),
        index: this.state.index + 1,
      });
    }
    else {
      log('Game over');

      this.reset(true);
    }
  }

  handleCorrectAnswer = () => {
    log('Bingo!');

    if (this.state.settings['answer-feedback'] === 'yes') {
      anime.remove(document.body);

      anime({
        targets: document.body,
        backgroundColor: [theme.correctBackbroundColor, theme.backgroundColor],
        duration: 1000,
        easing: 'easeOutCubic',
      });
    }

    this.setState({
      correct: this.state.correct + 1,
    });

    this.increaseDifficulty();
    this.next();
  }

  handleWrongAnswer = () => {
    log('Wrong :(');

    if (this.state.settings['answer-feedback'] === 'yes') {
      anime.remove(document.body);

      anime({
        targets: document.body,
        backgroundColor: [theme.incorrectBackgroundColor, theme.backgroundColor],
        duration: 1000,
        easing: 'easeOutCubic',
      });
    }

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
    const num = this.state.settings['num-choices'];
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
        { Array.from(Array(this.state.settings['num-choices']).keys()).map((v, i) => (
          <Transition key={`answer-${this.state.index}-${i}`} in={true} appear={true} timeout={i * 50}>
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
        <StyledTimer ref={this.nodeRefs.timer} isEnabled={!this.state.isGameOver}/>
        { this.state.isGameOver &&
          <Fragment>
            <StyledGameOver>
              <h1>{t['game-over']}</h1>
              <h2><strong>{this.state.correct}</strong> / {this.state.settings['num-questions']}</h2>
              <button onClick={() => this.next()}>{t['retry']}</button>
            </StyledGameOver>
          </Fragment>
          ||
          <Fragment>
            <StyledQuestionLabel>{this.state.index > -1 ? `${this.state.index + 1}` : ''}</StyledQuestionLabel>
            <StyledViewport
              key={this.state.index}
              count={this.state.currAnswer}
              dotRadius={10}
              radius={200}
              speed={this.state.settings['speed']}
            />
            {this.state.index > -1 && this.renderChoices()}
          </Fragment>
        }
        <Footer onSettingsButtonClick={this.openSettings}/>
        <Transition in={this.state.areSettingsVisible} timeout={0}>
          {(state: TransitionStatus) => (
            <Fragment>
              <StyledOverlay
                transitionState={state}
              />
              <StyledSettings
                transitionState={state}
                onSave={this.closeSettings}
                onChange={this.updateSettings}
              />
            </Fragment>
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
  perspective: 80rem;
`;

const StyledOverlay = styled.div<any>`
  ${promptu.align.tl}
  width: 100%;
  height: 100%;
  opacity: ${props => styleByTransitionState(props.transitionState, 0, 1, 1, 0)};
  background: rgba(0, 0, 0, .9);
  transition: opacity .2s ease-out;
  pointer-events: ${props => styleByTransitionState(props.transitionState, 'none', 'auto', 'auto', 'none')};
  z-index: 100;
`;

const StyledSettings = styled(Settings)<any>`
  opacity: ${props => styleByTransitionState(props.transitionState, 0, 1, 1, 0)};
  z-index: 100;
  transform: rotateY(${props => styleByTransitionState(props.transitionState, 24, 10, 10, 24)}deg) translate3d(0, ${props => styleByTransitionState(props.transitionState, 30, 0, 0, 30)}px, 0);
  transform-origin: center;
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
  opacity: .02;
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
    color: #fff;
    transition: background .2s ease-out;
    text-align: center;
    background: ${props => props.theme.purpleColor};

    &:hover {
      background: ${props => props.theme.greenColor};
    }
  }
`;

const StyledTimer = styled.div<any>`
  ${promptu.align.ftl}
  height: 5px;
  width: 100%;
  background: #fff;
  transform-origin: center left;
  visibility: ${props => props.isEnabled ? 'visible' : 'hidden'};
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
  width: 5rem;
  height: 5rem;
  overflow: hidden;
  border-radius: 4rem;
  background: ${props => props.theme.purpleColor};
  color: #fff;
  transition-property: background, opacity, transform;
  transition-duration: .2s;
  transition-timing-function: ease-out;
  transform: translate3d(0, ${props => styleByTransitionState(props.transitionState, 10, 0, 0, -10)}px, 0);
  opacity: ${props => styleByTransitionState(props.transitionState, 0, 1, 1, 0)};

  &:hover {
    background: ${props => props.theme.greenColor};
  }

  &:not(:last-child) {
    margin-right: 2rem;
  }
`;

const StyledViewport = styled(Viewport)`
  ${promptu.align.cc}
`;
