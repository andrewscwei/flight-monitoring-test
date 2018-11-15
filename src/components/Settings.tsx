import { AppState } from '@/store';
import React, { ChangeEvent, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import { Styles } from 'styled-components';
import HRangeSlider, { NumberRange } from './HRangeSlider';

export enum SettingsOptionType {
  TIMER = 'timer',
  AIRCRAFT_COUNT = 'aircraft-count',
}

export enum SettingsOptionInputType {
  RANGE = 'range',
  SELECT = 'select',
}

const config: { [key in SettingsOptionType]?: any } = {
  [SettingsOptionType.TIMER]: {
    type: SettingsOptionInputType.SELECT,
    default: 10,
    values: [5, 6, 7, 8, 9, 10],
  },
  [SettingsOptionType.AIRCRAFT_COUNT]: {
    type: SettingsOptionInputType.RANGE,
    min: 0,
    max: 10,
  },
};

interface StateProps {
  t: TranslationData;
  className?: string;
  style?: Styles;
}

interface DispatchProps {

}

export interface Props extends StateProps, DispatchProps {
  onSave: () => void;
  onChange: () => void;
}

export interface State {
  options: {
    [key in SettingsOptionType]?: any;
  };
}

class Settings extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      options: {
        [SettingsOptionType.TIMER]: config[SettingsOptionType.TIMER].default,
      },
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.onChange) this.props.onChange();
  }

  onRangeChangeForOptionType = (type: SettingsOptionType, value: NumberRange) => {
    this.setState({
      options: {
        ...this.state.options,
        [type]: value,
      },
    });
  }

  onSelectionChangeForOptionType = (type: SettingsOptionType, value: any) => {
    this.setState({
      options: {
        ...this.state.options,
        [type]: value,
      },
    });
  }

  getValueForOptionType = (type: SettingsOptionType): any => {
    return this.state.options[type];
  }

  render() {
    const { t, className, style } = this.props;

    return (
      <div className={className} style={style}>
        <main>
          <h1>{t['settings']}</h1>
          { Object.keys(config).map((optionType: string, idx: number) => (
            <div key={`option-${idx}`}>
              <h2>{t[optionType]}</h2>
              { config[optionType as SettingsOptionType].type === SettingsOptionInputType.RANGE &&
                <HRangeSlider
                  onRangeChange={(range: NumberRange) => this.onRangeChangeForOptionType(config[optionType as SettingsOptionType].slug, range)}
                />
              }
              { config[optionType as SettingsOptionType].type === SettingsOptionInputType.SELECT &&
                <select
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => this.onSelectionChangeForOptionType(optionType as SettingsOptionType, Number(event.target.value)) }
                  value={this.state.options[optionType as SettingsOptionType]}
                >
                  { config[optionType as SettingsOptionType].values.map((val: number) => (
                    <option value={val} key={`${optionType}-${val}`}>{val}</option>
                  ))}
                </select>
              }
            </div>
          ))}

          <div>
            <button onClick={() => this.props.onSave()}>{t['done']}</button>
          </div>
        </main>
      </div>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    t: state.intl.translations,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({

  }, dispatch),
)(Settings);
