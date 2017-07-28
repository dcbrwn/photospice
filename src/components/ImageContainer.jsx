import React from 'react';
import _ from 'lodash';
import { clamp, luminance } from '../lib/math.js';
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

  reset() {
    this.setState({
      posX: 0,
      posY: 0,
      zoom: 1,
    });
  }

  fit() {
    const container = this.container.getBoundingClientRect();
    const wrapper = this.wrapper.getBoundingClientRect();
    let zoom = 1;
    const width = wrapper.width / this.state.zoom;
    const height = wrapper.height / this.state.zoom;

    if (width > container.width || height > container.height) {
      zoom = Math.min(width / container.width, height / container.height);
    }

    this.setState({
      posX: 0,
      posY: 0,
      zoom: zoom,
    });
  }

  @bound
  handleZoom(event) {
    const minZoom = 0.1;
    const maxZoom = 10;

    const isLimitReached = (this.state.zoom <= minZoom && event.deltaY > 0) ||
      (this.state.zoom >= maxZoom && event.deltaY < 0);

    if (isLimitReached) return;

    const factor = event.deltaY < 0 ? 1.2 : 0.8;
    const container = this.container.getBoundingClientRect();

    // position (0, 0) corresponds to center of container so we need to take
    // its width into account.
    const dx = (event.pageX - (container.left + container.width / 2)) - this.state.posX;
    const dy = (event.pageY - (container.top + container.height / 2)) - this.state.posY;

    this.setState({
      posX: this.state.posX + dx / 5,
      posY: this.state.posY + dy / 5,
      zoom: clamp(this.state.zoom * factor, minZoom, maxZoom),
    });
  }

  @bound
  handleImageClick(event) {
    event.preventDefault();
    const self = this;
    let px = event.clientX;
    let py = event.clientY;

    const handleMouseMove = _.throttle(function(event) {
      self.setState({
        posX: self.state.posX + event.clientX - px,
        posY: self.state.posY + event.clientY - py,
      });
      px = event.clientX;
      py = event.clientY;
    }, 30);

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  toCssColor(color) {
    return `rgb(${color[0] * 255 | 0}, ${color[1] * 255 | 0}, ${color[2] * 255 | 0})`;
  }

  render() {
    const wrapperTransform = `
      translate(-50%, -50%)
      translate(${this.state.posX}px, ${this.state.posY}px)
      scale(${this.state.zoom})
    `;
    const actionsClass = luminance(...this.state.color) < 0.6
      ? 'image-container-actions'
      : 'image-container-actions inverse';
    return (
      <div
        className='image-container'
        onWheel={this.handleZoom}
        onDoubleClick={() => this.reset()}
        onMouseDown={this.handleImageClick}
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
        <div className={actionsClass}>
          {/* <button
            className='button'
            onClick={() => this.fit()}>
            FT
          </button> */}
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
