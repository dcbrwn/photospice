const shader = `
precision lowp float;

uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uTintShift;
uniform float uTintAmount;
uniform float uTintColor;
uniform float uTintScale;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 src = texture2D(uImage, uv, 0.0);
  vec4 tint = mix(src, vec4(uTintColor), length(uv * uTintScale + uTintShift));
  gl_FragColor = mix(src, tint, uTintAmount);
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
      id: 'uTintAmount',
      type: 'float',
      default: 0.8,
    },
    {
      name: 'Color',
      id: 'uTintColor',
      type: 'float',
      default: 1,
    },
    {
      name: 'Scale',
      id: 'uTintScale',
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
        { name: 'x', min: -5, max: 5 },
        { name: 'y', min: -5, max: 5 },
      ],
      default: [0.5, 0.5],
    },
  ],
};
