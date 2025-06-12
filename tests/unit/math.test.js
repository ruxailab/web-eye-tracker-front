import { describe, it, expect } from 'vitest';

function sum(a, b) {
  return a + b;
}

describe('sum', () => {
  it('adds two positive numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });

  it('adds negative numbers', () => {
    expect(sum(-2, -3)).toBe(-5);
  });

  it('handles edge case with zero', () => {
    expect(sum(0, 5)).toBe(5);
  });
});
