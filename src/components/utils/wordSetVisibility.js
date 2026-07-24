import { tr } from './translate';

export const VISIBILITY_VALUES = ['private', 'unlisted', 'public'];

export function getWordSetVisibilityOptions() {
  return {
    private: {
      value: 'private',
      label: tr('wordSet.visPrivateLabel'),
      hint: tr('wordSet.visPrivateHint'),
      confirm: tr('wordSet.visPrivateConfirm'),
    },
    unlisted: {
      value: 'unlisted',
      label: tr('wordSet.visUnlistedLabel'),
      hint: tr('wordSet.visUnlistedHint'),
      confirm: tr('wordSet.visUnlistedConfirm'),
    },
    public: {
      value: 'public',
      label: tr('wordSet.visPublicLabel'),
      hint: tr('wordSet.visPublicHint'),
      confirm: tr('wordSet.visPublicConfirm'),
    },
  };
}

export function getWordSetVisibility(wordSet) {
  if (!wordSet) return 'private';
  if (wordSet.visibility && VISIBILITY_VALUES.includes(wordSet.visibility)) {
    return wordSet.visibility;
  }
  return wordSet.is_public ? 'public' : 'private';
}

/** @deprecated Use getWordSetVisibilityOptions() — kept for gradual migration */
export const WORD_SET_VISIBILITY = getWordSetVisibilityOptions();
