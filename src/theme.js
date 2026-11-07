import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  primary: '#1a365d',
  secondary: '#2d3748',
  accent: '#007f63',
  blue: '#0984e3',
  background: '#f1f5f9',
  surface: '#ffffff',
  text: '#2d3748',
  muted: '#64748b',
  border: '#e2e8f0',
  success: '#087a5b',
  warning: '#8a5700',
  danger: '#c0392b',
  info: '#3567a8',
};

export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
};

export const typography = {
  small: 12,
  body: 15,
  subtitle: 14,
  sectionTitle: 17,
  heading: 22,
  metric: 23,
};

export const paperTheme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.accent,
    onPrimary: '#ffffff',
    secondary: colors.primary,
    secondaryContainer: '#d7f0e9',
    onSecondaryContainer: colors.primary,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.text,
    onSurfaceVariant: colors.muted,
    outline: colors.border,
    error: colors.danger,
  },
};
