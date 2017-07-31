const shader = `
precision lowp float;

varying vec2 vUv;

uniform sampler2D uImage;
uniform float uTime;
uniform float uAmount;
uniform vec3 uColor1;
uniform vec3 uColor2;

void main() {
  vec4 src = texture2D(uImage, vUv, 0.0);
  float gray = dot(src.rgb, vec3(0.299, 0.587, 0.114));
  vec3 fx = mix(uColor1, uColor2, gray);
  gl_FragColor.rgb = mix(src.rgb, fx, uAmount);
  gl_FragColor.a = src.a;
}
`;

export default {
  name: 'Vintage',
  description: 'Mix image with gradient to make it look faded',
  shader: shader,
  uniforms: [
    {
      name: 'Amount',
      description: '',
      id: 'uAmount',
      type: 'float',
      min: 0,
      max: 1,
      default: 0.3,
    },
    {
      name: 'Darks',
      description: '',
      id: 'uColor1',
      type: 'color',
      default: [0.3, 0.0, 0.3],
    },
    {
      name: 'Lights',
      description: '',
      id: 'uColor2',
      type: 'color',
      default: [1.0, 0.8, 0.1],
    },
  ],
};
