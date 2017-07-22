import React from 'react';
import { bound } from './lib/commonDecorators.js';
import Slider from './Slider.jsx';
import Toggle from './Toggle.jsx';

export default class KitchenSinkPage extends React.Component {
  constructor() {
    super();

    this.state = {
      sliderValue: 0,
      toggleValue: false,
    };
  }

  onChange(key) {
    return (value) => {
      this.setState({ [key]: value });
    }
  }

  render() {
    return (
      <main className='l-kitchen-sink'>
        <header>
          <h1>Kitchen Sink</h1>
        </header>
        <section>
          Slider: {this.state.sliderValue}<br />
          <Slider
            value={this.state.sliderValue}
            onChange={this.onChange('sliderValue')}
          />
        </section>
        <section>
          Toggle: {this.state.toggleValue.toString()}<br />
          <Toggle
            value={this.state.toggleValue}
            onChange={this.onChange('toggleValue')}
          />
        </section>
        <section>
          Buttons:<br />
          <button className='button'>Default</button>
          <button className='button button-muted'>Muted</button>
          <button className='button button-transparent'>Transparent</button>
        </section>
      </main>
    );
  }
}
