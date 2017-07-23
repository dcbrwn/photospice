export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function toPowerOfTwo(value) {
  return Math.pow(2, Math.ceil(Math.log2(value))) | 0;
}

export function isPowerOfTwo(value) {
  const power = Math.log2(value);
  return power === Math.floor(power);
}

export function align(value, step) {
  return step * Math.round(value / step);
}
