const shader = `
precision lowp float;

varying vec2 vUv;

uniform sampler2D uImage;

void main() {
  vec4 src = texture2D(uImage, vUv, 0.0);
  // Convert to grayscale using NTSC conversion weights
  float gray = dot(src.rgb, vec3(0.299, 0.587, 0.114));
  gl_FragColor.rgb = vec3(gray);
  gl_FragColor.a = src.a;
}
`;

export default {
  name: 'Grayscale',
  description: '',
  shader: shader,
  uniforms: [],
};
