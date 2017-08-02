import GLRenderer from './GLRenderer';
import _ from 'lodash';

const passtroughEffect = {
  shader: `
    precision lowp float;

    varying vec2 vUv;
    uniform sampler2D uImage;

    void main() {
      gl_FragColor = texture2D(uImage, vUv, 0.0);
    }
  `,
  uniforms: [],
};

export default class EffectProcessor {
  constructor() {
    this.renderer = new GLRenderer();
    this.passes = [];
    this.source = null;
    this.sourceSize = null;
    this.passtrough = this.createPass(passtroughEffect, false);
  }

  createPass(effect, isIntermediate = true) {
    const pass = _.cloneDeep(effect);
    // BuiltIn uniforms
    pass._uniforms = {
      uImage: {
        hidden: true,
        id: 'uImage',
        type: 'sampler2D',
        default: 0,
      },
    };
    pass.uniforms = _.values(pass._uniforms).concat(pass.uniforms);
    pass.prevState = null;
    if (isIntermediate) pass.texture = this.renderer.createTexture();
    pass.program = this.renderer.createProgram(pass.uniforms, pass.shader);
    return pass;
  }

  invalidatePassesFromPos(position) {
    return this.passes
      .slice(position)
      .forEach((pass) => pass.prevState = null);
  }

  addPass(effect, position = this.passes.length) {
    const pass = this.createPass(effect);
    this.passes.splice(position, 0, pass);
    this.invalidatePassesFromPos(position);
    return position;
  }

  removePassAt(position) {
    const [pass] = this.passes.splice(position, 1);

    this.renderer.deleteProgram(pass.program);
    this.renderer.deleteTexture(pass.texture);

    if (position <= this.passes.length - 1) {
      this.invalidatePassesFromPos(position);
    }
  }

  removePass(pass) {
    const position = this.passes.indexOf(pass);
    return this.removePassAt(position);
  }

  movePass(oldPosition, newPosition) {
    const temp = this.passes[newPosition];
    this.passes[newPosition] = this.passes[oldPosition];
    this.passes[oldPosition] = temp;
    this.invalidatePassesFromPos(Math.min(oldPosition, newPosition));
  }

  loadImage(source) {
    const image = new Image();
    const result = new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
    });
    image.src = source;
    return result;
  }

  async useImage(imageSrc) {
    const image = await this.loadImage(imageSrc);
    this.source = this.renderer.createTexture(image);
    this.sourceSize = [image.width, image.height];
    this.isDirty = true;
  }

  render(target) {
    let isDirty = false;
    this.renderer.setSize(...this.sourceSize);
    const result = this.passes.reduce((prevPassTexture, pass) => {
      pass._uniforms.uImage.value = prevPassTexture;

      const currentState = JSON.stringify({
        isDisabled: pass.isDisabled,
        uniforms: pass.uniforms,
      });

      isDirty = isDirty || currentState !== pass.prevState;
      pass.prevState = currentState;

      if (pass.isDisabled) {
        return prevPassTexture;
      }

      if (isDirty) {
        this.renderer.renderToTexture(pass.program, pass.texture);
      }

      return pass.texture;
    }, this.source);
    this.renderer.useTexture(result);
    this.passtrough._uniforms.uImage.value = result;
    this.renderer.render(this.passtrough.program);
    this.renderer.copyToCanvas(target);
    this.isDirty = false;
  }
}
