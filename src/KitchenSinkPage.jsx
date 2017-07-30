import React from 'react';
import { genParagraph } from './lib/textGenerator';
import { bound } from './lib/utils';
import Slider from './components/Slider';
import Toggle from './components/Toggle';
import ColorWell from './components/ColorWell';

const fish = genParagraph(10);

export default class KitchenSinkPage extends React.Component {
  constructor() {
    super();

    this.state = {
      sliderValue: 0,
      toggleValue: false,
      colorValue: [0.3, 0.7, 0.3],
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
        <hr />
        <section>
          <h1>Header 1</h1>
          <h2>Header 2</h2>
          <h3>Header 3</h3>
          <p>{fish}</p>
        </section>
        <section>
          Links:<br />
          <a href='#'>Simple link</a>
        </section>
        <section className='buttons-group'>
          Buttons:<br />
          <button className='button button-transparent'>Transparent</button>
          <button className='button button-muted'>Muted</button>
          <button className='button'>Default</button>
          <button className='button button-positive'>Positive</button>
          <button className='button button-negative'>Negative</button>
        </section>
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
          Color well:<br />
          <ColorWell
            value={this.state.colorValue}
            onChange={this.onChange('colorValue')}
          />
        </section>
      </main>
    );
  }
}
