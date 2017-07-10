import React from 'react';
import EffectProcessor from './lib/EffectProcessor.js';
import grayscale from './fx/grayscale.js';
import colorize from './fx/colorize.js';
import scaline from './fx/scaline.js';

export default class ComposerPage extends React.Component {
  useImage(event) {
    const reader = new FileReader();
    reader.onload = (event) => {
      this.processor.useImage(0, event.target.result)
        .then(() => {
          this.processor.render();
        });
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  componentDidMount() {
    this.processor = new EffectProcessor(this.canvas);
    // this.processor.addPass(grayscale);
    // this.processor.addPass(colorize);
    this.processor.addPass(scaline);
  }

  render() {
    return (
      <main>
        <header>
          <h1>Photospice</h1>
        </header>
        <input type="file" onChange={ this.useImage.bind(this) } />
        <div className='scroll-lane'>
          <canvas ref={(canvas) => { this.canvas = canvas; }}>
          </canvas>
        </div>
      </main>
    );
  }
}
