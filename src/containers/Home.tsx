import Viewport from '@/components/Viewport';
import { AppState } from '@/store';
import theme from '@/styles/theme';
import anime from 'animejs';
import debug from 'debug';
import _ from 'lodash';
import promptu from 'promptu';
import React, { createRef, Fragment, PureComponent } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';

const log = debug('app');

interface StateProps {
  t: TranslationData;
}

interface DispatchProps {

}

interface OwnProps {

}

export interface Props extends StateProps, DispatchProps, OwnProps {}

export interface State {

}

class Home extends PureComponent<Props, State> {
  state = {
    answer: 10,
    index: 0,
    totalQuestions: 10,
    maxChoices: 5,
    currModifier: 10,
    minModifier: 4,
    maxModifier: 20,
    timer: 10 * 1000,
    correct: 0,
  };

  nodeRefs = {
    root: createRef(),
    timer: createRef(),
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

  next = () => {
    log('next');

    const timerRef = this.nodeRefs.timer.current;

    if (this.interval) {
      anime.remove(timerRef);
      clearInterval(this.interval);
    }

    if (this.state.index > this.state.totalQuestions) return;

    this.interval = setInterval(() => this.wrong(), this.state.timer);

    anime({
      targets: this.nodeRefs.timer.current,
      scaleX: [1, 0],
      easing: 'linear',
      duration: this.state.timer,
    });

    this.setState({
      answer: this.generateAnswer(),
      index: this.state.index + 1,
    });
  }

  correct = () => {
    log('Bingo!');

    anime({
      targets: document.body,
      backgroundColor: ['#0f941c', theme.backgroundColor],
      duration: 1000,
      easing: 'easeOutCubic',
    });

    this.setState({
      currModifier: _.clamp(this.state.currModifier + _.random(1, 3), this.state.minModifier, this.state.maxModifier),
      correct: this.state.correct + 1,
    });

    this.next();
  }

  wrong = () => {
    log('Wrong answer received');

    anime({
      targets: document.body,
      backgroundColor: ['#940f0f', theme.backgroundColor],
      duration: 1000,
      easing: 'easeOutCubic',
    });

    this.setState({
      currModifier: _.clamp(this.state.currModifier - _.random(1, 3), this.state.minModifier, this.state.maxModifier),
    });

    this.next();
  }

  generateAnswer = (): number => {
    return _.random(this.state.minModifier, _.random(this.state.currModifier - _.random(1, 3), this.state.currModifier + _.random(1, 3)), false);
  }

  generateAnswers = (): number[] => {
    const d = 5;
    const r = _.random(0, d - 1, false);
    const o = [];

    for (let i = 0; i <= d; i++) {
      o.push(this.state.answer - (r - i));
    }

    return o;
  }

  selectAnswer = (answer: number) => {
    log(`Selected answer ${answer}`);

    if (answer === this.state.answer) {
      this.correct();
    }
    else {
      this.wrong();
    }
  }

  renderAnswers() {
    const answers = this.generateAnswers();

    return (
      <StyledAnswers>
        { Array.from(Array(this.state.maxChoices).keys()).map((v, i) => (
          <button
            key={`answer${i}`}
            onClick={() => this.selectAnswer(answers[i])}
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
      <StyledRoot ref={this.nodeRefs.root as any}>
        <Helmet>
          <title>{t['home']}</title>
        </Helmet>
        { this.state.index <= this.state.totalQuestions &&
          <Fragment>
            <StyledTimer ref={this.nodeRefs.timer as any}/>
            <StyledViewport
              key={this.state.index}
              count={this.state.answer}
              dotRadius={10}
              radius={200}
              minDuration={1.5}
              maxDuration={1.5}
              minDelay={0.1}
              maxDelay={.5}
            />
            {this.renderAnswers()}
          </Fragment>
          ||
          <Fragment>
            <StyledGameOver>
              <h1>{t['game-over']}</h1>
              <h2>{this.state.correct}</h2>
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
  height: 2px;
  width: 100%;
  background: #fff;
  transform-origin: center left;
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
