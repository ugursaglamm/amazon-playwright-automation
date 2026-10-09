/**
 * Converts a Turkish-formatted price string into a number.
 * Examples: "149.990,00 TL" -> 149990, "₺1.234,56" -> 1234.56
 * In tr-TR format "." is the thousands separator and "," is the decimal separator.
 */
export function parsePrice(text: string): number {
  const cleaned = text.replace(/[^\d.,]/g, '');
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const value = Number.parseFloat(normalized);

  if (Number.isNaN(value)) {
    throw new Error(`Could not parse price from text: "${text}"`);
  }
  return value;
}
