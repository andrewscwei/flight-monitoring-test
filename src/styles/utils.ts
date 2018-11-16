import { TransitionStatus } from 'react-transition-group/Transition';
import { Styles } from 'styled-components';

export function styleByTransitionState(state: TransitionStatus, enteringStyle: number | string, enteredStyle: number | string, exitingStyle: number | string, exitedStyle: number | string) {
  switch (state) {
  case 'entering':
    return enteringStyle;
  case 'entered':
    return enteredStyle;
  case 'exiting':
    return exitingStyle;
  case 'exited':
    return exitedStyle;
  }
}
