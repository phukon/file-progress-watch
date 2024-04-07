import { calculateProgress } from '../src/progressCalculator.js';

describe('calculateProgress', () => {
  it('calculates the correct progress percentage', () => {
    expect(calculateProgress(50, 100)).toBe(50);
    expect(calculateProgress(0, 100)).toBe(0);
    expect(calculateProgress(100, 100)).toBe(100);
  });

  it('handles division by zero', () => {
    expect(calculateProgress(1, 0)).toBe(0);
  });
});