import GLProgram from './GLProgram.js';
import { toPowerOfTwo } from './math.js';
import _ from 'lodash';

const passthroughVS = `
  attribute vec4 aPosition;

  void main() {
    gl_Position = aPosition;
  }
`;

const passthroughFS = `
  precision lowp float;

  uniform sampler2D uImage;
  uniform vec2 uResolution;

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec4 src = texture2D(uImage, uv, 0.0);
    gl_FragColor = src;
  }
`;

const passtroughEffect = {
  name: 'Passthrough',
  isInternal: true,
  shader: passthroughFS,
  uniforms: [],
};

const quadData = new Float32Array([
  1.0, 1.0, 0.0,
  -1.0, 1.0, 0.0,
  1.0, -1.0, 0.0,
  -1.0, -1.0, 0.0,
]);

const builtinUniforms = [
  {
    id: 'uResolution',
    type: 'vec2',
    default: [0, 0],
  },
  {
    id: 'uTime',
    type: 'float',
    default: 0.0,
  },
  {
    id: 'uImage',
    type: 'sampler2D',
    default: 0,
  },
];

const uniformTypeMapping = {
  float: 'uniform1f',
  int: 'uniform1i',
  vec2: 'uniform2fv',
  vec3: 'uniform3fv',
  color: 'uniform3fv',
  sampler2D: 'uniform1i',
};

export default class EffectProcessor {
  constructor() {
    this.canvas = document.createElement('canvas');
    const gl = this.gl = this.canvas.getContext('webgl');

    if (!this.gl) {
      throw new Error('WebGL is not supported');
    }

    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadData.buffer, gl.STATIC_DRAW);

    this.passes = [];
    this.source = null;

    // I dont know why but I think that this trick with passtrough shader
    // can be useful later on.
    this.addPass(passtroughEffect);
  }

  addPass(effect) {
    const pass = _.cloneDeep(effect);
    const gl = this.gl;

    // Create a gl program using pass shader
    pass._program = new GLProgram(this.gl, passthroughVS, pass.shader);

    // Create texture to hold pass rendering result
    pass._textureId = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, pass._textureId);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    pass.uniforms.forEach((uniform) => {
      uniform._location = gl.getUniformLocation(pass._program.programId, uniform.id);
      uniform._type = uniformTypeMapping[uniform.type];
      uniform.value = uniform.default;
    });

    pass._builtinUniforms = builtinUniforms.reduce((acc, uniform) => {
      acc[uniform.id] = {
        _location: gl.getUniformLocation(pass._program.programId, uniform.id),
        _type: uniformTypeMapping[uniform.type],
        set(value) {
          return gl[this._type](this._location, value);
        },
      };
      return acc;
    }, {});

    this.passes.push(pass);
  }

  removePass(pass) {
    this.passes = _.without(this.passes, pass);
    pass._program.destroy();
    this.gl.deleteTexture(pass._textureId);
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

  resizeToPowerOfTwo(image) {
    const size = Math.max(image.width, image.height);
    const alignedSize = toPowerOfTwo(Math.min(2048, size));
    const canvas = document.createElement('canvas');
    canvas.width = alignedSize;
    canvas.height = alignedSize;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    return canvas;
  }

  async useImage(imageSrc) {
    const gl = this.gl;
    const image = await this.loadImage(imageSrc);
    const resizedImage = this.resizeToPowerOfTwo(image);
    this.canvas.width = resizedImage.width;
    this.canvas.height = resizedImage.height;
    gl.viewport(0, 0, resizedImage.width, resizedImage.height);

    this.source = {
      original: image,
      resized: resizedImage,
      textureId: gl.createTexture(),
    };

    gl.bindTexture(gl.TEXTURE_2D, this.source.textureId);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resizedImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    console.log(`Image loaded. Canvas resized to ${resizedImage.width}x${resizedImage.height}.`);
  }

  render(target) {
    const gl = this.gl;
    const uResolution = [this.source.resized.width, this.source.resized.height];

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);

    this.passes.reduce((prevPassTexture, pass) => {
      const program = pass._program;

      // Prepare for pass rendering
      program.use();
      const aPosition = gl.getAttribLocation(program.programId, 'aPosition');
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, prevPassTexture);

      // Update uniforms
      pass._builtinUniforms.uImage.set(prevPassTexture);
      pass._builtinUniforms.uResolution.set(uResolution);
      for (let uniform of pass.uniforms) {
        gl[uniform._type](uniform._location, uniform.value);
      }

      // Draw quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.disableVertexAttribArray(aPosition);

      // Store pass result into a texture
      gl.bindTexture(gl.TEXTURE_2D, pass._textureId);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
      gl.generateMipmap(gl.TEXTURE_2D);

      return pass._textureId;
    }, this.source.textureId);

    target.width = this.source.original.width;
    target.height = this.source.original.height;
    const ctx = target.getContext('2d');
    ctx.drawImage(this.canvas, 0, 0);
  }
}
