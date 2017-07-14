import GLProgram from './GLProgram.js';
import { toPowerOfTwo } from './math.js';

const passthroughVS = `
  attribute vec4 aPosition;

  void main() {
    gl_Position = aPosition;
  }
`;

const quadData = new Float32Array([
  1.0, 1.0, 0.0,
  -1.0, 1.0, 0.0,
  1.0, -1.0, 0.0,
  -1.0, -1.0, 0.0,
]);

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
    this.images = [];
    this.uniforms = this.createUniforms();
  }

  createUniforms() {
    return Object.create({
      uResolution: {
        type: '2fv',
        // Until image is not loaded we cant say anything about dimensions
        value: [0, 0],
      },
      uTime: {
        // Will be used for animations
        type: '1f',
        value: 0.0,
      },
      uImage: {
        type: '1i',
        value: 0,
      },
    }, {});
  }

  addPass(fragmentShader, uniforms) {
    const gl = this.gl;
    const textureId = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, textureId);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    this.passes.push({
      program: new GLProgram(this.gl, passthroughVS, fragmentShader),
      uniforms: uniforms,
      textureId: textureId,
    });
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
    this.passes.reduce((prevPassTexture, pass) => {
      const gl = this.gl;
      const program = pass.program;

      // TODO: this can be done one time.
      const aPosition = gl.getAttribLocation(program.programId, 'aPosition');
      const uTime = gl.getUniformLocation(program.programId, 'uTime');
      const uResolution = gl.getUniformLocation(program.programId, 'uResolution');
      const uImage = gl.getUniformLocation(program.programId, 'uImage');

      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
      program.use();
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, prevPassTexture);
      gl.uniform1i(uImage, prevPassTexture);
      gl.uniform2fv(uResolution, [
        this.source.resized.width,
        this.source.resized.height,
      ]);
      gl.uniform1f(uTime, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(aPosition);

      gl.bindTexture(gl.TEXTURE_2D, pass.textureId);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
      gl.generateMipmap(gl.TEXTURE_2D);

      return pass.textureId;
    }, this.source.textureId);

    target.width = this.source.original.width;
    target.height = this.source.original.height;
    const ctx = target.getContext('2d');
    ctx.drawImage(this.canvas, 0, 0);
  }
}
