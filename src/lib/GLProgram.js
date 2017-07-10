export default class GLProgram {
  constructor(gl, vertexShaderSource, fragmentShaderSource) {
    const programId = gl.createProgram();
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
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

    gl.attachShader(programId, vertexShader);
    gl.attachShader(programId, fragmentShader);
    gl.linkProgram(programId);

    if (!gl.getProgramParameter(programId, gl.LINK_STATUS)) {
      throw 'Could not compile WebGL program:\n' + gl.getProgramInfoLog(programId);
    }

    this._fragmentShaderId = fragmentShader;
    this._vertexShaderId = vertexShader;
    this.gl = gl;
    this.programId = programId;
  }

  use() {
    this.gl.useProgram(this.programId);
  }

  updateUniforms(uniforms) {
    for (let key in uniforms) {
      const location = this.gl.getUniformLocation(this.programId, key);
      this.gl['uniform' + uniforms[key].type](location, uniforms[key].value);
    }
  }

  destroy() {
    this.gl.deleteProgram(this.programId);
    this.gl.deleteShader(this._fragmentShaderId);
    this.gl.deleteShader(this._vertexShaderId);
  }
}
