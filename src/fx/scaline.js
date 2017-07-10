export default `
precision lowp float;

uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 src = texture2D(uImage, uv, 0.0);
  gl_FragColor = src * clamp(abs(sin(uv.y * 500.0)), 0.7, 1.0) * (1.0 - 1.5 * length(uv - 0.5));
  gl_FragColor.a = src.a;
}
`;
