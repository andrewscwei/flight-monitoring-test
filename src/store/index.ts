import intl, { IntlState } from '@/store/intl';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';

const composeEnhancers = process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export interface AppState {
  intl: IntlState;
}

export const reducer = combineReducers({ intl });

export default createStore(reducer, window.__INITIAL_STATE__ || {}, composeEnhancers(applyMiddleware(thunk)));
