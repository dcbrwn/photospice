import React from 'react';
import { bound } from '../lib/commonDecorators';
import ColorWell from './ColorWell';

export default class ImageContainer extends React.Component {
  state = {
    color: [0.5, 0.5, 0.5],
    posX: 0,
    posY: 0,
    zoom: 1,
    colorPickerOpened: false,
  };

  @bound
  toggleColorPicker() {
    this.setState({ colorPickerOpened: !this.state.colorPickerOpened });
  }

  center() {
    const containerRect = this.container.getBoundingClientRect();
    const wrapperRect = this.wrapper.getBoundingClientRect();
    this.setState({
      posX: containerRect.width / 2 - wrapperRect.width / 2,
      posY: containerRect.height / 2 - wrapperRect.height / 2,
    });
  }

  toCssColor(color) {
    return `rgb(${color[0] * 255 | 0}, ${color[1] * 255 | 0}, ${color[2] * 255 | 0})`;
  }

  render() {
    const wrapperTransform = `
      translate(${this.state.posX}px, ${this.state.posY}px)
      scale(${this.state.zoom})
    `;
    return (
      <div
        className='image-container'
        ref={(container) => this.container = container}
        style={{ backgroundColor: this.toCssColor(this.state.color) }}>
        <div
          className='image-container-wrapper'
          ref={(wrapper) => this.wrapper = wrapper}
          style={{
            transform: wrapperTransform
          }}>
          {this.props.children}
        </div>
        <div className='image-container-actions'>
          <button
            className={ 'button' + (this.state.colorPickerOpened ? ' active' : '') }
            onClick={this.toggleColorPicker}>
            BG
          </button>
          <div
            className={ 'color-buttons' + (this.state.colorPickerOpened ? ' active' : '') }>
            <button
              className='button'
              style={{ backgroundColor: 'white' }}
              onClick={() => this.setState({ color: [1, 1, 1] })}>
            </button>
            <button
              className='button'
              style={{ left: '25%', backgroundColor: 'grey' }}
              onClick={() => this.setState({ color: [0.5, 0.5, 0.5] })}>
            </button>
            <button
              className='button'
              style={{ left: '50%', backgroundColor: 'black' }}
              onClick={() => this.setState({ color: [0, 0, 0] })}>
            </button>
            <ColorWell
              value={this.state.color}
              onChange={(color) => this.setState({ color: color })} />
          </div>
        </div>
      </div>
    );
  }
}
