import React from 'react';
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc';
import { bound } from '../lib/utils';
import EffectEditor from './EffectEditor';
import EffectPicker from './EffectPicker';

export default class PipelineEditor extends React.Component {
  constructor(props) {
    super();

    this.processor = props.processor;

    this.state = {
      passes: this.processor.passes,
      advancedMode: false,
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
  pickEffect(effect) {
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
          <EffectPicker
            isOpen={this.state.isPassPickerOpen}
            onPickEffect={this.pickEffect}>
            <button className='button'>Add pass</button>
          </EffectPicker>
        </div>
      </div>
    );
  }
}
