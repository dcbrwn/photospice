import React from 'react';
import Modal from 'react-modal';
import { bound } from '../lib/utils';
import fx from '../fx';

export default class EffectPicker extends React.Component {
  constructor() {
    super();

    this.effects = [];
    for (let effectId in fx) {
      const effect = fx[effectId];
      this.effects.push(<li key={effect.name}>
        <a onClick={() => this.pickEffect(effect)}>{effect.name}</a>
      </li>);
    }
  }

  state = {
    isModalOpened: false,
  };

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
      <div onClick={this.openModal}>
        {this.props.children}
        <Modal
          isOpen={this.state.isModalOpened}
          onRequestClose={this.closeModal}
          contentLabel='Effect pass picker'>
          <h2>Pick effect pass</h2>
          <ul>{this.effects}</ul>
          <button className='button' onClick={this.closeModal}>Close</button>
        </Modal>
      </div>
    );
  }
}
