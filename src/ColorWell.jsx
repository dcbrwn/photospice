import React from 'react';
import Modal from 'react-modal';
import { grayscale, clamp, HSVToRGB, RGBToHSV } from './lib/math.js';
import { bound } from './lib/commonDecorators.js';

const popupWidth = 256;
const popupHeight = 256;

export default class ColorWell extends React.Component {
  constructor() {
    super();
    this.state = {
      isPopupOpen: false,
      popupX: 0,
      popupY: 0,
      hue: 0.3,
      saturation: 1.0,
      brightness: 1.0,
      color: [0.3, 1.0, 1.0],
    };
  }

  static get defaultProps() {
    return {
      onChange: () => {},
      value: [1, 1, 1],
    };
  }

  @bound
  openPopup(event) {
    const color = RGBToHSV(...this.props.value);
    this.setState({
      isPopupOpen: true,
      popupX: clamp(event.clientX - popupWidth / 2, 0, window.innerWidth - popupWidth),
      popupY: clamp(event.clientY - popupHeight / 2, 0, window.innerHeight - popupHeight),
      color: this.props.value,
      hue: color[0],
      saturation: color[1],
      brightness: color[2],
    });
  }

  @bound
  closePopup() {
    this.setState({ isPopupOpen: false });
  }

  @bound
  handleHClick(event) {
    event.preventDefault();
    const self = this;
    const containerRect = this.huePad.getBoundingClientRect();

    function handleMouseMove(event) {
      const hue = clamp((event.pageX - containerRect.left) / containerRect.width);
      self.handleHSBChange(hue, self.state.saturation, self.state.brightness);
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  @bound
  handleSBClick(event) {
    event.preventDefault();
    const self = this;
    const containerRect = this.SBPad.getBoundingClientRect();

    function handleMouseMove(event) {
      const saturation = clamp((event.pageX - containerRect.left) / containerRect.width, 1e-5);
      const brightness = clamp(1 - (event.pageY - containerRect.top) / containerRect.height, 1e-5);
      self.handleHSBChange(self.state.hue, saturation, brightness);
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  @bound
  pickColor() {
    this.props.onChange(this.state.color);
    this.closePopup();
  }

  toCssColor(color) {
    return `rgb(${color[0] * 255 | 0}, ${color[1] * 255 | 0}, ${color[2] * 255 | 0})`;
  }

  handleHSBChange(hue, saturation, brightness) {
    const color = HSVToRGB(hue, saturation, brightness);
    this.setState({
      hue,
      saturation,
      brightness,
      color,
    });
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
    const pureColor = HSVToRGB(this.state.hue, 1, 1);

    return (
      <div
        style={{ backgroundColor: this.toCssColor(this.props.value) }}
        onClick={this.openPopup}
        className='color-well'>
        <Modal
          isOpen={this.state.isPopupOpen}
          onRequestClose={this.closePopup}
          style={popupStyle}
          contentLabel='Pick a color'>
          <div className='color-well-modal'>
            <div
              className='hue-pad'
              ref={huePad => this.huePad = huePad}
              onMouseDown={this.handleHClick}
              style={{paddingLeft: this.state.hue * 100 + '%'}}>
            </div>
            <div
              className='saturation-value-pad'
              ref={SBPad => this.SBPad = SBPad}
              onMouseDown={this.handleSBClick}
              style={{
                backgroundColor: this.toCssColor(pureColor),
                paddingLeft: this.state.saturation * 100 + '%',
                paddingTop: (1 - this.state.brightness) * 100 + '%',
              }}>
            </div>
          </div>
          <div className='pull-right'>
            <button
              className='button button-muted'
              onClick={this.closePopup}>
              Cancel
            </button>
            <button
              className='button button-transparent'
              onClick={this.pickColor}
              style={{
                backgroundColor: this.toCssColor(this.state.color),
                color: grayscale(...this.state.color) > 0.55 ? 'black' : 'white',
                transition: 'color 0.2s ease',
              }}>
              Pick this color
            </button>
          </div>
        </Modal>
      </div>
    );
  }
}
