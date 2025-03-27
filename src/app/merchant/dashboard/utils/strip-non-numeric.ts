export function stripNonNumeric(str: string): string {
  return str.replace(/\D/g, '');
}
