export default `
precision lowp float;

uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 src = mix(texture2D(uImage, uv, 0.0), vec4(1.0, 1.0, 1.0, 1.0), length(vec2((uv.x - 0.6), (uv.y - 0.5))));
  // Convert to grayscale using NTSC conversion weights
  float gray = dot(src.rgb, vec3(0.299, 0.587, 0.114));
  vec3 fx = mix(vec3(0.3, 0.0, 0.3), vec3(1.0, 0.8, 0.1), gray);
  gl_FragColor.rgb = mix(src.rgb, fx, 0.3);
  gl_FragColor.a = src.a;
}
`;
