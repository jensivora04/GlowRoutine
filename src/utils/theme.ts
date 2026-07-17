export const COLORS = {
  background: '#FDF6F4',
  backgroundAlt: '#FEF0F0',
  surface: '#FFFFFF',
  surfacePink: '#FFF5F7',
  primary: '#E8909A',
  primaryLight: '#FCE8EC',
  primaryLighter: '#FEF4F6',
  primaryDark: '#C4666F',
  secondary: '#F4C5CB',
  accent: '#C8A8D8',
  accentLight: '#EEE4F8',
  peach: '#F4A898',
  peachLight: '#FCE8E4',
  mint: '#90C8A8',
  mintLight: '#DFF2E8',
  gold: '#F0C878',
  goldLight: '#FEF4DC',
  border: '#F5E8EA',
  borderLight: '#FDF0F2',
  text: '#2D1820',
  textSecondary: '#8C6870',
  textLight: '#C4A8AE',
  AM: '#F4C870',
  PM: '#A890C8',
  success: '#7BC090',
  danger: '#E08090',
  white: '#FFFFFF',
  card1: '#FFF0F2',
  card2: '#FFF5EC',
  card3: '#F0EEF8',
  card4: '#EEF8F0',
};

export const FONTS = {
  regular: { fontWeight: '400' as const },
  medium: { fontWeight: '500' as const },
  semiBold: { fontWeight: '600' as const },
  bold: { fontWeight: '700' as const },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#E8909A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#C46070',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
};
