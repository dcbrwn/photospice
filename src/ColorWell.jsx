import React from 'react';
import Modal from 'react-modal';
import { clamp, HSVToRGB, RGBToHSV } from './lib/math.js';
import { bound } from './lib/commonDecorators.js';
import GLRenderer from './lib/GLRenderer.js';
import Slider from './Slider.jsx';

const popupWidth = 256;
const popupHeight = 256;
const colorWheelShader = `
precision lowp float;

varying vec2 vUv;

uniform vec3 uColor;

vec3 HUEToRGB(float H) {
  float R = abs(H * 6.0 - 3.0) - 1.0;
  float G = 2.0 - abs(H * 6.0 - 2.0);
  float B = 2.0 - abs(H * 6.0 - 4.0);
  return clamp(vec3(R,G,B),0.0,1.0);
}

vec3 HSVToRGB(vec3 HSV) {
  vec3 RGB = HUEToRGB(HSV.x);
  return ((RGB - 1.0) * HSV.y + 1.0) * HSV.z;
}

void main() {
  gl_FragColor.a = 1.0;
  gl_FragColor.rgb = HSVToRGB(vec3(uColor.x, vUv.x, vUv.y * 0.98));
}
`;

export default class ColorWell extends React.Component {
  constructor() {
    super();
    this.uniforms = [
      {
        id: 'uColor',
        type: 'color',
        default: [0.3, 0.8, 0.8],
      },
    ];
    this.renderer = new GLRenderer(256, 256);
    this.program = this.renderer.createProgram(this.uniforms, colorWheelShader);
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
  handlePopupOpen() {
    this.renderColorWheel(this.props.value);
  }

  @bound
  closePopup() {
    this.setState({ isPopupOpen: false });
  }

  toCssColor(value) {
    return `rgb(${value[0] * 255 | 0}, ${value[1] * 255 | 0}, ${value[2] * 255 | 0})`;
  }

  handleHSBChange(hue, saturation, brightness) {
    console.log(hue)
    const color = HSVToRGB(hue, saturation, brightness);
    this.props.onChange(color);
    this.renderColorWheel(color);
  }

  renderColorWheel(color) {
    this.uniforms[0].value = RGBToHSV(...color);
    this.renderer.render(this.program);
    this.renderer.copyToCanvas(this.canvas);
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
    const [red, green, blue] = this.props.value;
    const [hue, saturation, brightness] = RGBToHSV(...this.props.value);

    return (
      <div
        style={{ backgroundColor: this.toCssColor(this.props.value) }}
        onClick={this.openPopup}
        className='color-well'>
        <Modal
          isOpen={this.state.isPopupOpen}
          onRequestClose={this.closePopup}
          onAfterOpen={this.handlePopupOpen}
          style={popupStyle}
          contentLabel='Pick a color'>
          <div className='grid-row color-well-modal'>
            <div className='grid-col-6'>
              <canvas ref={c => this.canvas = c} width="256px" height="256px" />
            </div>
            <div className='grid-col-6 color-well-properties'>
              <label>Hue:</label>
              <Slider
                onChange={(hue) => this.handleHSBChange(hue, saturation, brightness)}
                value={hue} />
              <label>Saturation:</label>
              <Slider
                onChange={(saturation) => this.handleHSBChange(hue, saturation, brightness)}
                min={1e-5}
                value={saturation} />
              <label>Brightness:</label>
              <Slider
                onChange={(brightness) => this.handleHSBChange(hue, saturation, brightness)}
                min={1e-5}
                value={brightness} />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
