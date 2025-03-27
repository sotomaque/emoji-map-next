import { describe, expect, test } from 'vitest';
import { stripNonNumeric } from '../strip-non-numeric';

describe('stripNonNumeric', () => {
  test('removes all non-numeric characters from a string', () => {
    expect(stripNonNumeric('abc123def456')).toBe('123456');
  });

  test('returns empty string when input has no numbers', () => {
    expect(stripNonNumeric('abcdef')).toBe('');
  });

  test('returns same string when input is all numbers', () => {
    expect(stripNonNumeric('123456')).toBe('123456');
  });

  test('handles special characters and spaces', () => {
    expect(stripNonNumeric('$100.00')).toBe('10000');
    expect(stripNonNumeric('1 234 567')).toBe('1234567');
    expect(stripNonNumeric('!@#$%^&*()')).toBe('');
  });

  test('handles empty string input', () => {
    expect(stripNonNumeric('')).toBe('');
  });

  test('handles mixed unicode characters', () => {
    expect(stripNonNumeric('€50.00¥200')).toBe('5000200');
  });
});
