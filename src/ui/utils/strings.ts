// strings.ts
// Get the first grapheme of a string (emoji-safe)
const firstGrapheme = (s: string): string => {
  if (!s) {
    return '';
  }
  // Prefer Intl.Segmenter when available (handles ZWJ sequences better)
  // Fallback to Array.from which iterates code points.
  const Seg =
    typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function' ? Intl.Segmenter : null;
  if (Seg) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    const it = seg.segment(s)[Symbol.iterator]().next();
    return it?.value?.segment ?? Array.from(s)[0] ?? '';
  }
  return Array.from(s)[0] ?? '';
};

const upper = (ch: string): string => (ch ? ch.toLocaleUpperCase() : '');

const firstTwoInitials = (name: string): string => {
  if (!name) {
    return '';
  }

  // Normalize whitespace and drop empty tokens
  const tokens = name.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);

  if (tokens.length === 0) {
    return '';
  }

  const a = upper(firstGrapheme(tokens[0]));
  const b = tokens.length > 1 ? upper(firstGrapheme(tokens[1])) : '';

  return `${a}${b}`;
};

export { firstTwoInitials };
