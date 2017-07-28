import React from 'react';
import Modal from 'react-modal';
import {
  SortableHandle,
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc';
import { bound } from './lib/commonDecorators.js';
import Toggle from './components/Toggle.jsx';
import UniformEditor from './UniformEditor.jsx';
import fx from './fx';

export default class PipelineEditor extends React.Component {
  constructor(props) {
    super();

    this.effects = [];
    for (let effectId in fx) {
      const effect = fx[effectId];
      this.effects.push(<li key={effect.name}>
        <a onClick={() => this.pickEffect(effect)}>{effect.name}</a>
      </li>);
    }

    this.processor = props.processor;

    this.state = {
      passes: this.processor.passes,
      advancedMode: false,
      isPassPickerOpen: false,
    };
  }

  EffectsList = SortableContainer(({items}) => {
    const Effect = SortableElement(({pass}) => this.renderPass(pass));
    const passes = items
      .filter((pass) => !pass.hidden)
      .map((value, index) => (<Effect key={`item-${index}`} index={index + 1} pass={value} />));
    return <ul>{passes}</ul>;
  });

  renderPass(pass) {
    const EffectHandle = SortableHandle(() => {
      return <span className='effect-pass-name'>
        <i>fx</i> <b>{pass.name}</b>
      </span>
    });
    const uniformEditors = [];

    for (let i = 0; i < pass.uniforms.length; i += 1) {
      const uniform = pass.uniforms[i];
      uniformEditors.push(
        <li key={i}>
          <UniformEditor
            uniform={uniform}
            value={uniform.value}
            onChange={(v) => this.handleUniformChange(v, uniform)} />
        </li>
      );
    }

    return (<li className='effect-pass'>
      <div className='effect-pass-header'>
        <Toggle value={!pass.isDisabled} onChange={() => this.togglePass(pass)} />
        <EffectHandle />
        <div className='effect-pass-actions'>
          <button
            className='button button-muted'
            onClick={() => this.removePass(pass)}>
            Remove
          </button>
        </div>
      </div>
      <ul>
        {uniformEditors}
      </ul>
    </li>);
  }

  handleUniformChange(value, uniform) {
    uniform.value = value;
    this.props.onChange();
  }

  togglePass(pass) {
    pass.isDisabled = !pass.isDisabled;
    this.props.updatePhoto();
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
    this.closePassPicker();
    this.processor.addPass(effect);
    this.setState({ passes: this.processor.passes });
    this.props.updatePhoto();
  }

  removePass(pass) {
    this.processor.removePass(pass);
    this.setState({ passes: this.processor.passes });
    this.props.updatePhoto();
  }

  @bound
  onSortEnd({oldIndex, newIndex}) {
    this.processor.passes = arrayMove(this.state.passes, oldIndex, newIndex);
    this.setState({ passes: this.processor.passes });
    this.props.updatePhoto();
  }

  render() {
    return (
      <div className='effect-editor'>
        <this.EffectsList
          lockAxis='y'
          items={this.state.passes}
          onSortEnd={this.onSortEnd}
          useDragHandle={true}/>
        <div className='effect-editor-actions'>
          <button className='button' onClick={this.openPassPicker}>Add pass</button>
        </div>
        <Modal
          isOpen={this.state.isPassPickerOpen}
          onRequestClose={this.closePassPicker}
          contentLabel='Effect pass picker'>
          <h2>Pick effect pass</h2>
          <ul>{this.effects}</ul>
          <button className='button' onClick={this.closePassPicker}>Close</button>
        </Modal>
      </div>
    );
  }
}
