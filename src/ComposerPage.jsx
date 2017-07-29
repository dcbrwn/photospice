import React from 'react';
import { bound } from './lib/utils';
import EffectProcessor from './lib/EffectProcessor';
import PipelineEditor from './components/PipelineEditor';
import ImageContainer from './components/ImageContainer';
import _ from 'lodash';

export default class ComposerPage extends React.Component {
  state = {
    processor: new EffectProcessor(),
  }

  updatePhoto = _.throttle(() => {
    this.state.processor.render(this.canvas);
  }, 30)

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
  handleDownloadClick() {
    const link = document.createElement('a');
    link.href = this.canvas.toDataURL();
    link.download = 'render.png';
    link.click();
  }

  render() {
    return (
      <main className='l-composer'>
        <div className='composer-sidebar'>
          <div className='composer-sidebar-header'>
            <h1>
              Photospice
              <a style={{textDecoration: 'none'}} href='https://github.com/dcbrwn/photospice'>
                <sup className='text-negative'>&alpha;</sup>
              </a>
            </h1>
            <button className='button' onClick={() => this.imageInput.click()}>Upload new image</button>
            <button className='button' onClick={this.handleDownloadClick}>Download result</button>
            <input
              type='file'
              accept='image/*'
              style={{ display: 'none' }}
              onChange={this.useImage}
              ref={(input) => this.imageInput = input } />
            <hr />
          </div>
          <PipelineEditor
            updatePhoto={this.updatePhoto}
            processor={this.state.processor}
          />
        </div>
        <div className='composer-screen'>
          <ImageContainer>
            <canvas ref={(canvas) => { this.canvas = canvas; }} />
          </ImageContainer>
        </div>
      </main>
    );
  }
}
