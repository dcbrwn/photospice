import React from 'react';
import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { bound, classes } from '../lib/utils';
import EffectEditor from './EffectEditor';
import EffectPicker from './EffectPicker';

export default class PipelineEditor extends React.Component {
  constructor(props) {
    super();

    this.processor = props.processor;

    this.state = {
      passes: this.processor.passes,
      isEffectPickerOpen: false,
      newEffectPosition: 0,
    };
  }

  EffectsList = SortableContainer(({items}) => {
    const Effect = SortableElement(({effect}) => <EffectEditor
      effect={effect}
      removePass={() => this.removeEffect(effect)}
      updatePhoto={this.props.updatePhoto}
    />);

    return <ul className='pipeline-editor-effects'>
      {items.map((value, index) => {
        return <Effect key={`item-${index}`} index={index} effect={value} />;
      })}
    </ul>;
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
  pickEffect(effect) {
    if (effect) {
      this.processor.addPass(effect, this.state.newEffectPosition);
      this.setState({ passes: this.processor.passes });
      this.props.updatePhoto();
    }
    this.closeEffectPicker();
  }

  closeEffectPicker() {
    this.setState({
      isEffectPickerOpen: false,
    });
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
    const pickerClass = classes('pipeline-editor-picker', {
      active: this.state.isEffectPickerOpen,
    });
    let trailingEffectPicker = null;

    if (this.processor.passes.length >= 1) {
      trailingEffectPicker = <button
        className='button'
        onClick={() => this.setState({
          isEffectPickerOpen: true,
          newEffectPosition: this.state.passes.length,
        })}>
        Add effect
      </button>
    }

    return (
      <div className='pipeline-editor'>
        <div className='pipeline-editor-pipe'>
          <div className='pipeline-editor-actions pipeline-editor-item'>
            <button
              className='button'
              onClick={() => this.setState({
                isEffectPickerOpen: true,
                newEffectPosition: 0,
              })}>
              Add effect
            </button>
            <button
              className='button button-muted'
              onClick={() => this.imageInput.click()}>
              Upload image
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
          <div className='pipeline-editor-item'>
            {trailingEffectPicker}
          </div>
        </div>
        <div className={pickerClass}>
          <EffectPicker onPickEffect={this.pickEffect} />
        </div>
      </div>
    );
  }
}
