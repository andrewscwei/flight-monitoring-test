import { AppState } from '@/store';
import promptu from 'promptu';
import React, { PureComponent } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Route, RouteComponentProps } from 'react-router-dom';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';

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

class NotFound extends PureComponent<Props, State> {
  render() {
    const { t } = this.props;

    return (
      <Route render={(route: RouteComponentProps<any>) => {
        if (route.staticContext) {
          route.staticContext.statusCode = 404;
        }

        return (
          <StyledRoot>
            <Helmet>
              <title>{t['not-found-title']}</title>
            </Helmet>
            <h1>{t['not-found']}</h1>
          </StyledRoot>
        );
      }}/>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    t: state.intl.translations,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({

  }, dispatch),
)(NotFound);

const StyledRoot = styled.div`
  ${promptu.align.tl}
  ${promptu.container.fvcc}
  height: 100%;
  padding: 10% 5%;
  width: 100%;

  h1 {
    color: #fff;
    font-size: 2.4em;
    font-weight: 700;
    letter-spacing: 3px;
    margin: 0;
    max-width: 550px;
    text-align: center;
    text-transform: uppercase;
  }
`;
