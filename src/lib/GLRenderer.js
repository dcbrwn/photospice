import { isPowerOfTwo, toPowerOfTwo } from './math.js';

const passthroughVS = `
  attribute vec4 aPosition;
  attribute vec2 aTexCoord;

  varying vec2 vUv;

  void main() {
    gl_Position = aPosition;
    vUv = aTexCoord;
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

const locationSymbol = Symbol();
const typeSymbol = Symbol();

function resizeToPowerOfTwo(image) {
  const size = Math.max(image.width, image.height);
  // TODO: detect max resolution for textures
  const alignedSize = toPowerOfTwo(Math.min(2048, size));
  const canvas = document.createElement('canvas');
  canvas.width = alignedSize;
  canvas.height = alignedSize;
  canvas.getContext('2d').drawImage(image, 0, alignedSize - image.height);
  return canvas;
}

export default class GLRenderer {
  constructor(width, height) {
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl');

    if (!this.gl) {
      throw new Error('WebGL is not supported');
    }

    const gl = this.gl;

    // Texture coords are calculated during renderer resize
    this.textureBuffer = null;
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData.buffer, gl.STATIC_DRAW);

    if (arguments.length >= 2) this.setSize(width, height);
  }

  setSize(width, height) {
    const gl = this.gl;
    const aligned = toPowerOfTwo(Math.max(width, height));

    if (aligned > 2048) {
      // TODO: detect max resolution for textures
      // TODO: more detailed message based on the above
      throw new Error('New renderer size is too big');
    }

    this.canvas.width = aligned;
    this.canvas.height = aligned;
    this.textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureData.buffer, gl.STATIC_DRAW);
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

    for (let uniform of uniforms) {
      uniform[locationSymbol] = gl.getUniformLocation(program, uniform.id);
      uniform[typeSymbol] = uniformTypeMapping[uniform.type];
      if (!uniform[typeSymbol]) {
        throw new Error(`Unknown uniform type "${uniform[typeSymbol]}"`);
      }
      // NOTE: Mutating uniforms object inside of renderer
      uniform.value = uniform.default;
    }

    return program;
  }

  updateProgram(program, uniforms, fragmentShaderSource) {
    this.useProgram(program);
    for (let uniform of uniforms) {
      this.gl[uniform[typeSymbol]](uniform[locationSymbol], uniform.value);
    }
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

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoord);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.disableVertexAttribArray(aPosition);
    gl.disableVertexAttribArray(aTexCoord);
  }

  renderToTexture(program, texture) {
    this.render(program);
    this.updateTexture(texture, this.canvas);
  }
}
