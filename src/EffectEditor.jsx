import React from 'react';
import Toggle from './Toggle.jsx';

export default class ComposerPage extends React.Component {
  constructor() {
    super();
    this.state = {
      advancedMode: false,
    };
  }

  render() {
    return (
      <div>
        <span>Advanced mode <Toggle value={this.state.advancedMode} /></span>
      </div>
    );
  }
}
