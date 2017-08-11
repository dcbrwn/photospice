import { isPowerOfTwo, toPowerOfTwo } from './math';

// TODO: detect max resolution for textures
const MAX_TEXTURE_RESOLUTION = 4096;

const passthroughVS = `
  attribute vec4 aPosition;
  attribute vec2 aTexCoord;

  varying vec2 vUv;

  void main() {
    vUv = aTexCoord;
    gl_Position = aPosition;
  }
`;

const vertexData = new Float32Array([
  1.0, 1.0, 0.0,
  -1.0, 1.0, 0.0,
  1.0, -1.0, 0.0,
  -1.0, -1.0, 0.0,
]);

const textureData = new Float32Array([
  1, 1,
  0, 1,
  1, 0,
  0, 0,
]);

const uniformTypeMapping = {
  float: 'uniform1f',
  int: 'uniform1i',
  vec2: 'uniform2fv',
  vec3: 'uniform3fv',
  color: 'uniform3fv',
  sampler2D: 'uniform1i',
};

// NOTE: Symbol polyfill doesn't work for IE11
const symbols = {
  cache: '_glr_cache',
  uniforms: '_glr_uniforms',
};

function resizeToPowerOfTwo(image) {
  const size = Math.max(image.width, image.height);
  const alignedSize = toPowerOfTwo(Math.min(MAX_TEXTURE_RESOLUTION, size));
  const canvas = document.createElement('canvas');
  canvas.width = alignedSize;
  canvas.height = alignedSize;
  canvas.getContext('2d').drawImage(image, 0, alignedSize - image.height);
  return canvas;
}

export default class GLRenderer {
  constructor(width, height) {
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

    if (!this.gl) {
      throw new Error('WebGL is not supported');
    }

    const gl = this.gl;

    this.textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureData.buffer, gl.STATIC_DRAW);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData.buffer, gl.STATIC_DRAW);

    if (arguments.length >= 2) this.setSize(width, height);
  }

  setSize(width, height) {
    if (this.canvas.width === width && this.canvas.height === height) return;

    const gl = this.gl;
    const aligned = toPowerOfTwo(Math.max(width, height));

    if (aligned > MAX_TEXTURE_RESOLUTION) {
      throw new Error(`Rendering of images larger than ${MAX_TEXTURE_RESOLUTION} is not supported yet.`);
    }

    this.width = width;
    this.height = height;
    this.canvas.width = aligned;
    this.canvas.height = aligned;
    gl.viewport(0, 0, aligned, aligned);
  }

  createTexture(source) {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    if (source) this.updateTexture(texture, source);
    return texture;
  }

  updateTexture(texture, source) {
    const gl = this.gl;
    const image = source.width === source.height && isPowerOfTwo(source.width)
      ? source
      : resizeToPowerOfTwo(source);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  useTexture(texture) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  }

  deleteTexture(texture) {
    this.gl.deleteTexture(texture);
  }

  createProgram(uniforms, fragmentShaderSource) {
    const gl = this.gl;
    const program = gl.createProgram();

    // Compile shaders

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, passthroughVS);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      throw 'Could not compile vertex shader:\n' + gl.getShaderInfoLog(vertexShader);
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      throw 'Could not compile vertex shader:\n' + gl.getShaderInfoLog(fragmentShader);
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw 'Could not compile WebGL program:\n' + gl.getProgramInfoLog(program);
    }

    this.useProgram(program);

    // Bind buffers

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoord);

    // Locate and initialize uniforms

    const cache = {};

    for (let uniform of uniforms) {
      const type = uniformTypeMapping[uniform.type];
      if (!type) {
        throw new Error(`Unknown uniform type "${type}"`);
      }
      cache[uniform.id] = {
        type: uniformTypeMapping[uniform.type],
        location: gl.getUniformLocation(program, uniform.id),
      };
      uniform.value = uniform.default;
    }

    program[symbols.uniforms] = uniforms;
    program[symbols.cache] = cache;

    return program;
  }

  useProgram(program) {
    this.gl.useProgram(program);
  }

  deleteProgram(program) {
    // TODO: Check if manual removal of shaders is needed
    this.gl.deleteProgram(program);
  }

  render(program) {
    const gl = this.gl;
    this.useProgram(program);
    const iCanvasResolution = gl.getUniformLocation(program, 'iCanvasResolution');
    gl.uniform2fv(iCanvasResolution, [this.canvas.width, this.canvas.height]);
    const iImageResolution = gl.getUniformLocation(program, 'iImageResolution');
    gl.uniform2fv(iImageResolution, [this.width, this.height]);
    for (let uniform of program[symbols.uniforms]) {
      const cache = program[symbols.cache][uniform.id];
      if (uniform.type === 'sampler2D') {
        this.useTexture(uniform.value);
      }
      gl[cache.type](cache.location, uniform.value);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  renderToTexture(program, texture) {
    this.render(program);
    this.updateTexture(texture, this.canvas);
  }

  copyToCanvas(target) {
    target.width = this.width;
    target.height = this.height;
    target.getContext('2d').drawImage(
      this.canvas,
      0,
      this.canvas.height - this.height,
      this.width,
      this.height,
      0,
      0,
      this.width,
      this.height);
  }
}
