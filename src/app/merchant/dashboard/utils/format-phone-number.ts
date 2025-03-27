import { stripNonNumeric } from './strip-non-numeric';

export function formatPhoneNumber(value: string): string {
  const numbers = stripNonNumeric(value);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6)
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(
    6,
    10
  )}`;
}
