import React from 'react';
import Modal from 'react-modal';
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc';
import { bound } from '../lib/utils.js';
import EffectEditor from './EffectEditor';
import fx from '../fx';

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
    const Effect = SortableElement(({effect}) => <EffectEditor
      effect={effect}
      removePass={() => this.removeEffect(effect)}
      updatePhoto={this.props.updatePhoto}
    />);
    return <ul>{
      items.map((value, index) => (<Effect key={`item-${index}`} index={index} effect={value} />))
    }</ul>;
  });

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

  removeEffect(pass) {
    this.processor.removePass(pass);
    this.setState({ passes: this.processor.passes });
    this.props.updatePhoto();
  }

  @bound
  onSortEnd({oldIndex, newIndex}) {
    this.processor.passes = arrayMove(this.state.passes, oldIndex, newIndex);
    // FIXME: Internal property leak
    this.processor.isDirty = true;
    this.setState({ passes: this.processor.passes });
    this.props.updatePhoto();
  }

  render() {
    return (
      <div className='pipeline-editor'>
        <this.EffectsList
          lockAxis='y'
          items={this.state.passes}
          onSortEnd={this.onSortEnd}
          useDragHandle={true}
        />
        <div className='pipeline-editor-actions'>
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
