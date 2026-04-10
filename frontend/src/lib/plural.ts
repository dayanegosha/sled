/**
 * Russian pluralization: picks the correct form based on number.
 * forms: [one, few, many] e.g. ['следопыт', 'следопыта', 'следопытов']
 */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const lastDigit = abs % 10;

  if (abs >= 11 && abs <= 19) return forms[2];
  if (lastDigit === 1) return forms[0];
  if (lastDigit >= 2 && lastDigit <= 4) return forms[1];
  return forms[2];
}
