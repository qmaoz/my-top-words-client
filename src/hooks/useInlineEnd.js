import { useTheme } from '@mui/material/styles';

/** Physical side that corresponds to CSS `inline-end` for the current theme direction. */
export function useInlineEnd() {
  const theme = useTheme();
  return theme.direction === 'rtl' ? 'left' : 'right';
}

/** Physical side that corresponds to CSS `inline-start` for the current theme direction. */
export function useInlineStart() {
  const theme = useTheme();
  return theme.direction === 'rtl' ? 'right' : 'left';
}
