import { test, expect } from '@playwright/test';
import { parsePrice } from '../../utils/price';

test.describe('parsePrice', () => {
  const cases: Array<[input: string, expected: number]> = [
    ['149.990,00 TL', 149990],
    ['149.990\n,\n00TL', 149990], // product page: price split across several spans
    ['1.234,56 TL', 1234.56],
    ['₺99,90', 99.9],
    ['12.345.678,00 TL', 12345678],
    ['999 TL', 999],
  ];

  for (const [input, expected] of cases) {
    test(`parses ${JSON.stringify(input)} as ${expected}`, () => {
      expect(parsePrice(input)).toBe(expected);
    });
  }

  test('throws on text without a number', () => {
    expect(() => parsePrice('Fiyat bilgisi yok')).toThrow('Could not parse price');
  });

  test('throws on empty text', () => {
    expect(() => parsePrice('')).toThrow('Could not parse price');
  });
});
