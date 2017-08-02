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
  useImage(event) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      await this.processor.useImage(event.target.result);
      this.props.updatePhoto();
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  @bound
  pickEffect(effect, position) {
    this.processor.addPass(effect, position);
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
    this.processor.movePass(oldIndex, newIndex);
    this.setState({ passes: this.processor.passes });
    this.props.updatePhoto();
  }

  render() {
    let trailingEffectPicker = null;
    if (this.processor.passes.length >= 1) {
      trailingEffectPicker = <div className='pipeline-editor-item'>
        <EffectPicker
        isOpen={this.state.isPassPickerOpen}
        onPickEffect={this.pickEffect}>
          <button className='button'>Add effect</button>
        </EffectPicker>
      </div>
    }
    return (
      <div className='pipeline-editor'>
        <div className='pipeline-editor-actions pipeline-editor-item'>
          <EffectPicker
            isOpen={this.state.isPassPickerOpen}
            onPickEffect={e => this.pickEffect(e, 0)}>
            <button className='button'>Add effect</button>
          </EffectPicker>
          <button
            className='button button-muted'
            onClick={() => this.imageInput.click()}>
            Upload new image
          </button>
          <button
            className='button button-muted'
            onClick={this.props.downloadPhoto}>
            Download result
          </button>
          <input
            type='file'
            accept='image/*'
            style={{ display: 'none' }}
            onChange={this.useImage}
            ref={(input) => this.imageInput = input } />
        </div>
        <this.EffectsList
          lockAxis='y'
          items={this.state.passes}
          onSortEnd={this.onSortEnd}
          useDragHandle={true}
        />
        {trailingEffectPicker}
      </div>
    );
  }
}
