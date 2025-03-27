import { describe, expect, test } from 'vitest';
import { formatPhoneNumber } from '../format-phone-number';

describe('formatPhoneNumber', () => {
  test('formats complete phone number correctly', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('123.456.7890')).toBe('(123) 456-7890');
  });

  test('handles partial phone numbers', () => {
    expect(formatPhoneNumber('123')).toBe('123');
    expect(formatPhoneNumber('123456')).toBe('(123) 456');
    expect(formatPhoneNumber('1234567')).toBe('(123) 456-7');
  });

  test('strips non-numeric characters before formatting', () => {
    expect(formatPhoneNumber('abc123def456ghi7890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('(abc1@#23)456-7890')).toBe('(123) 456-7890');
  });

  test('handles empty and invalid inputs', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber('abc')).toBe('');
    expect(formatPhoneNumber('!@#$%^&*()')).toBe('');
  });

  test('truncates numbers longer than 10 digits', () => {
    expect(formatPhoneNumber('12345678901')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('123456789012345')).toBe('(123) 456-7890');
  });

  test('handles spaces and special formatting characters', () => {
    expect(formatPhoneNumber('123 456 7890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('(123) 456 7890')).toBe('(123) 456-7890');
  });
});
