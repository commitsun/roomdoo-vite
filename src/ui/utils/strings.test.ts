// strings.spec.ts
import { describe, it, expect } from 'vitest';

import { firstTwoInitials } from './strings'; // <- ajusta la ruta si cambia

// Helper to assert in a table-driven way
type Case = { name: string; input: string; expected: string; note?: string };

const cases: Case[] = [
  // Basic
  { name: 'simple two words', input: 'John Doe', expected: 'JD' },
  { name: 'single word only', input: 'John', expected: 'J' },
  { name: 'lowercase input', input: 'john doe', expected: 'JD' },
  { name: 'mixed case input', input: 'jOhN dOe', expected: 'JD' },

  // Extra spaces
  { name: 'leading spaces', input: '   John Doe', expected: 'JD' },
  { name: 'trailing spaces', input: 'John Doe   ', expected: 'JD' },
  { name: 'multiple spaces between', input: 'John   Doe', expected: 'JD' },
  { name: 'only spaces', input: '     ', expected: '' },
  { name: 'empty string', input: '', expected: '' },

  // More than two tokens (should take first two non-empty tokens)
  { name: 'three words', input: 'Mary Jane Watson', expected: 'MJ' },
  { name: 'middle names many', input: 'Juan Carlos I', expected: 'JC' },

  // Non-breaking spaces / tabs / assorted whitespace
  { name: 'tabs between names', input: 'John\tDoe', expected: 'JD' },
  { name: 'newlines between names', input: 'John\nDoe', expected: 'JD' },
  { name: 'mixed whitespace', input: '  John \t  \n  Doe  ', expected: 'JD' },

  // Punctuation within tokens (hyphens, apostrophes, dots)
  { name: 'hyphenated first name', input: 'Jean-Luc Picard', expected: 'JP' },
  { name: 'apostrophe last name', input: "O'Connor Liam", expected: 'OL' },
  { name: 'dots inside tokens', input: 'J.R.R. Tolkien', expected: 'JT' }, // tokens: "J.R.R." and "Tolkien"

  // Accents and non-ASCII letters
  { name: 'accented letters', input: 'Álvaro Núñez', expected: 'ÁN' },
  { name: 'ñ handling', input: 'iñaki goya', expected: 'IG' },
  { name: 'greek letters', input: 'νίκος Γκάλης', expected: 'ΝΓ' }, // uppercase should map

  // Single-character tokens
  { name: 'single-letter first name', input: 'Q Doe', expected: 'QD' },
  { name: 'single-letter last name', input: 'John Q', expected: 'JQ' },

  // Non-letter leading token parts
  { name: 'leading emoji then name', input: '🙂 John', expected: '🙂J' }, // first token is emoji, still takes first char
  { name: 'numbers in names', input: '7even David', expected: '7D' },

  // Unicode spacing quirks (no-break space)
  { name: 'no-break space', input: 'John\u00A0Doe', expected: 'JD' },

  // Long names
  {
    name: 'very long first token',
    input: 'Supercalifragilisticexpialidocious Smith',
    expected: 'SS',
  },

  // Edge: multiple spaces before second word only
  { name: 'spaces before second token', input: 'John     Smith', expected: 'JS' },

  // Edge: many empty tokens amidst
  { name: 'many empty tokens', input: '  John   \t   \n   Smith  ', expected: 'JS' },

  // Edge: one visible char and spaces
  { name: 'one letter with spaces', input: '   A   ', expected: 'A' },
];

describe('firstTwoInitials', () => {
  it.each(cases)('$name', ({ input, expected }) => {
    expect(firstTwoInitials(input)).toBe(expected);
  });
});
