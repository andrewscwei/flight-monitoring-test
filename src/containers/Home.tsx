import { NumberRange } from '@/components/HRangeSlider';
import Viewport from '@/components/Viewport';
import { AppState } from '@/store';
import theme from '@/styles/theme';
import anime from 'animejs';
import debug from 'debug';
import _ from 'lodash';
import promptu from 'promptu';
import React, { createRef, Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
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
  totalQuestions: number;
  numChoices: number;
  difficulty: number;
  aircraftCount: NumberRange;
  timer: number;
  correct: number;
}

class Home extends PureComponent<Props, State> {
  state = {
    areSettingsVisible: false,
    currAnswer: 10,
    index: -1,
    totalQuestions: 15,
    numChoices: 5,
    difficulty: 8,
    aircraftCount: [4, 20] as NumberRange,
    timer: 10 * 1000,
    correct: 0,
  };

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
    timer: createRef<HTMLDivElement>(),
  };

  interval?: NodeJS.Timeout;

  componentDidMount() {
    this.next();
  }

  componentWillUnmount() {
    const timerRef = this.nodeRefs.timer.current;

    if (this.interval) {
      anime.remove(timerRef);
      clearInterval(this.interval);
    }
  }

  openSettings = () => {
    this.setState({ areSettingsVisible: true });
  }

  closeSettings = () => {
    this.setState({ areSettingsVisible: false });
  }

  updateSettings = () => {

  }

  clearTimer = () => {
    const timerRef = this.nodeRefs.timer.current;

    if (!timerRef) return;

    if (this.interval) {
      anime.remove(timerRef);
      clearInterval(this.interval);
    }
  }

  startTimer = () => {
    this.clearTimer();

    const timerRef = this.nodeRefs.timer.current;

    if (!timerRef) return;

    this.interval = setInterval(() => this.handleWrongAnswer(), this.state.timer);

    anime({
      targets: this.nodeRefs.timer.current,
      scaleX: [1, 0],
      easing: 'linear',
      duration: this.state.timer,
    });
  }

  next = () => {
    log('Next question');

    this.clearTimer();

    if ((this.state.index + 1) < this.state.totalQuestions) {
      this.startTimer();
    }

    this.setState({
      currAnswer: this.generateAnswer(),
      index: this.state.index + 1,
    });
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
    const [min, max] = this.state.aircraftCount;

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
      <StyledAnswers>
        { Array.from(Array(this.state.numChoices).keys()).map((v, i) => (
          <button
            key={`answer${i}`}
            onClick={() => this.chooseAnswer(answers[i])}
          >
            {answers[i]}
          </button>
        )) }
      </StyledAnswers>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <StyledRoot ref={this.nodeRefs.root}>
        { this.state.index < this.state.totalQuestions &&
          <Fragment>
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
            {this.renderChoices()}
          </Fragment>
          ||
          <Fragment>
            <StyledGameOver>
              <h1>{t['game-over']}</h1>
              <h2>{this.state.correct} / {this.state.totalQuestions}</h2>
            </StyledGameOver>
          </Fragment>
        }
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

const StyledGameOver = styled.div`
  ${promptu.container.fvcc}

  h1 {
    color: #999;
    font-size: 3rem;
    text-transform: uppercase;
    font-weight: 800;
    margin-bottom: 2rem;
  }

  h2 {
    font-size: 8rem;
    color: #fff;
  }
`;

const StyledTimer = styled.div`
  ${promptu.align.ftl}
  height: 5px;
  width: 100%;
  background: #fff;
  transform-origin: center left;
  transform: translate3d(0, 0, 0);
`;

const StyledAnswers = styled.div`
  ${promptu.align.bc}
  ${promptu.container.fhcc}
  bottom: 10rem;

  button {
    ${promptu.container.fhcc}
    width: 8rem;
    height: 4rem;
    background: #fff;
    color: #000;
    transition: background .2s ease-out;

    &:hover {
      background: #aaa;
    }

    &:not(:last-child) {
      margin-right: 2rem;
    }
  }
`;

const StyledViewport = styled(Viewport)`
  ${promptu.align.cc}
`;
