import React from 'react';
import { clamp, align } from '../lib/math';
import { bound } from '../lib/utils';
import Slider from './Slider';

export default class PreciseSlider extends React.Component {
  constructor(props) {
    super();
    this.state = {
      value: props.value.toPrecision(4),
    };
  }

  static get defaultProps() {
    return {
      min: 0,
      max: 1,
      step: 0,
      onChange: () => {},
    };
  }

  @bound
  handleSliderChange(value) {
    this.props.onChange(value);
    this.setState({
      value: value.toPrecision(4),
    });
  }

  @bound
  handleInputChange(event) {
    const value = clamp(parseFloat(event.target.value), this.props.min, this.props.max);

    // Trigger change only if value is a valid number
    if (typeof value === 'number' && value === value) {
      this.props.onChange(value);
    }

    this.setState({
      value: event.target.value,
    });
  }

  render() {
    return (
      <div className='precise-slider'>
        <Slider
          default={this.props.default}
          value={this.props.value}
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          onChange={this.handleSliderChange}/>
        <input
          value={this.state.value}
          onChange={this.handleInputChange}/>
      </div>
    );
  }
}
