export const FEEDBACK_TYPES = [
  { value: 'typo', label: 'Помилка в тексті' },
  { value: 'bug', label: 'Технічна помилка' },
  { value: 'suggestion', label: 'Пропозиція' },
  { value: 'other', label: 'Інше' },
];

export const FEEDBACK_STATUSES = [
  { value: 'all', label: 'Усі' },
  { value: 'queued', label: 'У черзі' },
  { value: 'in_progress', label: 'На розгляді' },
  { value: 'done', label: 'Виконано' },
];

export function getFeedbackTypeLabel(value) {
  return FEEDBACK_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function getFeedbackStatusLabel(value) {
  if (value === 'all') return 'Усі';
  return FEEDBACK_STATUSES.find((item) => item.value === value)?.label ?? value;
}

export function formatFeedbackDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
