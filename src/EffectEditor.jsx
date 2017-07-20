import React from 'react';
import { bound } from './lib/commonDecorators.js';
import Toggle from './Toggle.jsx';
import UniformEditor from './UniformEditor.jsx';
import Modal from 'react-modal';

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
        <li><b>Pass "{pass.name}"</b></li>
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

  render() {
    const processor = this.props.processor;

    const passes = [];
    for (let i = 0; i < processor.passes.length; i += 1) {
      passes.push(<li key={i}>{this.renderEffectPass(processor.passes[i], this.state.advancedMode)}</li>);
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
          <button className='button' onClick={this.closePassPicker}>Close</button>
        </Modal>
      </div>
    );
  }
}
