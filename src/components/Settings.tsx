import { AppState } from '@/store'
import debug from 'debug'
import _ from 'lodash'
import promptu from 'promptu'
import React, { ChangeEvent, PureComponent } from 'react'
import { connect } from 'react-redux'
import { Action, Dispatch, bindActionCreators } from 'redux'
import styled, { Styles } from 'styled-components'
import HRangeSlider, { NumberRange } from './HRangeSlider'

const log = debug('app:settings');
const config: {
  [key: string]: {
    type: SettingsOptionInputType;
    default: any;
    [key: string]: any;
  };
} = __APP_CONFIG__.settings;

export enum SettingsOptionInputType {
  RANGE = 'range',
  SLIDER = 'slider',
  SELECT = 'select',
}

export interface SettingsOptions {
  [key: string]: any;
}

export const defaultOptions: SettingsOptions = _.mapValues(config, (val => val.default));

interface StateProps {
  t: TranslationData;
  className?: string;
  style?: Styles;
}

interface DispatchProps {

}

export interface Props extends StateProps, DispatchProps {
  onSave: () => void;
  onChange: (options: SettingsOptions) => void;
}

export interface State {
  options: SettingsOptions;
}

class Settings extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      options: defaultOptions,
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.onChange) this.props.onChange(this.state.options);
  }

  onSliderChangeForOptionType = (type: string, value: number) => {
    const t = Math.floor(value);

    log(`Slider changed for option type ${type}: ${t}`);

    this.setState({
      options: {
        ...this.state.options,
        [type]: t,
      },
    });
  }

  onRangeChangeForOptionType = (type: string, value: NumberRange) => {
    const t = [Math.floor(value[0]), Math.floor(value[1])];

    log(`Range changed for option type ${type}: ${t}`);

    this.setState({
      options: {
        ...this.state.options,
        [type]: t,
      },
    });
  }

  onSelectionChangeForOptionType = (type: string, value: any) => {
    log(`Selection changed for option type ${type}: ${value}`);

    this.setState({
      options: {
        ...this.state.options,
        [type]: value,
      },
    });
  }

  getValueForOptionType = (type: string): any => {
    return this.state.options[type];
  }

  renderOption = (optionType: string, key: string) => {
    const { t } = this.props;
    const opt = config[optionType];

    return (
      <StyledOption key={key}>
        <h2>{t[optionType]}</h2>
        { opt.type === SettingsOptionInputType.RANGE &&
          <StyledHRangeSlider
            decimalPlaces={0}
            onRangeChange={(range: NumberRange) => this.onRangeChangeForOptionType(optionType, range)}
            knobRadius={5}
            min={opt.min}
            max={opt.max}
            defaultRange={this.state.options[optionType]}
            steps={opt.max - opt.min - 1}
            tintColor='#fff'
            />
          }
        { opt.type === SettingsOptionInputType.SLIDER &&
          <StyledHRangeSlider
            decimalPlaces={0}
            onRangeChange={(range: NumberRange) => this.onSliderChangeForOptionType(optionType, range[1])}
            knobRadius={5}
            min={opt.min}
            max={opt.max}
            isMinAdjustable={false}
            defaultRange={[opt.min, this.state.options[optionType]]}
            steps={opt.max - opt.min - 1}
            tintColor='#fff'
          />
        }
        { opt.type === SettingsOptionInputType.SELECT &&
          <StyledSelect
            onChange={(event: ChangeEvent<HTMLSelectElement>) => this.onSelectionChangeForOptionType(optionType, event.target.value) }
            value={this.state.options[optionType]}
          >
            { opt.items.map((val: any) => (
              <option value={val} key={`${optionType}-${val}`}>{t[val]}</option>
            ))}
          </StyledSelect>
        }
      </StyledOption>
    );
  }

  render() {
    const { t, className, style } = this.props;

    return (
      <StyledRoot className={className} style={style}>
        <div>
          <header>
            <h1>{t['settings']}</h1>
            <button dangerouslySetInnerHTML={{ __html: require('!raw-loader!@/assets/images/icon-exit.svg')}} onClick={() => this.props.onSave()}/>
          </header>
          { Object.keys(config).map((optionType: string, idx: number) => this.renderOption(optionType, `option-${idx}`)) }
        </div>
        <StyledMonogram href='https://www.andr.mu' dangerouslySetInnerHTML={{ __html: require('!raw-loader!@/assets/images/mu.svg') }}/>
        <StyledGitHubLink dangerouslySetInnerHTML={{ __html: require('!raw-loader!@/assets/images/icon-github.svg') }} href='https://github.com/andrewscwei/flight-monitoring-test'/>
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
)(Settings);

const StyledRoot = styled.div`
  ${promptu.container.fvcc}
  width: 100%;
  height: 100%;
  padding: 0 3rem;
  touch-action: none;
  overflow-x: hidden;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;

  > div {
    width: 100%;
    max-width: 60rem;
    height: auto;
  }

  header {
    ${promptu.container.fhcl}
    margin-bottom: 3rem;
  }

  h1 {
    ${props => props.theme.title(40)}
    color: #fff;
    flex-grow: 1;
  }

  button {
    width: 2.4rem;
    height: 2.4rem;
    transition: opacity .2s ease-out;

    @media (hover: hover) {
      &:hover {
        opacity: .6;
      }
    }
  }
`;

const StyledOption = styled.div`
  ${promptu.container.fvtl}

  &:not(:last-child) {
    margin-bottom: 3rem;
  }

  h2 {
    ${props => props.theme.title(16)}
    color: #fff;
    margin-bottom: 1.5rem;
  }
`;

const StyledHRangeSlider = styled(HRangeSlider)<any>`
  width: calc(100% - ${10}px);
  margin: 0 0 2rem .5rem;
`;

const StyledSelect = styled.select`
  ${promptu.container.box}
  ${props => props.theme.text(22)}
  width: 15rem;
  height: 4rem;
  padding: 0 1rem;
  color: #000;
  transition: background .2s ease-out;
  text-align: center;
  background: #fff;
  border-radius: 0;

  @media (hover: hover) {
    &:hover {
      background: #ccc;
    }
  }
`;

const StyledMonogram = styled.a`
  ${promptu.container.box}
  ${promptu.align.bl}
  margin: 2.4rem;
  margin-left: max(2.4rem, env(safe-area-inset-left));
  margin-bottom: max(2.4rem, env(safe-area-inset-bottom));
  height: 2rem;
  transition: opacity .2s ease-out;

  & svg {
    width: auto;
    height: 100%;
  }

  @media (hover: hover) {
    &:hover {
      opacity: .6;
    }
  }
`;

const StyledGitHubLink = styled.a`
  ${promptu.container.box}
  ${promptu.align.br}
  margin: 2.4rem;
  margin-right: max(2.4rem, env(safe-area-inset-right));
  margin-bottom: max(2.4rem, env(safe-area-inset-bottom));
  height: 2rem;
  transition: opacity .2s ease-out;

  & svg {
    width: auto;
    height: 100%;
  }

  @media (hover: hover) {
    &:hover {
      opacity: .6;
    }
  }
`