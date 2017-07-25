import React from 'react';
import Toggle from './Toggle.jsx';
import Slider from './Slider.jsx';
import ColorWell from './ColorWell.jsx';

export default class UniformEditor extends React.Component {
  renderFloat() {
    const uniform = this.props.uniform;
    return <div>
      <span>{uniform.name}</span>
      <Slider
        min={uniform.min}
        max={uniform.max}
        value={this.props.value}
        onChange={this.props.onChange} />
    </div>;
  }

  renderVec2() {
    const uniform = this.props.uniform;
    const value = this.props.value;
    const [x, y] = uniform.components || [{ name: 'x' }, { name: 'y' }];
    return <div>
      <span>{uniform.name}: {x.name}</span>
      <Slider
        min={x.min}
        max={x.max}
        step={0}
        value={value[0]}
        onChange={(v) => this.props.onChange([v, value[1]])} />
      <span>{uniform.name}: {y.name}</span>
      <Slider
        min={y.min}
        max={y.max}
        step={0}
        value={value[1]}
        onChange={(v) => this.props.onChange([value[0], v])} />
    </div>;
  }

  renderColor() {
    const uniform = this.props.uniform;
    return <div>
      <span>{uniform.name}</span>
      <ColorWell
        value={this.props.value}
        onChange={this.props.onChange} />
    </div>;
  }

  render() {
    const uniform = this.props.uniform;

    if (uniform.hidden) return null;

    switch (uniform.type) {
      case 'float':
        return this.renderFloat();
      case 'vec2':
        return this.renderVec2();
      case 'color':
        return this.renderColor();
    }

    return null;
  }
}
