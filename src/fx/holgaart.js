export default `
precision lowp float;

uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uResolution;

float Epsilon = 1e-10;

vec3 RGBToHCV(vec3 RGB) {
  // Based on work by Sam Hocevar and Emil Persson
  vec4 P = (RGB.g < RGB.b) ? vec4(RGB.bg, -1.0, 2.0/3.0) : vec4(RGB.gb, 0.0, -1.0/3.0);
  vec4 Q = (RGB.r < P.x) ? vec4(P.xyw, RGB.r) : vec4(RGB.r, P.yzx);
  float C = Q.x - min(Q.w, Q.y);
  float H = abs((Q.w - Q.y) / (6.0 * C + Epsilon) + Q.z);
  return vec3(H, C, Q.x);
}

vec3 HUEToRGB(float H) {
  float R = abs(H * 6.0 - 3.0) - 1.0;
  float G = 2.0 - abs(H * 6.0 - 2.0);
  float B = 2.0 - abs(H * 6.0 - 4.0);
  //return saturate(vec3(R,G,B));
  return clamp(vec3(R,G,B),0.0,1.0);
}

vec3 HSVToRGB(vec3 HSV) {
  vec3 RGB = HUEToRGB(HSV.x);
  return ((RGB - 1.0) * HSV.y + 1.0) * HSV.z;
}

vec3 RGBToHSV(vec3 RGB) {
  vec3 HCV = RGBToHCV(RGB);
  float S = HCV.y / (HCV.z + Epsilon);
  return vec3(HCV.x, S, HCV.z);
}

vec3 modifyHSV(vec3 color, vec3 params) {
  vec3 result = RGBToHSV(color);
  result += params;
  return HSVToRGB(result);
}

float blendOverlay(float base, float blend) {
  return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
  return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

void main() {
  vec2 shift = vec2(-50.0, 0.0);
  vec2 uv1 = gl_FragCoord.xy / uResolution.xy;
  vec2 uv2 = (gl_FragCoord.xy + shift) / uResolution.xy;
  vec4 src1 = texture2D(uImage, uv1, 0.0);
  vec4 src2 = texture2D(uImage, uv2, 0.0);
  src1.g = src1.b;
  src2.g = src2.b;
  vec4 inverted = vec4(modifyHSV(src2.rgb, vec3(0.5, 0.0, 0.0)), 0.0);
  gl_FragColor = vec4(blendOverlay(src1.rgb, inverted.rgb), src1.a * src2.a);
}
`;
