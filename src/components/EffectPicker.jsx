import React from 'react';
import { load } from 'js-yaml';
import { bound } from '../lib/utils';
import fx from '../fx';

export default class EffectPicker extends React.Component {
  state = {
    isModalOpened: false,
  };

  renderEffectDescription(effect) {
    if (!effect.description) return null;

    return <span>{effect.description}</span>;
  }

  renderEffectsList(effects = [], query) {
    let filtered = effects;

    if (query && query !== '') {
      const terms = query.match(/(([^\x00-\x7F]|[&']|\w)+)/g);
      const re = new RegExp(terms.join('\\s+'), 'i');
      filtered = effects.filter((effect) => {
        return re.test(effect.name + effect.description);
      });
    }

    return filtered.map((effect) => {
      return (
        <li
          key={effect.name}
          onClick={() => this.pickEffect(effect)}>
          <b>{effect.name}</b><br />
          {this.renderEffectDescription(effect)}
        </li>
      );
    });
  }

  @bound
  setSearchQuery(event) {
    this.setState({ query: event.target.value });
  }

  @bound
  pickEffect(effect) {
    this.props.onPickEffect(effect);
  }

  @bound
  uploadEffect(event) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const source = event.target.result;
      const effect = load(source);
      this.pickEffect(effect);
    };
    reader.readAsText(event.target.files[0]);
  }

  render() {
    return (
      <div className='effect-picker'>
        <input
          type='file'
          accept='.yml,.yaml'
          style={{ display: 'none' }}
          ref={(input) => this.fileInput = input}
          onChange={this.uploadEffect}/>
        <div className='effect-picker-header'>
          <button
            className='button button-muted'
            onClick={() => this.props.onPickEffect(null)}>
            Back
          </button>
          <input
            autoFocus
            type='text'
            placeholder='Search for effect...'
            onChange={this.setSearchQuery}/>
          <span>or</span>
          <span>
            <button
              className='button'
              onClick={() => this.fileInput.click()}>
              Upload
            </button>
            <a
              className='button button-muted'
              onClickCapture={() => {}}
              target='_blank'
              rel='noopener'
              href='https://github.com/photospice/photospice/tree/master/src/fx'>?</a>
          </span>
        </div>
        <ul className='effect-picker-list'>
          {this.renderEffectsList(fx, this.state.query)}
        </ul>
      </div>
    );
  }
}
