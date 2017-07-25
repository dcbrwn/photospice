import React from 'react';
import Modal from 'react-modal';
import {
  SortableHandle,
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc';
import { bound } from './lib/commonDecorators.js';
import Toggle from './Toggle.jsx';
import UniformEditor from './UniformEditor.jsx';
import fx from './fx';

export default class EffectEditor extends React.Component {
  constructor() {
    super();

    this.EffectsList = SortableContainer(({items}) => {
      const Effect = SortableElement(({pass}) => this.renderPass(pass));
      const passes = items
        .filter((pass) => !pass.hidden)
        .map((value, index) => (<Effect key={`item-${index}`} index={index + 1} pass={value} />));
      return <ul>{passes}</ul>;
    });

    this.state = {
      advancedMode: false,
      isPassPickerOpen: false,
    };
  }

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
    this.props.onChange();
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
    this.props.processor.addPass(effect);
    this.props.onChange();
  }

  removePass(pass) {
    this.props.processor.removePass(pass);
    this.props.onChange();
  }

  @bound
  onSortEnd({oldIndex, newIndex}) {
    // FIXME: BEEEEEP!
    this.props.processor.passes = arrayMove(this.props.processor.passes, oldIndex, newIndex);
    this.props.onChange();
  }

  render() {
    const processor = this.props.processor;
    const effects = [];
    for (let effectId in fx) {
      const effect = fx[effectId];
      effects.push(<li key={effect.name}>
        <a onClick={() => this.pickEffect(effect)}>{effect.name}</a>
      </li>);
    }

    const EffectsList = this.EffectsList;

    return (
      <div className='effect-editor'>
        <EffectsList
          lockAxis='y'
          items={processor.passes}
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
          <ul>{effects}</ul>
          <button className='button' onClick={this.closePassPicker}>Close</button>
        </Modal>
      </div>
    );
  }
}
