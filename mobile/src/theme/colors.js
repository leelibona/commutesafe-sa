import { Platform } from 'react-native';

// ─── Colour palette ────────────────────────────────────────────────
// Brand colour is burgundy; neutrals get a faint warm tint so white cards
// lift off the page background. Change these values to re-theme the whole app.
export const colors = {
  primary: '#7B1E3A',
  primaryDark: '#5C1529',
  primaryDeep: '#3F0E1C',
  primaryLight: '#F8EDF0',
  primarySoft: '#EFD3DB',
  accent: '#A3324F',

  danger: '#DC2626',
  dangerDark: '#B91C1C',
  dangerLight: '#FEECEC',
  warning: '#F59E0B',
  warningDark: '#92400E',
  warningLight: '#FFF6E5',
  success: '#16A34A',
  successDark: '#166534',
  successLight: '#E8F7EE',

  text: '#1C1417',
  textSecondary: '#4E4549',
  textMuted: '#8C8287',
  textOnPrimary: '#FFFFFF',
  textOnPrimaryMuted: '#EFC6D2',

  border: '#EAE3E5',
  borderStrong: '#D6CACE',
  background: '#F8F5F6',
  backgroundAlt: '#FBF9FA',
  surface: '#FFFFFF',
  surfaceTint: '#FDF9FA',   // very light brand tint for selected / focused areas
  placeholder: '#ECE5E7',   // loading skeletons and empty map/photo boxes
};

export const riskColors = {
  Low: { bg: colors.successLight, text: colors.successDark, hex: colors.success },
  Medium: { bg: colors.warningLight, text: colors.warningDark, hex: colors.warning },
  High: { bg: colors.dangerLight, text: colors.dangerDark, hex: colors.danger },
  Unknown: { bg: '#F2EFF0', text: '#5F575B', hex: '#9C9296' },
};

// ─── Spacing (4-pt scale) ──────────────────────────────────────────
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

// ─── Typography ────────────────────────────────────────────────────
export const type = {
  display: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, color: colors.text },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3, color: colors.text },
  heading: { fontSize: 17, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.textSecondary, lineHeight: 21 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  caption: { fontSize: 12, color: colors.textMuted },
  overline: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', color: colors.textMuted,
  },
};

// ─── Elevation ─────────────────────────────────────────────────────
const shadow = (y, blur, opacity, elevation, color = '#3C1020') =>
  Platform.select({
    web: { boxShadow: `0px ${y}px ${blur}px rgba(60, 16, 32, ${opacity})` },
    android: { elevation },
    default: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: blur / 2,
      shadowOffset: { width: 0, height: y },
    },
  });

export const shadows = {
  sm: shadow(1, 4, 0.06, 1),
  md: shadow(4, 14, 0.08, 3),
  lg: shadow(10, 28, 0.14, 8),
};
