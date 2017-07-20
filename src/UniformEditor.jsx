import React from 'react';
import Toggle from './Toggle.jsx';
import Slider from './Slider.jsx';

export default class UniformEditor extends React.Component {
  renderFloat() {
    const uniform = this.props.uniform;
    return <div>
      <span>{uniform.name}</span>
      <Slider
        min={uniform.min}
        max={uniform.max}
        step={0}
        value={this.props.value || uniform.default}
        onChange={this.props.onChange} />
    </div>;
  }

  renderVec2() {
    const uniform = this.props.uniform;
    const value = this.props.value || uniform.default;
    const x = uniform.components[0];
    const y = uniform.components[1];
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

  render() {
    switch (this.props.uniform.type) {
      case 'float':
        return this.renderFloat();
      case 'vec2':
        return this.renderVec2();
    }
  }
}
