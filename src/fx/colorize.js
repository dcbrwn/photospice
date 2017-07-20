const shader = `
precision lowp float;

uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 src = texture2D(uImage, uv, 0.0);
  gl_FragColor.rgb = src.rgb * vec3(0.4, 1.0, 0.2);
  gl_FragColor.a = src.a;
}
`;

export default {
  name: 'Colorize',
  description: '',
  shader: shader,
  uniforms: [],
};
