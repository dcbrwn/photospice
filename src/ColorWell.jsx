import React from 'react';
import Modal from 'react-modal';
import { clamp, HSVToRGB, RGBToHSV } from './lib/math.js';
import { bound } from './lib/commonDecorators.js';
import GLRenderer from './lib/GLRenderer.js';
import Slider from './Slider.jsx';

const popupWidth = 256;
const popupHeight = 256;

export default class ColorWell extends React.Component {
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
      value: [1, 1, 1],
    };
  }

  @bound
  openPopup(event) {
    this.setState({
      isPopupOpen: true,
      popupX: clamp(event.clientX - popupWidth / 2, 0, window.innerWidth - popupWidth),
      popupY: clamp(event.clientY - popupHeight / 2, 0, window.innerHeight - popupHeight),
    });
  }

  @bound
  closePopup() {
    this.setState({ isPopupOpen: false });
  }

  @bound
  handleHClick(event) {
  }

  @bound
  handleSBClick(event) {
  }

  toCssColor(value) {
    return `rgb(${value[0] * 255 | 0}, ${value[1] * 255 | 0}, ${value[2] * 255 | 0})`;
  }

  handleHSBChange(hue, saturation, brightness) {
    const color = HSVToRGB(hue, saturation, brightness);
    this.props.onChange(color);
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
    const [hue, saturation, brightness] = RGBToHSV(...this.props.value);

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
              onClick={this.handleHClick}
              style={{paddingLeft: hue * 100 + '%'}}>
            </div>
            <div
              className='saturation-value-pad'
              onClick={this.handleSBClick}
              style={{
                paddingLeft: saturation * 100 + '%',
                paddingBottom: brightness * 100 + '%',
              }}>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
