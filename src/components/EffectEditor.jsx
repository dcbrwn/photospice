import React from 'react';
import { SortableHandle } from 'react-sortable-hoc';
import { bound } from '../lib/utils';
import Toggle from './Toggle';
import UniformEditor from './UniformEditor';

export default class EffectEditor extends React.Component {
  constructor(props) {
    super();
    this.state = {
      effect: props.effect,
    };
  }

  EffectHandle = SortableHandle(() => {
    return <span className='effect-editor-name'>
      <i>fx</i> <b>{this.state.effect.name}</b>
    </span>
  });

  handleUniformChange(value, uniform) {
    uniform.value = value;
    this.setState({ effect: this.state.effect });
    this.props.updatePhoto();
  }

  @bound
  toggleEffect() {
    this.state.effect.isDisabled = !this.state.effect.isDisabled;
    this.setState({ effect: this.state.effect });
    this.props.updatePhoto();
  }

  render() {
    return (<li className='effect-editor pipeline-editor-item'>
      <div className='effect-editor-header'>
        <Toggle value={!this.state.effect.isDisabled} onChange={this.toggleEffect} />
        <this.EffectHandle />
        <div className='effect-editor-actions'>
          <button
            className='button button-muted'
            onClick={this.props.removePass}>
            Remove
          </button>
        </div>
      </div>
      <ul>
        {this.state.effect.uniforms.map((uniform, index) => <li key={index}>
          <UniformEditor
            uniform={uniform}
            value={uniform.value}
            onChange={(v) => this.handleUniformChange(v, uniform)} />
        </li>)}
      </ul>
    </li>);
  }
}
