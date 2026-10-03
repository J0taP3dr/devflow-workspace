import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { readStored } from './storage';
import { csvCell } from './format';
describe('browser storage boundaries', () => {
  it('recovers from malformed JSON', () => {
    localStorage.setItem('x', '{broken');
    expect(readStored('x', z.array(z.string()), [])).toEqual([]);
  });
  it('rejects incompatible stored data', () => {
    localStorage.setItem('x', '[12]');
    expect(readStored('x', z.array(z.string()), [])).toEqual([]);
  });
  it('reads valid values', () => {
    localStorage.setItem('x', '["saved"]');
    expect(readStored('x', z.array(z.string()), [])).toEqual(['saved']);
  });
  it('neutralizes spreadsheet formulas and escapes quotes', () => {
    expect(csvCell('=1+1')).toBe('"\'=1+1"');
    expect(csvCell('A"B')).toBe('"A""B"');
  });
});
