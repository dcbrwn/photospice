import React from 'react';
import { bound } from './lib/commonDecorators.js';
import EffectProcessor from './lib/EffectProcessor.js';
import EffectEditor from './EffectEditor.jsx';
import fx from './fx';
import _ from 'lodash';

export default class ComposerPage extends React.Component {
  constructor() {
    super();

    const processor = new EffectProcessor();

    this.state = {
      processor: processor,
    };
    this.updatePhoto = _.throttle(() => {
      processor.render(this.canvas);
    }, 20);
  }

  @bound
  useImage(event) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      await this.state.processor.useImage(event.target.result);
      this.updatePhoto();
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  async componentDidMount() {
    await this.state.processor.useImage('assets/jelly-beans.png');
    this.updatePhoto();
  }

  @bound
  handleProcessorChange() {
    // FIXME: This feels wrong...
    this.setState({ processor: this.state.processor });
    this.updatePhoto();
  }

  render() {
    return (
      <main className='l-composer'>
        <div className='composer-sidebar'>
          <div className='composer-sidebar-header'>
            <h1>Photospice</h1>
            <button className='button' onClick={() => this.imageInput.click()}>Upload photo</button>
            <input
              type='file'
              accept='image/*'
              style={{ display: 'none' }}
              onChange={this.useImage}
              ref={(input) => this.imageInput = input } />
            <hr />
          </div>
          <EffectEditor
            processor={this.state.processor}
            onChange={this.handleProcessorChange}
          />
        </div>
        <div className='composer-screen'>
          <canvas ref={(canvas) => { this.canvas = canvas; }} />
        </div>
      </main>
    );
  }
}
