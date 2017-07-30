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

    return <p>{effect.description}</p>;
  }

  renderEffectsList(effects = [], query) {
    return effects
      .filter((effect) => {
        if (!query || query === '') return true;
        const re = new RegExp(query.replace(/[^0-9A-Za-z\s]/g, ''), 'i');
        return re.test(effect.name + effect.description);
      })
      .map((effect) => {
        return (
          <li
            key={effect.name}
            onClick={() => this.pickEffect(effect)}>
            <b>{effect.name}</b>
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
    return (
      <div
        style={{ display: 'inline-block' }}
        onClick={this.openModal}>
        {this.props.children}
        <Modal
          isOpen={this.state.isModalOpened}
          onRequestClose={this.closeModal}
          contentLabel='Effect pass picker'>
          <div className='effect-picker'>
            <h2>Pick effect pass</h2>
            <input
              className='effect-picker-search'
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
