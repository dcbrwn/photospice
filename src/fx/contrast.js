const shader = `
precision lowp float;

varying vec2 vUv;
uniform sampler2D uImage;
uniform float uContrast;
uniform float uBrightness;

void main() {
  vec4 src = texture2D(uImage, vUv);
  src.rgb = ((src.rgb - 0.5) * max(uContrast, 0.0)) + 0.5;
  src.rgb += uBrightness;
  gl_FragColor.rgb = src.rgb;
  gl_FragColor.a = src.a;
}
`;

export default {
  name: 'Contrast and Brightness',
  description: '',
  shader: shader,
  uniforms: [
    {
      name: 'Contrast',
      description: '',
      id: 'uContrast',
      type: 'float',
      min: 1,
      max: 5,
      default: 1.0,
    },
    {
      name: 'Brightness',
      description: '',
      id: 'uBrightness',
      type: 'float',
      min: -1,
      max: 1,
      default: 0,
    },
  ],
};
