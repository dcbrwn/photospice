import React from 'react';
import _ from 'lodash';
import { clamp, luminance } from '../lib/math.js';
import { bound, toCssColor } from '../lib/utils';
import ColorWell from './ColorWell';

export default class ImageContainer extends React.Component {
  state = {
    color: [0.5, 0.5, 0.5],
    posX: 0,
    posY: 0,
    zoom: 1,
    colorPickerOpened: false,
  };

  prevView = {
    posX: 0,
    posY: 0,
    zoom: 1,
  };

  getZoomToFitImage() {
    const container = this.container.getBoundingClientRect();
    const wrapper = this.wrapper.getBoundingClientRect();
    let zoom = 1;
    const width = wrapper.width / this.state.zoom;
    const height = wrapper.height / this.state.zoom;

    if (width < container.width && height < container.height) {
      zoom = 1;
    } else if (height >= width) {
      zoom = container.height / height;
    } else {
      zoom = container.width / width;
    }

    return zoom;
  }

  reset() {
    this.setState({
      posX: 0,
      posY: 0,
      zoom: 1,
    });
  }

  fit() {
    this.setState({
      posX: 0,
      posY: 0,
      zoom: this.getZoomToFitImage(),
    });
  }

  @bound
  toggleColorPicker() {
    this.setState({ colorPickerOpened: !this.state.colorPickerOpened });
  }

  @bound
  toggleViewSettings() {
    const currentView = _.pick(this.state, ['posX', 'posY', 'zoom']);
    const fitView = {
      posX: 0,
      posY: 0,
      zoom: this.getZoomToFitImage(),
    };

    if (_.isEqual(currentView, fitView)) {
      this.setState(this.prevView);
    } else {
      this.prevView = currentView;
      this.setState(fitView);
    }
  }

  @bound
  updateZoom(event) {
    const minZoom = 0.1;
    const maxZoom = 10;
    const factor = event.deltaY < 0 ? 1.25 : 0.8;
    const zoom = this.state.zoom * factor;
    if (zoom > maxZoom || zoom < minZoom) return;
    const [ix, iy] = this.pageToImageSpace(event.pageX, event.pageY);
    const dx = (ix * factor - ix) * zoom;
    const dy = (iy * factor - iy) * zoom;
    this.setState({
      posX: this.state.posX - dx,
      posY: this.state.posY - dy,
      zoom: clamp(zoom, minZoom, maxZoom),
    });
  }

  @bound
  startImageMove(event) {
    event.preventDefault();
    const self = this;
    let px = event.clientX;
    let py = event.clientY;

    const handleMouseMove = _.throttle(function(event) {
      self.setState({
        posX: self.state.posX + (event.clientX - px),
        posY: self.state.posY + (event.clientY - py),
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

  pageToImageSpace(pageX, pageY) {
    const container = this.container.getBoundingClientRect();
    const containerX = pageX - (container.left + container.width / 2);
    const containerY = pageY - (container.top + container.height / 2);
    const imageX = (containerX - this.state.posX) / this.state.zoom;
    const imageY = (containerY - this.state.posY) / this.state.zoom;
    return [imageX, imageY];
  }

  render() {
    const wrapperTransform = `
      translate(-50%, -50%)
      translate(${this.state.posX}px, ${this.state.posY}px)
      scale(${this.state.zoom})
    `;
    return (
      <div
        className='image-container'
        onWheel={this.updateZoom}
        onDoubleClick={this.toggleViewSettings}
        onMouseDown={this.startImageMove}
        ref={(container) => this.container = container}
        style={{ backgroundColor: toCssColor(this.state.color) }}>
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
            className='button hide-ui-button'
            title='Hide interface'
            onClick={this.props.toggleCompactMode}>
          </button>
          <button
            className={ 'button bg-button' + (this.state.colorPickerOpened ? ' active' : '') }
            title='Change background color'
            onClick={this.toggleColorPicker}>
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
