import React from 'react';
import { bound } from './lib/commonDecorators.js';

export default class Toggle extends React.Component {
  @bound
  handleMouseClick(event) {
    this.props.onChange(!this.props.value);
  }

  render() {
    return (
      <div className='toggle' onClick={ this.handleMouseClick }>
        <div
          style={{ left: (this.props.value ? 50 : 0) + '%' }}
          className='toggle-button'></div>
      </div>
    );
  }
}
