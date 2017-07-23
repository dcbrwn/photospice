import React from 'react';
import Modal from 'react-modal';
import { clamp } from './lib/math.js';
import { bound } from './lib/commonDecorators.js';

const popupWidth = 200;
const popupHeight = 300;

export default class Toggle extends React.Component {
  constructor() {
    super();
    this.state = {
      isPopupOpen: false,
      popupX: 0,
      popupY: 0,
    };
  }

  static get defaultProps() {
    return {
      onChange: () => {},
    };
  }

  @bound
  handleMouseClick(event) {
    this.setState({
      isPopupOpen: true,
      popupX: clamp(event.clientX, 0, window.innerWidth - popupWidth),
      popupY: clamp(event.clientY - popupHeight, 0, window.innerWidth - popupHeight),
    });
  }

  @bound
  closePopup() {
    this.setState({ isPopupOpen: false });
  }

  toCssColor(value = [0, 0, 0]) {
    return `rgb(${value[0] * 255 | 0}, ${value[1] * 255 | 0}, ${value[2] * 255 | 0})`;
  }

  @bound
  handlePopupOpen() {
    const ctx = this.canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,150,150);

    const colorGradient = ctx.createLinearGradient(0,0,150,0);
    colorGradient.addColorStop(0, 'transparent');
    colorGradient.addColorStop(1, 'red');
    const brightnessGradient = ctx.createLinearGradient(0,0,0,150);
    brightnessGradient.addColorStop(0, 'transparent');
    brightnessGradient.addColorStop(1, 'black');

    ctx.fillStyle = brightnessGradient;
    ctx.fillRect(0,0,150,150);
    ctx.fillStyle = colorGradient;
    ctx.fillRect(0,0,150,150);
  }

  render() {
    const popupStyle = {
      content: {
        position: 'absolute',
        top: this.state.popupY,
        left: this.state.popupX,
        right: 'auto',
        bottom: 'auto',
      },
      overlay: {
        backgroundColor: 'transparent',
      },
    };

    return (
      <div
        style={{ backgroundColor: this.toCssColor(this.state.value) }}
        onClick={this.handleMouseClick}
        className='color-well'>
        <Modal
          isOpen={this.state.isPopupOpen}
          onRequestClose={this.closePopup}
          onAfterOpen={this.handlePopupOpen}
          style={popupStyle}
          contentLabel='Pick a color'>
          <h3>Pick a color</h3>
          <canvas ref={c => this.canvas = c} width="150px" height="150px" />
          <br/>
          <button className='button' onClick={this.closePopup}>Close</button>
        </Modal>
      </div>
    );
  }
}
