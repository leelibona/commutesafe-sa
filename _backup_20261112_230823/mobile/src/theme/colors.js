import { Platform } from 'react-native';

// ─── Colour palette ────────────────────────────────────────────────
// Brand stays violet; neutrals get a faint cool tint so white cards
// lift off the page background.
export const colors = {
  primary: '#5B2EBC',
  primaryDark: '#3A1A85',
  primaryDeep: '#26105E',
  primaryLight: '#F1ECFD',
  primarySoft: '#E4DAFB',
  accent: '#7C4DFF',

  danger: '#DC2626',
  dangerDark: '#B91C1C',
  dangerLight: '#FEECEC',
  warning: '#F59E0B',
  warningDark: '#92400E',
  warningLight: '#FFF6E5',
  success: '#16A34A',
  successDark: '#166534',
  successLight: '#E8F7EE',

  text: '#16131F',
  textSecondary: '#4A4658',
  textMuted: '#8A8698',
  textOnPrimary: '#FFFFFF',
  textOnPrimaryMuted: '#CDBDF5',

  border: '#E6E3EE',
  borderStrong: '#CFCAE0',
  background: '#F6F5FA',
  backgroundAlt: '#FAFAFC',
  surface: '#FFFFFF',
};

export const riskColors = {
  Low: { bg: colors.successLight, text: colors.successDark, hex: colors.success },
  Medium: { bg: colors.warningLight, text: colors.warningDark, hex: colors.warning },
  High: { bg: colors.dangerLight, text: colors.dangerDark, hex: colors.danger },
  Unknown: { bg: '#F1F0F5', text: '#5F5B6E', hex: '#9C98AB' },
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
const shadow = (y, blur, opacity, elevation, color = '#2A1A5E') =>
  Platform.select({
    web: { boxShadow: `0px ${y}px ${blur}px rgba(42, 26, 94, ${opacity})` },
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