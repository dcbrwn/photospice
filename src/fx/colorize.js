const shader = `
precision lowp float;

varying vec2 vUv;
uniform sampler2D uImage;

void main() {
  vec4 src = texture2D(uImage, vUv, 0.0);
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
