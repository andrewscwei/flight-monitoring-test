/**
 * @file Entry file.
 */

import store from '@/store'
import React from 'react'
import { render } from 'react-dom'
import { IntlProvider } from 'react-intl'
import { connect, Provider } from 'react-redux'
import App from './App'

const ConnectedIntlProvider = connect((state: any) => ({
  key: state.intl.locale,
  locale: state.intl.locale,
  messages: state.intl.translations,
}))(IntlProvider);

if (process.env.NODE_ENV === 'development') {
  localStorage.debug = 'app*';
}

render(
  <Provider store={store}>
    <ConnectedIntlProvider>
      <App/>
    </ConnectedIntlProvider>
  </Provider>,
  document.getElementById('app'),
);

if (module.hot) {
  module.hot.accept();
}
