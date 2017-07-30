import React from 'react';
import { bound } from '../lib/utils';

export default class Toggle extends React.Component {
  static get defaultProps() {
    return {
      onChange: () => {},
    };
  }

  @bound
  handleMouseClick(event) {
    this.props.onChange(!this.props.value);
  }

  render() {
    return (
      <div
        className={'toggle' + (this.props.value ? ' active' : '')}
        onClick={ this.handleMouseClick }>
        <div className='toggle-button'></div>
      </div>
    );
  }
}
