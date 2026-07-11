import { describe, it, expect } from 'vitest';
import { getWordSetVisibility } from './wordSetVisibility.js';

describe('getWordSetVisibility', () => {
  it('повертає private для порожнього набору', () => {
    expect(getWordSetVisibility(null)).toBe('private');
  });

  it('читає visibility', () => {
    expect(getWordSetVisibility({ visibility: 'unlisted' })).toBe('unlisted');
  });

  it('fallback на is_public', () => {
    expect(getWordSetVisibility({ is_public: true })).toBe('public');
    expect(getWordSetVisibility({ is_public: false })).toBe('private');
  });
});
