/**
 * @file Client app root.
 */

import { AppState } from '@/store';
import { changeLocale } from '@/store/intl';
import globalStyles from '@/styles/global';
import theme from '@/styles/theme';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Action, bindActionCreators, Dispatch } from 'redux';
import * as styledComponents from 'styled-components';

const { default: styled, __DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_SPOOKY_GHOSTS: sc, createGlobalStyle, ThemeProvider } = styledComponents as any;

interface StateProps {
  locales: ReadonlyArray<string>;
}

interface DispatchProps {
  changeLocale(locale: string): void;
}

interface OwnProps {
  route: RouteComponentProps<any>;
}

export interface Props extends StateProps, DispatchProps, OwnProps {}

export interface State {

}

class App extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.updateLocale();
  }

  componentDidMount() {
    if (window.__PRERENDERING__) {
      const styles = sc.StyleSheet.instance.toHTML();
      document.getElementsByTagName('head')[0].innerHTML += styles;
    }
  }

  componentDidUpdate() {
    this.updateLocale();
  }

  updateLocale = () => {
    const { route, changeLocale, locales } = this.props;
    const locale = route.location.pathname.split('/')[1];

    if (~locales.indexOf(locale)) {
      changeLocale(locale);
    }
    else {
      changeLocale(locales[0]);
    }
  }

  generateRoutes = () => {
    return __ROUTES_CONFIG__.map((route: RouteData, index: number) => {
      const Component = require(`@/containers/${route.component}`).default;
      return <Route exact={route.exact} path={route.path} component={Component} key={index}/>;
    });
  }

  render() {
    const { route } = this.props;

    return (
      <ThemeProvider theme={theme}>
        <StyledRoot>
          <GlobalStyles/>
          <StyledBody>
            <CSSTransition key={route.location.key} timeout={300} classNames='fade'>
              <Switch location={route.location}>{this.generateRoutes()}</Switch>
            </CSSTransition>
          </StyledBody>
        </StyledRoot>
      </ThemeProvider>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    locales: state.intl.locales,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    changeLocale,
  }, dispatch),
)(App);

const GlobalStyles = createGlobalStyle`
  ${globalStyles}
`;

const StyledRoot = styled.div`
  height: 100%;
  position: absolute;
  width: 100%;
`;

const StyledBody = styled(TransitionGroup)`
  height: 100%;
  position: absolute;
  width: 100%;
`;
