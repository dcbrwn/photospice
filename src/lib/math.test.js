import {
  clamp,
  isPowerOfTwo
} from './math';

describe('isPowerOfTwo', () => {
  test('should consider zero as power of two', () => {
    expect(isPowerOfTwo(0)).toBe(true);
  });

  test('should correctly detect positive cases', () => {
    expect(isPowerOfTwo(128)).toBe(true);
    expect(isPowerOfTwo(256)).toBe(true);
    expect(isPowerOfTwo(512)).toBe(true);
    expect(isPowerOfTwo(1024)).toBe(true);
  });

  test('should correctly detect negative cases', () => {
    expect(isPowerOfTwo(3)).toBe(false);
    expect(isPowerOfTwo(6)).toBe(false);
    expect(isPowerOfTwo(513)).toBe(false);
    expect(isPowerOfTwo(1020)).toBe(false);
    expect(isPowerOfTwo(1024.3)).toBe(false);
    expect(isPowerOfTwo(1023.7)).toBe(false);
  });
});

describe('clamp', () => {
  test('should clamp to upper bound', () => {
    expect(clamp(10, 1, 5)).toBe(5);
    expect(clamp(5 + 1e-5, 1, 5)).toBe(5);
  });

  test('should clamp to lower bound', () => {
    expect(clamp(0, 1, 5)).toBe(1);
    expect(clamp(1 - 1e-5, 1, 5)).toBe(1);
  });

  test('should keep values in range', () => {
    expect(clamp(3, 1, 5)).toBe(3);
    expect(clamp(5 - 1e-5, 1, 5)).toBe(5 - 1e-5);
    expect(clamp(1 + 1e-5, 1, 5)).toBe(1 + 1e-5);
  });

  test('should keep bounds', () => {
    expect(clamp(5, 1, 5)).toBe(5);
    expect(clamp(1, 1, 5)).toBe(1);
  });

  test('should default to range 0..1', () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(0.5)).toBe(0.5);
    expect(clamp(2)).toBe(1);
  });
});
