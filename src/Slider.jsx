import React from 'react';
import { clamp, align } from './lib/math.js';
import { bound } from './lib/commonDecorators.js';

export default class Slider extends React.Component {
  static get defaultProps() {
    return {
      min: 0,
      max: 1,
      step: 0.1,
    };
  }

  @bound
  handleMouseDown(event) {
    event.preventDefault();
    const self = this;
    const domain =  this.props.max - this.props.min;
    const containerRect = this.container.getBoundingClientRect();
    const buttonRect = event.target.getBoundingClientRect();
    const width = containerRect.width;
    const sx = buttonRect.width / 2;

    function handleMouseMove(event) {
      const value = domain * (event.pageX - sx - containerRect.left) / width + self.props.min;
      self.props.onChange(clamp(align(value, self.props.step), self.props.min, self.props.max));
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  render() {
    const value = (this.props.value - this.props.min) * 100 / (this.props.max - this.props.min);
    const position = clamp(value, 0, 100) + '%';

    return (
      <div className='slider'>
        <div
          className='slider-container'
          ref={(container) => { this.container = container }}>
          <div
            style={{ left: position }}
            className='slider-button'
            onMouseDown={ this.handleMouseDown }>
          </div>
        </div>
      </div>
    );
  }
}
