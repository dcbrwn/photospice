import React from 'react';
import { bound } from './lib/commonDecorators.js';
import Toggle from './Toggle.jsx';
import UniformEditor from './UniformEditor.jsx';
import Modal from 'react-modal';
import fx from './fx';

export default class EffectEditor extends React.Component {
  constructor() {
    super();
    this.state = {
      advancedMode: false,
      uniforms: {
        isPassPickerOpen: false,
      },
    };
  }

  handleUniformChange(value, id) {
    const newUniforms = this.state.uniforms;
    newUniforms[id] = value;
    this.setState({ uniforms: newUniforms });
    this.props.onChange(newUniforms);
  }

  renderEffectPass(pass, advancedMode) {
    const uniformEditors = [];

    for (let i = 0; i < pass.uniforms.length; i += 1) {
      const uniform = pass.uniforms[i];
      uniformEditors.push(
        <li key={i}>
          <UniformEditor
            uniform={uniform}
            value={this.state.uniforms[uniform.id]}
            onChange={(v) => this.handleUniformChange(v, uniform.id)}
          />
        </li>
      );
    }

    return (
      <ul className='effect-editor-pass'>
        <li>
          <button
            className='button button-muted'
            onClick={() => this.removePass(pass)}>
            X
          </button>
          <b>Pass "{pass.name}"</b>
        </li>
        {uniformEditors}
      </ul>
    );
  }

  @bound
  openPassPicker() {
    this.setState({ isPassPickerOpen: true });
  }

  @bound
  closePassPicker() {
    this.setState({ isPassPickerOpen: false });
  }

  pickEffect(effect) {
    this.props.processor.addPass(effect);
    this.closePassPicker();
    // this.forceUpdate();
    this.props.onChange({});
  }

  removePass(pass) {
    this.props.processor.removePass(pass);
    // this.forceUpdate();
    this.props.onChange({});
  }

  render() {
    const processor = this.props.processor;

    const passes = [];
    for (let i = 0; i < processor.passes.length; i += 1) {
      if (processor.passes[i].isInternal) continue;
      passes.push(<li key={i}>{this.renderEffectPass(processor.passes[i], this.state.advancedMode)}</li>);
    }

    const effects = [];
    for (let effectId in fx) {
      const effect = fx[effectId];
      effects.push(<li
        onClick={() => this.pickEffect(effect)}
        key={effect.name}>{effect.name}</li>);
    }

    return (
      <div className='effect-editor'>
        <ol>{passes}</ol>
        <button className='button' onClick={this.openPassPicker}>Add pass</button>
        <Modal
          isOpen={this.state.isPassPickerOpen}
          onRequestClose={this.closePassPicker}
          contentLabel='Effect pass picker'>
          <h2>Pick effect pass</h2>
          <ul>{effects}</ul>
          <button className='button' onClick={this.closePassPicker}>Close</button>
        </Modal>
      </div>
    );
  }
}
