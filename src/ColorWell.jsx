import React from 'react';
import Modal from 'react-modal';
import { clamp, HSVToRGB, RGBToHSV } from './lib/math.js';
import { bound } from './lib/commonDecorators.js';
import GLRenderer from './lib/GLRenderer.js';
import Slider from './Slider.jsx';

const popupWidth = 256;
const popupHeight = 310;
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

vec2 toPolar(vec2 cartesian) {
  return vec2(length(cartesian), atan(cartesian.x, cartesian.y));
}

void main() {
  gl_FragColor.a = 1.0;
  float margin = 0.01;
  float ringThickness = 0.12;
  vec3 markerColor = vec3(1.0);
  vec2 p = toPolar(vUv - 0.5);
  float angle = 1.0 - abs(p.y / 3.14);
  if (p.x < ringThickness) {
    // Draw uColor
    gl_FragColor.rgb = HSVToRGB(uColor);
  } else if (p.x < ringThickness * 2.0) {
    // Draw hue ring
    gl_FragColor.rgb = p.y > 0. && uColor.z > angle - margin && uColor.z < angle + margin
      ? markerColor
      : HSVToRGB(vec3(uColor.x, uColor.y, abs(angle)));
  } else if (p.x < ringThickness * 3.0) {
    // Draw saturation ring
    gl_FragColor.rgb = p.y > 0. && uColor.y > angle - margin && uColor.y < angle + margin
      ? markerColor
      : HSVToRGB(vec3(uColor.x, abs(angle), 1.0));
  } else if (p.x < ringThickness * 4.0) {
    // Draw value/brightness ring
    float hue = (3.14 + p.y) / 6.28;
    gl_FragColor.rgb = uColor.x > hue - margin / 3.14 && uColor.x < hue + margin / 3.14
      ? markerColor
      : HSVToRGB(vec3(hue, 1.0, 1.0));
  } else {
    // Draw background
    gl_FragColor = vec4(0.5);
  }
}
`;

export default class Toggle extends React.Component {
  constructor() {
    super();
    this.uniforms = [
      {
        id: 'uColor',
        type: 'color',
        default: [0.5, 0.8, 0.8],
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
    this.updateColorWheel(this.props.value);
  }

  updateColorWheel(color) {
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
        width: popupWidth,
        height: popupHeight,
      },
      overlay: {
        backgroundColor: 'transparent',
      },
    };

    return (
      <div
        style={{ backgroundColor: this.toCssColor(this.props.value) }}
        onClick={this.handleMouseClick}
        className='color-well'>
        <Modal
          isOpen={this.state.isPopupOpen}
          onRequestClose={this.closePopup}
          onAfterOpen={this.handlePopupOpen}
          style={popupStyle}
          contentLabel='Pick a color'>
          <canvas ref={c => this.canvas = c} width="256px" height="256px" />
          <hr />
          <div className='pull-right'>
            <button className='button button-muted' onClick={this.closePopup}>Close</button>
            <button className='button' onClick={this.closePopup}>Pick</button>
          </div>
        </Modal>
      </div>
    );
  }
}
