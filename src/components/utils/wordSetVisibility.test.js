import { describe, it, expect } from 'vitest';
import { getWordSetVisibility } from './wordSetVisibility.js';

describe('getWordSetVisibility', () => {
  it('returns private for an empty set', () => {
    expect(getWordSetVisibility(null)).toBe('private');
  });

  it('reads visibility', () => {
    expect(getWordSetVisibility({ visibility: 'unlisted' })).toBe('unlisted');
  });

  it('falls back to is_public', () => {
    expect(getWordSetVisibility({ is_public: true })).toBe('public');
    expect(getWordSetVisibility({ is_public: false })).toBe('private');
  });
});
