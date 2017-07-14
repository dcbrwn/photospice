export default `
precision lowp float;

uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 src = texture2D(uImage, uv, 0.0);
  gl_FragColor = src * (mod(gl_FragCoord.y, 2.0) > 1.0 ? 0.7 : 1.0);
  gl_FragColor.a = src.a;
}
`;
