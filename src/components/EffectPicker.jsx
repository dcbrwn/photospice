import React from 'react';
import Modal from 'react-modal';
import { bound } from '../lib/utils';
import fx from '../fx';

export default class EffectPicker extends React.Component {
  constructor() {
    super();


  }

  state = {
    isModalOpened: false,
  };

  renderEffectsList(effects = [], query) {
    return effects
      .filter((effect) => {
        if (!query) return true;
        // FIXME: Add filtering logic
      })
      .map((effect) => <li key={effect.name}>
        <a onClick={() => this.pickEffect(effect)}>{effect.name}</a>
      </li>);
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
          <h2>Pick effect pass</h2>
          <ul>{this.renderEffectsList(fx, this.state.query)}</ul>
          <button className='button' onClick={this.closeModal}>Close</button>
        </Modal>
      </div>
    );
  }
}
