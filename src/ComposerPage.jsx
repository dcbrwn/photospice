import React from 'react';
import EffectProcessor from './lib/EffectProcessor.js';
import EffectTuner from './EffectTuner.jsx';
import fx from './fx';

export default class ComposerPage extends React.Component {
  constructor() {
    super();
    this.state = {
      processor: null,
    };
  }

  useImage(event) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      await this.state.processor.useImage(0, event.target.result);
      this.state.processor.render();
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  async componentDidMount() {
    const processor = new EffectProcessor(this.canvas);
    processor.addPass(fx.grayscale);
    await processor.useImage(0, 'assets/spice.jpg');
    processor.render();
    this.setState({ processor: processor });
  }

  render() {
    return (
      <main className='composer'>
        <div className='composer-overlay'>
          <h1>Photospice</h1>
          <button onClick={() => this.imageInput.click()}>Upload photo</button>
          <input
            type="file"
            style={{ display: 'none' }}
            onChange={ this.useImage.bind(this) }
            ref={(input) => this.imageInput = input } />
          <EffectTuner processor={this.state.processor} />
        </div>
        <div className='composer-screen'>
          <canvas ref={(canvas) => { this.canvas = canvas; }} />
        </div>
      </main>
    );
  }
}
