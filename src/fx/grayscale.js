export default `
precision lowp float;

uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 src = texture2D(uImage, uv, 0.0);
  // Convert to grayscale using NTSC conversion weights
  float gray = dot(src.rgb, vec3(0.299, 0.587, 0.114));
  gl_FragColor.rgb = vec3(gray);
  gl_FragColor.a = src.a;
}
`;
