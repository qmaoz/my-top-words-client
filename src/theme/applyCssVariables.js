import palette from './palette.js';

/** Встановлює CSS-змінні теми на :root з palette.js */
export function applyCssVariables() {
  const { common, background, chrome, accent, border, onPrimary, text, scrollbar, semantic } = palette;
  const root = document.documentElement;

  const set = (name, value) => root.style.setProperty(name, value);

  set('--black', common.black);
  set('--bg', background.default);
  set('--primary-color', chrome.main);
  set('--secondary-color', background.paper);
  set('--primary-light', chrome.lighter);
  set('--primary-dark', chrome.dark);
  set('--primary-darker', chrome.darker);

  set('--accent-teal', accent.main);
  set('--accent-teal-dark', accent.dark);
  set('--accent-teal-light', accent.light);

  set('--border-light-color', border.light);
  set('--border-medium-color', border.medium);
  set('--border-on-primary', border.onPrimary);
  set('--border-on-primary-hover', border.onPrimaryHover);
  set('--border-on-primary-subtle', border.onPrimarySubtle);

  set('--gradient1', `linear-gradient(135deg, ${chrome.main} 0%, ${chrome.light} 100%)`);
  set('--gradient2', `linear-gradient(135deg, ${background.paper} 0%, ${background.muted} 100%)`);
  set('--gradient3', `linear-gradient(90deg, ${accent.main} 0%, ${accent.dark} 100%)`);

  set('--on-primary', onPrimary.main);
  set('--on-primary-muted', onPrimary.muted);
  set('--on-primary-hover-bg', onPrimary.hoverBg);

  set('--text-muted', text.muted);
  set('--text-secondary', text.secondary);
  set('--text-tertiary', text.tertiary);
  set('--text-disabled', text.disabled);
  set('--text-faint', text.faint);
  set('--text-strong', text.strong);
  set('--text-body', text.body);
  set('--text-placeholder', text.placeholder);

  set('--chrome-hover-bg', chrome.hoverBg);
  set('--chrome-focus-bg', chrome.focusBg);
  set('--chrome-selected-bg', chrome.selectedBg);
  set('--chrome-outline', chrome.outline);

  set('--accent-selected-bg', accent.selectedBg);

  set('--semantic-error', semantic.error);
  set('--semantic-warning-bg', semantic.warning.bg);
  set('--semantic-warning-text', semantic.warning.text);
  set('--semantic-info-bg', semantic.info.bg);
  set('--semantic-info-text', semantic.info.text);
  set('--semantic-success-bg', semantic.success.bg);
  set('--semantic-success-text', semantic.success.text);

  set('--scrollbar-track', scrollbar.track);
  set('--scrollbar-thumb', scrollbar.thumb);
  set('--scrollbar-thumb-hover', scrollbar.thumbHover);
  set('--scrollbar-thumb-active', scrollbar.thumbActive);
  set('--scrollbar-thumb-top', scrollbar.thumbTop);
}
