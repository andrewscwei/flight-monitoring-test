import interact, { InteractEvent } from 'interactjs';
import React, { createRef, PureComponent } from 'react';
import styled, { Styles } from 'styled-components';

export type NumberRange = [number, number];

export interface Props {
  className?: string;
  decimalPlaces: number;
  defaultRange: NumberRange;
  max: number;
  min: number;
  knobPadding: number;
  knobRadius: number;
  labelStyle?: Styles;
  onRangeChange: (range: NumberRange) => void;
  steps: number;
  style?: Styles;
  tintColor: string;
  gutterStyle?: Styles;
}

export interface State {
  range: NumberRange;
  isDraggingLeftKnob: boolean;
  isReleasingLeftKnob: boolean;
  isDraggingRightKnob: boolean;
  isReleasingRightKnob: boolean;
}

export default class HRangeSlider extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    decimalPlaces: 2,
    knobPadding: 20,
    knobRadius: 10,
    max: 10,
    min: 0,
    labelStyle: {},
    onRangeChange: () => {},
    steps: -1,
    style: {},
    tintColor: '#fff',
  };

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
    lknob: createRef<HTMLDivElement>(),
    rknob: createRef<HTMLDivElement>(),
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      range: props.defaultRange || [props.min, props.max],
      isDraggingLeftKnob: false,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: false,
      isReleasingRightKnob: false,
    };
  }

  componentDidMount() {
    const lknobRef = this.nodeRefs.lknob.current;
    const rknobRef = this.nodeRefs.rknob.current;

    if (lknobRef) {
      interact(lknobRef).draggable({
        inertia: true,
        onstart: this.onLKnobDragStart,
        onmove: this.onLKnobDragMove,
        onend: this.onLKnobDragEnd,
      });
    }

    if (rknobRef) {
      interact(rknobRef).draggable({
        inertia: true,
        onstart: this.onRKnobDragStart,
        onmove: this.onRKnobDragMove,
        onend: this.onRKnobDragEnd,
      });
    }

    this.componentDidUpdate({} as any, {} as any);
    this.snapToClosestBreakpoint();
    this.forceUpdate();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (!this.areRangesEqual(prevState.range, this.state.range)) {
      this.props.onRangeChange(this.state.range);
    }
  }

  areRangesEqual = (range1: NumberRange, range2: NumberRange): boolean => {
    if (!range1) return false;
    if (!range2) return false;
    if (range1[0] !== range2[0]) return false;
    if (range1[1] !== range2[1]) return false;
    return true;
  }

  getWidth = (): number => {
    const rootRef = this.nodeRefs.root.current as HTMLElement;
    if (!rootRef) return 0;
    return rootRef.getBoundingClientRect().width;
  }

  getPositionByValue = (value: number): number => {
    const { min, max } = this.props;
    return (value - min) / (max - min);
  }

  getDisplacementByPosition = (pos: number): number => {
    const width = this.getWidth();
    return pos * width;
  }

  getDisplacementByValue = (val: number): number => {
    const pos = this.getPositionByValue(val);
    return this.getDisplacementByPosition(pos);
  }

  getPositionByDisplacement = (dx: number): number => {
    const width = this.getWidth();
    return dx / width;
  }

  getValueByPosition = (pos: number): number => {
    const { min, max } = this.props;
    return (pos * (max - min)) + min;
  }

  getCurrentHighlightWidth = (): number => {
    const [lval, rval] = this.state.range;
    const ldx = this.getDisplacementByValue(lval);
    const rdx = this.getDisplacementByValue(rval);
    return (rdx - ldx);
  }

  getBreakpoints = (): number[] => {
    const { min, max, steps } = this.props;
    const breakpoints = [min];

    for (let i = 0; i < steps; i++) {
      breakpoints.push(min + (i + 1) * (max - min) / (1 + steps));
    }

    breakpoints.push(max);

    return breakpoints;
  }

  getClosestSteppedValueOfValue = (val: number): number => {
    const breakpoints = this.getBreakpoints();
    const n = breakpoints.length;
    let idx = 0;
    let diff = Infinity;

    for (let i = 0; i < n; i++) {
      const t = breakpoints[i];
      const d = Math.abs(val - t);

      if (d < diff) {
        diff = d;
        idx = i;
      }
    }

    return breakpoints[idx];
  }

  snapToClosestBreakpoint = () => {
    if (this.props.steps < 0) return;

    this.setState({
      range: [this.getClosestSteppedValueOfValue(this.state.range[0]), this.getClosestSteppedValueOfValue(this.state.range[1])],
    });
  }

  onLKnobDragStart = () => {
    this.setState({
      isDraggingLeftKnob: true,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: false,
      isReleasingRightKnob: false,
    });
  }

  onLKnobDragEnd = () => {
    this.setState({
      isDraggingLeftKnob: false,
      isReleasingLeftKnob: true,
      isDraggingRightKnob: false,
      isReleasingRightKnob: false,
    });

    this.snapToClosestBreakpoint();
  }

  onLKnobDragMove = (event: InteractEvent) => {
    const [lval, rval] = this.state.range;
    const { min } = this.props;
    const minX = this.getDisplacementByValue(min);
    const maxX = this.getDisplacementByValue(rval);
    const currX = this.getDisplacementByValue(lval);
    const newX = Math.max(minX, Math.min(maxX, currX + event.dx));
    const newPos = this.getPositionByDisplacement(newX);
    const newVal = this.getValueByPosition(newPos);

    this.setState({
      isDraggingLeftKnob: true,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: false,
      isReleasingRightKnob: false,
      range: [newVal, rval],
    });
  }

  onRKnobDragStart = (event: InteractEvent) => {
    this.setState({
      isDraggingLeftKnob: false,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: true,
      isReleasingRightKnob: false,
    });
  }

  onRKnobDragEnd = (event: InteractEvent) => {
    this.setState({
      isDraggingLeftKnob: false,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: false,
      isReleasingRightKnob: true,
    });

    this.snapToClosestBreakpoint();
  }

  onRKnobDragMove = (event: InteractEvent) => {
    const [lval, rval] = this.state.range;
    const { max } = this.props;
    const minX = this.getDisplacementByValue(lval);
    const maxX = this.getDisplacementByValue(max);
    const currX = this.getDisplacementByValue(rval);
    const newX = Math.max(minX, Math.min(maxX, currX + event.dx));
    const newPos = this.getPositionByDisplacement(newX);
    const newVal = this.getValueByPosition(newPos);

    this.setState({
      isDraggingLeftKnob: false,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: true,
      isReleasingRightKnob: false,
      range: [lval, newVal],
    });
  }

  render() {
    return (
      <StyledRoot
        className={this.props.className}
        ref={this.nodeRefs.root}
        style={this.props.style}
      >
        <StyledGutter style={this.props.gutterStyle}/>
        <StyledKnob
          ref={this.nodeRefs.lknob}
          radius={this.props.knobRadius}
          tintColor={this.props.tintColor}
          padding={this.props.knobPadding}
          isDragging={this.state.isDraggingLeftKnob}
          isReleasing={this.state.isReleasingLeftKnob}
          isDisabled={(this.state.range[1] === this.props.min) && (this.state.range[0] === this.props.min)}
          style={{
            transform: `translate3d(${this.getDisplacementByValue(this.state.range[0])}px, 0, 0)`,
          }}
        />
        <StyledLabel
          knobRadius={this.props.knobRadius}
          knobPadding={this.props.knobPadding}
          isDragging={this.state.isDraggingLeftKnob}
          isReleasing={this.state.isReleasingLeftKnob}
          style={{
            transform: `translate3d(calc(-50% + ${this.getDisplacementByValue(this.state.range[0])}px), 0, 0)`,
            ...this.props.labelStyle,
          }}
        >
          {Number(this.state.range[0].toFixed(this.props.decimalPlaces)).toLocaleString()}
        </StyledLabel>
        <StyledHighlight
          tintColor={this.props.tintColor}
          isDragging={this.state.isDraggingLeftKnob || this.state.isDraggingRightKnob}
          isReleasing={this.state.isReleasingLeftKnob || this.state.isReleasingRightKnob}
          style={{
            width: `${this.getCurrentHighlightWidth()}px`,
            transform: `translate3d(${this.getDisplacementByValue(this.state.range[0])}px, 0, 0)`,
          }}
        />
        <StyledKnob
          innerRef={this.nodeRefs.rknob}
          radius={this.props.knobRadius}
          tintColor={this.props.tintColor}
          padding={this.props.knobPadding}
          isDragging={this.state.isDraggingRightKnob}
          isReleasing={this.state.isReleasingRightKnob}
          isDisabled={(this.state.range[1] === this.props.max) && (this.state.range[0] === this.props.max)}
          style={{
            transform: `translate3d(${this.getDisplacementByValue(this.state.range[1])}px, 0, 0)`,
          }}
        />
        <StyledLabel
          knobRadius={this.props.knobRadius}
          knobPadding={this.props.knobPadding}
          isDragging={this.state.isDraggingLeftKnob || this.state.isDraggingRightKnob}
          isReleasing={this.state.isReleasingLeftKnob || this.state.isReleasingRightKnob}
          style={{
            transform: `translate3d(calc(-50% + ${this.getDisplacementByValue(this.state.range[1])}px), 0, 0)`,
            ...this.props.labelStyle,
          }}
        >
          {Number(this.state.range[1].toFixed(this.props.decimalPlaces)).toLocaleString()}
        </StyledLabel>
      </StyledRoot>
    );
  }
}

const StyledHighlight = styled.div<any>`
  top: 0;
  left: 0;
  position: absolute;
  height: 100%;
  background: ${props => props.tintColor};
  transition-property: ${props => props.isReleasing ? 'opacity, width, transform' : 'opacity'};
  transition-duration: 150ms;
  transition-timing-function: ease-out;
`;

const StyledLabel = styled.span<any>`
  top: ${props => 10 + props.knobRadius}px;
  left: 0;
  background: transparent;
  text-align: center;
  position: absolute;
  pointer-events: none;
  user-select: none;
  transition-property: ${props => props.isReleasing ? 'opacity, transform' : 'opacity'};
  transition-duration: 150ms;
  transition-timing-function: ease-out;
`;

const StyledKnob = styled.div<any>`
  box-sizing: border-box;
  top: 0;
  bottom: 0;
  left: ${props => -props.radius - props.padding}px;
  margin: auto 0;
  position: absolute;
  padding: ${props => props.padding}px;
  width: ${props => (props.radius + props.padding) * 2}px;
  height: ${props => (props.radius + props.padding) * 2}px;
  background: transparent;
  pointer-events: ${props => props.isDisabled ? 'none' : 'auto'};
  transition-property: ${props => props.isReleasing ? 'opacity, transform' : 'opacity'};
  transition-duration: 150ms;
  transition-timing-function: ease-out;

  &::after {
    content: '';
    border-radius: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    position: absolute;
    width: ${props => props.radius * 2}px;
    height: ${props => props.radius * 2}px;
    background: ${props => props.tintColor};
  }
`;

const StyledGutter = styled.div`
  display: block;
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  height: 2px;
  background: #222;
`;

const StyledRoot = styled.div`
  display: flex;
  height: 2px;
`;
