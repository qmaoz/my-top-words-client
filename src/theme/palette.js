/**
 * Тема «Lexikon» — спокійна палітра для тривалих сесій навчання німецької лексики.
 *
 * Принципи:
 * - теплий паперовий фон замість яскравого білого/синього;
 * - єдиний приглушений шалфей (хром + MUI) — без втомлюючого контрасту;
 * - тепле золото для вторинних акцентів;
 * - м’які тіні та приглушені семантичні кольори.
 *
 * CSS-змінні: applyCssVariables(); MUI: muiTheme.js.
 */
export const palette = {
  common: {
    black: '#1E2A29',
    white: '#FFFFFF',
  },

  background: {
    /** Фон сторінки — теплий «папір» */
    default: '#F5F3EF',
    /** Фон MUI — ледь помітний шалфейний відтінок */
    muiDefault: '#EFF3F2',
    paper: '#FDFCFA',
    muted: '#E8E6E1',
  },

  /** Шапка, футер, навігація — узгоджено з MUI primary */
  chrome: {
    main: '#2F6F6F',
    light: '#4A8F8F',
    lighter: '#D6E9E8',
    dark: '#245858',
    darker: '#1A4545',
    hoverBg: 'rgba(47, 111, 111, 0.05)',
    focusBg: 'rgba(47, 111, 111, 0.08)',
    selectedBg: 'rgba(47, 111, 111, 0.11)',
    outline: 'rgba(47, 111, 111, 0.4)',
  },

  /** Прогрес, скролбар, дрібні акценти */
  accent: {
    main: '#4A8F8F',
    dark: '#2F6F6F',
    darker: '#245858',
    light: '#6AADAD',
    selectedBg: 'rgba(47, 111, 111, 0.10)',
  },

  border: {
    light: 'rgba(30, 42, 41, 0.07)',
    medium: 'rgba(30, 42, 41, 0.1)',
    onPrimary: 'rgba(255, 255, 255, 0.3)',
    onPrimaryHover: 'rgba(255, 255, 255, 0.5)',
    onPrimarySubtle: 'rgba(255, 255, 255, 0.12)',
  },

  onPrimary: {
    main: '#FFFFFF',
    muted: 'rgba(255, 255, 255, 0.9)',
    hoverBg: 'rgba(255, 255, 255, 0.12)',
    linkMuted: 'rgba(255, 255, 255, 0.6)',
    linkUnderline: 'rgba(255, 255, 255, 0.5)',
  },

  text: {
    muted: 'rgba(30, 42, 41, 0.68)',
    secondary: 'rgba(30, 42, 41, 0.6)',
    tertiary: 'rgba(30, 42, 41, 0.55)',
    disabled: 'rgba(30, 42, 41, 0.45)',
    faint: 'rgba(30, 42, 41, 0.5)',
    strong: 'rgba(30, 42, 41, 0.82)',
    body: 'rgba(30, 42, 41, 0.72)',
    placeholder: 'rgba(30, 42, 41, 0.42)',
  },

  scrollbar: {
    track: 'rgba(30, 42, 41, 0.04)',
    thumb: 'rgba(74, 143, 143, 0.45)',
    thumbHover: '#3D7A7A',
    thumbActive: '#2F6F6F',
    thumbTop: 'rgba(106, 173, 173, 0.65)',
  },

  semantic: {
    error: '#B53A3A',
    warning: { bg: '#F8F0E0', text: '#9A6B1A' },
    info: { bg: '#E5F0EF', text: '#2F6F6F' },
    success: { bg: '#E6F2EA', text: '#2D6B42' },
  },

  /** MUI-компоненти: кнопки, форми, тости */
  mui: {
    primary: {
      main: '#2F6F6F',
      light: '#D6E9E8',
      dark: '#245858',
      gradientStart: '#4A8F8F',
      gradientEnd: '#2F6F6F',
      gradientHoverStart: '#3D7A7A',
      gradientHoverEnd: '#245858',
      shadow: 'rgba(47, 111, 111, 0.12)',
      shadowHover: 'rgba(47, 111, 111, 0.18)',
      shadowPaper: 'rgba(47, 111, 111, 0.05)',
      hoverBg: 'rgba(47, 111, 111, 0.08)',
    },
    secondary: {
      main: '#B8860B',
      light: '#F5EDD4',
      dark: '#8F6808',
      gradientStart: '#D4A82A',
      gradientEnd: '#B8860B',
      gradientHoverStart: '#B8860B',
      gradientHoverEnd: '#8F6808',
    },
    success: {
      main: '#3D8B5F',
      light: '#DDF0E6',
      dark: '#2D6B42',
    },
    error: {
      main: '#C44B4B',
      light: '#F8E4E4',
      dark: '#B53A3A',
    },
    warning: {
      main: '#C4922A',
      light: '#F8F0E0',
      dark: '#9A6B1A',
    },
    text: {
      primary: '#1E2A29',
      secondary: '#5C6E6C',
    },
  },
};

export default palette;
