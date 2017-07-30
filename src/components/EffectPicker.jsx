import React from 'react';
import Modal from 'react-modal';
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
          <div className='effect-picker'>
            <input
              className='effect-picker-search'
              autoFocus
              type='text'
              placeholder='Search for effect...'
              onChange={this.setSearchQuery}/>
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
