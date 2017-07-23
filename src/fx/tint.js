const shader = `
precision lowp float;

varying vec2 vUv;

uniform sampler2D uImage;
uniform vec2 uTintShift;
uniform float uAmount;
uniform float uColor;
uniform float uScale;

void main() {
  vec4 src = texture2D(uImage, vUv, 0.0);
  vec4 tint = mix(src, vec4(uColor), length((vUv + uTintShift) * uScale));
  gl_FragColor = mix(src, tint, uAmount);
  gl_FragColor.a = src.a;
}
`;

export default {
  name: 'Tint',
  description: '',
  shader: shader,
  uniforms: [
    {
      name: 'Amount',
      id: 'uAmount',
      type: 'float',
      default: 0.8,
    },
    {
      name: 'Color',
      id: 'uColor',
      type: 'float',
      default: 1,
    },
    {
      name: 'Scale',
      id: 'uScale',
      type: 'float',
      default: 1,
      min: 0.1,
      max: 10,
    },
    {
      name: 'Shift',
      id: 'uTintShift',
      type: 'vec2',
      components: [
        { name: 'x', min: -1, max: 1 },
        { name: 'y', min: -1, max: 1 },
      ],
      default: [0, 0],
    },
  ],
};
