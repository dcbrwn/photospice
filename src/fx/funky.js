const shader = `
precision lowp float;

uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uResolution;
uniform float uVintageAmount;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  // vec4 src = mix(texture2D(uImage, uv, 0.0), vec4(1.0, 1.0, 1.0, 1.0), length(vec2((uv.x - 0.6), (uv.y - 0.5))));
  vec4 src = texture2D(uImage, uv, 0.0);
  float gray = dot(src.rgb, vec3(0.299, 0.587, 0.114));
  vec3 fx = mix(vec3(0.3, 0.0, 0.3), vec3(1.0, 0.8, 0.1), gray);
  gl_FragColor.rgb = mix(src.rgb, fx, uVintageAmount);
  gl_FragColor.a = src.a;
}
`;

export default {
  name: 'Vintage',
  description: '',
  shader: shader,
  uniforms: [
    {
      name: 'Amount',
      description: '',
      id: 'uVintageAmount',
      type: 'float',
      min: 0,
      max: 1,
      default: 0.3,
    },
  ],
};
