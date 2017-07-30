import React from 'react';
import Modal from 'react-modal';
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
  openModal() {
    this.setState({ isModalOpened: true });
  }

  @bound
  closeModal() {
    this.setState({ isModalOpened: false });
  }

  @bound
  pickEffect(effect) {
    this.props.onPickEffect(effect);
    this.closeModal();
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
    const modalStyle = {
      content: {
        width: '540px',
        height: 'auto',
      },
      overlay: {
        backgroundColor: 'transparent',
      },
    };

    return (
      <div
        style={{ display: 'inline-block' }}
        onClick={this.openModal}>
        {this.props.children}
        <Modal
          style={modalStyle}
          isOpen={this.state.isModalOpened}
          onRequestClose={this.closeModal}
          contentLabel='Effect pass picker'>
          <input
            type='file'
            accept='.yml,.yaml'
            style={{ display: 'none' }}
            ref={(input) => this.fileInput = input}
            onChange={this.uploadEffect}/>
          <div className='effect-picker'>
            <div className='effect-picker-header'>
              <input
                autoFocus
                type='text'
                placeholder='Search for effect...'
                onChange={this.setSearchQuery}/>
              <span>or</span>
              <button
                className='button'
                onClick={() => this.fileInput.click()}>
                Upload your own
              </button>
            </div>
            <ul className='effect-picker-list'>
              {this.renderEffectsList(fx, this.state.query)}
            </ul>
            <div className='effect-picker-actions'>
              <button
                className='button button-muted'
                onClick={this.closeModal}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
