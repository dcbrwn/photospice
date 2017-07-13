import React from 'react';
import { clamp } from './lib/math.js';
import { bound } from './lib/commonDecorators.js';

export default class Slider extends React.Component {
  getDefaultProps() {
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
    const max = this.props.max || 1;
    const min = this.props.min || 0;
    const domain = max - min;
    const containerRect = this.container.getBoundingClientRect();
    const buttonRect = event.target.getBoundingClientRect();
    const width = containerRect.width;
    const sx = buttonRect.width / 2;

    function handleMouseMove(event) {
      const value = domain * (event.pageX - sx - containerRect.left) / width + min;
      self.props.onChange(clamp(value, min, max));
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  render() {
    const max = this.props.max || 1;
    const min = this.props.min || 0;
    const position = clamp((this.props.value - min) * 100 / (max - min), 0, 100) + '%';

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
