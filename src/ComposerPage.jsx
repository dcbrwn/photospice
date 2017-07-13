import React from 'react';
import EffectProcessor from './lib/EffectProcessor.js';
import fx from './fx';

export default class ComposerPage extends React.Component {
  useImage(event) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      await this.processor.useImage(0, event.target.result);
      this.processor.render();
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  componentDidMount() {
    this.processor = new EffectProcessor(this.canvas);
    this.processor.addPass(fx.colorize);
    this.processor.addPass(fx.scaline);
  }

  render() {
    return (
      <main>
        <header>
          <h1>Photospice</h1>
        </header>
        <button onClick={() => this.imageInput.click()}>Upload photo</button>
        <input
          type="file"
          style={{ display: 'none' }}
          onChange={ this.useImage.bind(this) }
          ref={(input) => this.imageInput = input } />
        <div className='scroll-lane'>
          <canvas ref={(canvas) => { this.canvas = canvas; }}>
          </canvas>
        </div>
        <div className='effect-editor'>
        </div>
      </main>
    );
  }
}
