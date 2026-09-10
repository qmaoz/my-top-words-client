import { tr } from './translate';

export const FEEDBACK_TYPE_VALUES = [
  { value: 'typo', labelKey: 'feedback.typeTextError' },
  { value: 'bug', labelKey: 'feedback.typeTech' },
  { value: 'suggestion', labelKey: 'feedback.typeSuggestion' },
  { value: 'other', labelKey: 'feedback.typeOther' },
];

export const FEEDBACK_STATUS_VALUES = [
  { value: 'all', labelKey: 'feedback.statusAll' },
  { value: 'queued', labelKey: 'feedback.statusQueued' },
  { value: 'in_progress', labelKey: 'feedback.statusInProgress' },
  { value: 'done', labelKey: 'feedback.statusDone' },
];

export function getFeedbackTypes() {
  return FEEDBACK_TYPE_VALUES.map(({ value, labelKey }) => ({
    value,
    label: tr(labelKey),
  }));
}

export function getFeedbackStatuses() {
  return FEEDBACK_STATUS_VALUES.map(({ value, labelKey }) => ({
    value,
    label: tr(labelKey),
  }));
}

export function getFeedbackTypeLabel(value) {
  return getFeedbackTypes().find((item) => item.value === value)?.label ?? value;
}

export function getFeedbackStatusLabel(value) {
  return getFeedbackStatuses().find((item) => item.value === value)?.label ?? value;
}

export function formatFeedbackDate(value) {
  if (!value) return '—';
  const locale = document.documentElement.getAttribute('lang') || 'en';
  return new Date(value).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
