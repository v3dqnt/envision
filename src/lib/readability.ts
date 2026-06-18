// Lightweight client-side readability scoring (Flesch–Kincaid Grade Level).
// Used to show "we simplified this" — dense original vs. ENVIS's plain version.

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return word.length ? 1 : 0;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const groups = word.match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

// Strip markdown / emoji so we score the words, not the formatting.
export function stripMarkdown(text: string): string {
  return text
    .replace(/[#>*_`~-]+/g, ' ')
    .replace(/\p{Extended_Pictographic}/gu, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Flesch–Kincaid grade. Returns a clamped, rounded grade level (>= 1).
export function gradeLevel(raw: string): number {
  const text = stripMarkdown(raw);
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (words.length < 5 || sentences.length === 0) return 0;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const grade = 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59;
  return Math.max(1, Math.round(grade));
}

// A friendly label for a grade level.
export function gradeLabel(grade: number): string {
  if (grade <= 5) return 'Easy to read';
  if (grade <= 8) return 'Fairly easy';
  if (grade <= 12) return 'High-school level';
  return 'College / dense';
}
