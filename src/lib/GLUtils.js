const quadVertices = new Float32Array([
  1.0, 1.0, 0.0,
  -1.0, 1.0, 0.0,
  1.0, -1.0, 0.0,
  -1.0, -1.0, 0.0,
]);

export default class GLUtils {
  static initGL(canvas) {
    const gl = canvas.getContext('webgl');

    if (!gl) {
      throw 'WebGL is not supported';
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    return gl;
  }

  static scheduleRender(renderer) {
    let prevTime = Date.now() / 1000.0;

    function render() {
      const currentTime = Date.now() / 1000.0;
      const deltaTime = currentTime - prevTime;
      prevTime = currentTime;

      renderer(deltaTime);
      return requestAnimationFrame(render);
    }

    return render();
  }

  static compileProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const program = gl.createProgram();
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

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw 'Could not compile WebGL program:\n' + gl.getProgramInfoLog(program);
    }

    return program;
  }

  static get quadVertices() {
    return quadVertices;
  }

  static toPowerOfTwo(value) {
    return Math.pow(2, Math.log2(value + 0.5));
  }
}
