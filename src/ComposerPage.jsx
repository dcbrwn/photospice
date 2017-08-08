import React from 'react';
import { bound, classes } from './lib/utils';
import EffectProcessor from './lib/EffectProcessor';
import PipelineEditor from './components/PipelineEditor';
import ImageContainer from './components/ImageContainer';
import _ from 'lodash';

// See also: https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
const isMobile = /Mobi/.test(navigator.userAgent);

export default class ComposerPage extends React.Component {
  constructor() {
    super();

    if (isMobile) {
      this.updatePhoto = _.debounce(() => {
        this.state.processor.render(this.canvas);
      }, 1000);
    } else {
      this.updatePhoto = _.throttle(() => {
        this.state.processor.render(this.canvas);
      }, 1000 / 60);
    }
  }

  state = {
    processor: new EffectProcessor(),
    compactMode: false,
  }

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
        <div
          className='composer-mobile-menu-button'
          onClick={this.toggleCompactMode}>
        </div>
        <div className='composer-sidebar'>
          <div className='composer-sidebar-header'>
            <h1>
              Photospice
              <a
                href='https://github.com/photospice/photospice'
                rel='noopener'
                style={{textDecoration: 'none'}}>
                <sup className='text-negative'>&alpha;</sup>
              </a>
            </h1>
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
