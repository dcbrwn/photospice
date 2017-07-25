const shader = `
precision lowp float;

varying vec2 vUv;
uniform sampler2D uImage;
uniform vec3 uColor;

void main() {
  vec4 src = texture2D(uImage, vUv, 0.0);
  gl_FragColor.rgb = src.rgb * uColor;
  gl_FragColor.a = src.a;
}
`;

export default {
  name: 'Colorize',
  description: '',
  shader: shader,
  uniforms: [
    {
      name: 'Color',
      description: '',
      id: 'uColor',
      type: 'color',
      default: [0.4, 1.0, 0.2],
    },
  ],
};
