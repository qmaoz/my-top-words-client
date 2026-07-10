export const WORD_SET_VISIBILITY = {
  private: {
    value: 'private',
    label: 'Тільки я',
    hint: 'Бачите лише Ви',
    confirm: 'Залишити набір лише для себе?',
  },
  unlisted: {
    value: 'unlisted',
    label: 'За посиланням',
    hint: 'Відкривається за посиланням, але не на головній',
    confirm: 'Відкрити набір за посиланням?',
  },
  public: {
    value: 'public',
    label: 'На головній',
    hint: 'З’явиться в списку на головній сторінці',
    confirm: 'Показати набір на головній сторінці?',
  },
};

export function getWordSetVisibility(wordSet) {
  if (!wordSet) return 'private';
  if (wordSet.visibility && WORD_SET_VISIBILITY[wordSet.visibility]) {
    return wordSet.visibility;
  }
  return wordSet.is_public ? 'public' : 'private';
}
