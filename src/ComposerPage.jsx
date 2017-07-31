import React from 'react';
import { bound, classes } from './lib/utils';
import EffectProcessor from './lib/EffectProcessor';
import PipelineEditor from './components/PipelineEditor';
import ImageContainer from './components/ImageContainer';
import _ from 'lodash';

export default class ComposerPage extends React.Component {
  state = {
    processor: new EffectProcessor(),
    compactMode: false,
  }

  updatePhoto = _.throttle(() => {
    this.state.processor.render(this.canvas);
  }, 30)

  async componentDidMount() {
    await this.state.processor.useImage('assets/spice.jpg');
    this.updatePhoto();
  }

  @bound
  downloadPhoto() {
    const link = document.createElement('a');
    link.download = 'render.png';
    link.href = this.canvas.toDataURL();
    link.click();
  }

  @bound
  toggleCompactMode() {
    this.setState({
      compactMode: !this.state.compactMode,
    });
  }

  render() {
    const layoutClass = classes('l-composer', {
      'l-composer-compact': this.state.compactMode,
    });
    return (
      <main className={layoutClass}>
        <div className='composer-sidebar'>
          <div className='composer-sidebar-header'>
            <h1>
              Photospice
              <a style={{textDecoration: 'none'}} href='https://github.com/photospice/photospice'>
                <sup className='text-negative'>&alpha;</sup>
              </a>
            </h1>
            <hr />
          </div>
          <PipelineEditor
            downloadPhoto={this.downloadPhoto}
            updatePhoto={this.updatePhoto}
            processor={this.state.processor}
          />
        </div>
        <div className='composer-screen'>
          <ImageContainer toggleCompactMode={this.toggleCompactMode}>
            <canvas ref={(canvas) => { this.canvas = canvas; }} />
          </ImageContainer>
        </div>
      </main>
    );
  }
}
