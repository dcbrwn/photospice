import React from 'react';
import _ from 'lodash';
import { clamp } from '../lib/math';
import { bound, toCssColor, classes, dragHelper } from '../lib/utils';
import ColorWell from './ColorWell';

export default class ImageContainer extends React.Component {
  state = {
    color: [0.22, 0.25, 0.28],
    posX: 0,
    posY: 0,
    zoom: 1,
    isColorPickerOpened: false,
  };

  prevView = null;

  pageToImageSpace(pageX, pageY) {
    const container = this.container.getBoundingClientRect();
    const containerX = pageX - (container.left + container.width / 2);
    const containerY = pageY - (container.top + container.height / 2);
    const imageX = (containerX - this.state.posX) / this.state.zoom;
    const imageY = (containerY - this.state.posY) / this.state.zoom;
    return [imageX, imageY];
  }

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

  pickColor(color) {
    this.setState({
      color: color,
      isColorPickerOpened: false,
    });
  }

  @bound
  toggleColorPicker() {
    this.setState({ isColorPickerOpened: !this.state.isColorPickerOpened });
  }

  closeColorPicker() {
    this.setState({ isColorPickerOpened: false });
  }

  @bound
  toggleViewSettings() {
    const currentView = _.pick(this.state, ['posX', 'posY', 'zoom']);
    const fitView = {
      posX: 0,
      posY: 0,
      zoom: this.getZoomToFitImage(),
    };

    if (this.prevView && _.isEqual(currentView, fitView)) {
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
    const dx = (ix * factor - ix) * this.state.zoom;
    const dy = (iy * factor - iy) * this.state.zoom;
    this.setState({
      posX: this.state.posX - dx,
      posY: this.state.posY - dy,
      zoom: clamp(zoom, minZoom, maxZoom),
    });
  }

  startImageMove = dragHelper({
    onStart: (event) => {
      this.closeColorPicker();
      return {
        x: event.clientX,
        y: event.clientY,
      };
    },
    onMove: (prev, event) => {
      this.setState({
        posX: this.state.posX + (event.clientX - prev.x),
        posY: this.state.posY + (event.clientY - prev.y),
      });
      prev.x = event.clientX;
      prev.y = event.clientY;
    },
  });

  render() {
    const wrapperTransform = `
      translate(-50%, -50%)
      translate(${this.state.posX}px, ${this.state.posY}px)
      scale(${this.state.zoom})
    `;
    const activeClass = {
      'active': this.state.isColorPickerOpened,
    };
    const actionsClass = classes('image-container-actions', 'hide-sm', activeClass);
    const bgButtonClass = classes('button bg-button', activeClass);
    const colorButtonsClass = classes('color-buttons', activeClass);
    return (
      <div className='image-container'>
        <div
          className='image-container-backdrop'
          onWheel={this.updateZoom}
          onDoubleClick={this.toggleViewSettings}
          onTouchStart={this.startImageMove}
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
        </div>
        <div className={actionsClass}>
          <button
            className='button hide-ui-button'
            title='Hide interface'
            onClick={this.props.toggleCompactMode}>
          </button>
          <button
            className={bgButtonClass}
            title='Change background color'
            onClick={this.toggleColorPicker}>
          </button>
          <div
            className={colorButtonsClass}>
            <button
              className='button'
              aria-label='Set background to white'
              style={{ backgroundColor: 'white' }}
              onClick={() => this.pickColor([1, 1, 1])}>
            </button>
            <button
              className='button'
              aria-label='Set background to grey'
              style={{ left: '25%', backgroundColor: 'grey' }}
              onClick={() => this.pickColor([0.5, 0.5, 0.5])}>
            </button>
            <button
              className='button'
              aria-label='Set background to black'
              style={{ left: '50%', backgroundColor: 'black' }}
              onClick={() => this.pickColor([0, 0, 0])}>
            </button>
            <ColorWell
              value={this.state.color}
              onChange={(color) => this.pickColor(color)} />
          </div>
        </div>
      </div>
    );
  }
}
