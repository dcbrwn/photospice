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

export function HSVToRGB(H, S, V) {
  const R = clamp(Math.abs(H * 6.0 - 3.0) - 1.0, 0, 1);
  const G = clamp(2.0 - Math.abs(H * 6.0 - 2.0), 0, 1);
  const B = clamp(2.0 - Math.abs(H * 6.0 - 4.0), 0, 1);
  return [
    ((R - 1.0) * S + 1.0) * V,
    ((G - 1.0) * S + 1.0) * V,
    ((B - 1.0) * S + 1.0) * V,
  ];
}

export function RGBToHSV(R, G, B) {
  const Cmin = Math.min(R, Math.min(G, B));
  const Cmax = Math.max(R, Math.max(G, B));
  // If all components are the same then the color is just grayscale
  if (Cmin === Cmax) return [0, 0, Cmin];
  const delta = Cmax - Cmin;
  let hue;
  if (Cmax === R && G >= B) hue = 60 * (G - B) / delta;
  else if (Cmax === R && G < B) hue = 60 * (G - B) / delta + 360;
  else if (Cmax === G) hue = 60 * (B - R) / delta + 120;
  else if (Cmax === B) hue = 60 * (R - G) / delta + 240;
  return [hue / 360, delta / Cmax, Cmax];
}

export function grayscale(R, G, B) {
  // NTSC color weights
  return 0.299 * R + 0.587 * G + 0.114 * B;
}

export function luminance(R, G, B) {
  // Relative luminance
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
