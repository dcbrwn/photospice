import React from 'react';
import EffectProcessor from './lib/EffectProcessor.js';
import EffectEditor from './EffectEditor.jsx';
import fx from './fx';

export default class ComposerPage extends React.Component {
  constructor() {
    super();

    const processor = new EffectProcessor();
    processor.addPass(fx.scaline);

    this.state = {
      processor: processor,
    };
  }

  useImage(event) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      await this.state.processor.useImage(event.target.result);
      this.state.processor.render(this.canvas);
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  async componentDidMount() {
    await this.state.processor.useImage('assets/spice.jpg');
    this.state.processor.render(this.canvas);
  }

  render() {
    return (
      <main className='l-composer'>
        <div className='composer-sidebar'>
          <h1>Photospice</h1>
          <button className='button' onClick={() => this.imageInput.click()}>Upload photo</button>
          <input
            type="file"
            style={{ display: 'none' }}
            onChange={ this.useImage.bind(this) }
            ref={(input) => this.imageInput = input } />
          <EffectEditor processor={this.state.processor} />
        </div>
        <div className='composer-screen'>
          <canvas ref={(canvas) => { this.canvas = canvas; }} />
        </div>
      </main>
    );
  }
}
