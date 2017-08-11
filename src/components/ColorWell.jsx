import React from 'react';
import Modal from 'react-modal';
import { luminance, clamp, HSVToRGB, RGBToHSV } from '../lib/math';
import { bound, toCssColor, dragHelper } from '../lib/utils';

// TODO: Extract color picker modal to a separate component
// FIXME: Calculate this on the fly
const popupWidth = 300;
const popupHeight = 350;

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

  startHueChange = dragHelper({
    moveOnStart: true,
    onStart: () => this.huePad.getBoundingClientRect(),
    onMove: (container, data) => {
      const hue = clamp((data.pageX - container.left) / container.width);
      this.handleHSBChange(hue, this.state.saturation, this.state.brightness);
    },
  });

  startToneChange = dragHelper({
    moveOnStart: true,
    onStart: () => this.SBPad.getBoundingClientRect(),
    onMove: (container, data) => {
      const saturation = clamp((data.pageX - container.left) / container.width, 1e-5);
      const brightness = clamp(1 - (data.pageY - container.top) / container.height, 1e-5);
      this.handleHSBChange(this.state.hue, saturation, brightness);
    },
  });

  @bound
  pickColor() {
    this.props.onChange(this.state.color);
    this.closePopup();
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
        className='color-well'
        aria-label='Pick a color'
        style={{ backgroundColor: toCssColor(this.props.value) }}
        onClick={this.openPopup}>
        <Modal
          isOpen={this.state.isPopupOpen}
          onAfterOpen={this.handlePopupOpen}
          style={popupStyle}
          contentLabel='Pick a color'>
          <div className='color-well-modal'>
            <div
              className='hue-pad'
              ref={huePad => this.huePad = huePad}
              onTouchStart={this.startHueChange}
              onMouseDown={this.startHueChange}
              style={{paddingLeft: this.state.hue * 100 + '%'}}>
            </div>
            <div
              className='saturation-value-pad'
              ref={SBPad => this.SBPad = SBPad}
              onTouchStart={this.startToneChange}
              onMouseDown={this.startToneChange}
              style={{
                backgroundColor: toCssColor(pureColor),
                paddingLeft: this.state.saturation * 100 + '%',
                paddingTop: (1 - this.state.brightness) * 100 + '%',
              }}>
            </div>
            <div className='color-well-modal-actions'>
              <button
                className='button button-muted'
                onClick={this.closePopup}>
                Cancel
              </button>
              <button
                className='button button-transparent'
                onClick={this.pickColor}
                style={{
                  backgroundColor: toCssColor(this.state.color),
                  color: luminance(...this.state.color) > 0.6 ? 'black' : 'white',
                  transition: 'color 0.2s ease',
                }}>
                Pick this color
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
