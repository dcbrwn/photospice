const shader = `
precision lowp float;

uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uResolution;
uniform float uAmount;
uniform float uScale;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 src = texture2D(uImage, uv, 0.0);
  gl_FragColor = src * (1.0 - (1.0 + sin(gl_FragCoord.y / uScale)) / 2.0 * uAmount);
  gl_FragColor.a = src.a;
}
`;

export default {
  name: 'Scaline',
  description: '',
  shader: shader,
  uniforms: [
    {
      name: 'Amount',
      id: 'uAmount',
      type: 'float',
      default: 0.3,
    },
    {
      name: 'Scale',
      id: 'uScale',
      type: 'float',
      default: 1,
      min: 0.3,
      max: 5,
    },
  ],
};
