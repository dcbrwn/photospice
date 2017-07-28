import GLRenderer from './GLRenderer.js';
import _ from 'lodash';

const passtroughEffect = {
  name: 'Passthrough',
  hidden: true,
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
    // I dont know why but I think that this trick with passtrough shader
    // can be useful later on.
    this.addPass(passtroughEffect);
  }

  addPass(effect) {
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
    pass.texture = this.renderer.createTexture();
    pass.program = this.renderer.createProgram(pass.uniforms, pass.shader);
    this.passes.push(pass);
  }

  removePass(pass) {
    this.passes = _.without(this.passes, pass);
    this.renderer.deleteProgram(pass.program);
    this.renderer.deleteTexture(pass.texture);
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
  }

  render(target) {
    this.renderer.setSize(...this.sourceSize);
    this.passes.reduce((prevPassTexture, pass) => {
      if (pass.isDisabled) return prevPassTexture;
      this.renderer.useTexture(prevPassTexture);
      pass._uniforms.uImage.value = prevPassTexture;
      this.renderer.renderToTexture(pass.program, pass.texture);
      return pass.texture;
    }, this.source);
    this.renderer.copyToCanvas(target);
  }
}
