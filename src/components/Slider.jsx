import React from 'react';
import { clamp, align } from '../lib/math';
import { bound, dragHelper } from '../lib/utils';

export default class Slider extends React.Component {
  static get defaultProps() {
    return {
      default: 0,
      min: 0,
      max: 1,
      step: 0,
      onChange: () => {},
    };
  }

  startMove = dragHelper({
    onStart: (event) => {
      const container = this.container.getBoundingClientRect();
      const button = event.target.getBoundingClientRect();
      return {
        origin: button.width / 2 + container.left,
        width: container.width,
        domain: this.props.max - this.props.min,
      };
    },
    onMove: (init, data) => {
      const rawValue = (data.pageX - init.origin) / init.width;
      let value = init.domain * rawValue + this.props.min;
      if (this.props.step) {
        value = align(value, this.props.step);
      }
      this.props.onChange(clamp(value, this.props.min, this.props.max));
    },
  });

  @bound
  resetValue() {
    this.props.onChange(this.props.default);
  }

  render() {
    const value = (this.props.value - this.props.min) * 100 / (this.props.max - this.props.min);
    const position = clamp(value, 0, 100) + '%';

    return (
      <div
        className='slider'
        onDoubleClick={this.resetValue}>
        <div
          className='slider-container'
          ref={(container) => { this.container = container }}>
          <div
            style={{ left: position }}
            className='slider-button'
            onTouchStart={this.startMove}
            onMouseDown={this.startMove}>
          </div>
        </div>
      </div>
    );
  }
}
