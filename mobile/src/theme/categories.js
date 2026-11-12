import { colors } from './colors';

// Report categories used across the app. `icon` is an Ionicons name.
export const CATEGORIES = [
  { key: 'Reckless driving', icon: 'speedometer-outline', tint: colors.warningLight, color: colors.warningDark },
  { key: 'Taxi violence', icon: 'flame-outline', tint: colors.dangerLight, color: colors.dangerDark },
  { key: 'Crime', icon: 'shield-outline', tint: colors.dangerLight, color: colors.dangerDark },
  { key: 'Harassment', icon: 'hand-left-outline', tint: colors.dangerLight, color: colors.dangerDark },
  { key: 'Overloading', icon: 'people-outline', tint: colors.warningLight, color: colors.warningDark },
  { key: 'Unroadworthy vehicle', icon: 'construct-outline', tint: colors.warningLight, color: colors.warningDark },
  { key: 'Overcharging', icon: 'cash-outline', tint: colors.primaryLight, color: colors.primary },
  { key: 'Other', icon: 'ellipsis-horizontal-circle-outline', tint: colors.primaryLight, color: colors.primary },
];

export const categoryFor = (key) =>
  CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1];

// Severity is stored as 1–3 in the database and feeds the risk model.
export const SEVERITIES = [
  { value: 1, label: 'Minor', risk: 'Low' },
  { value: 2, label: 'Serious', risk: 'Medium' },
  { value: 3, label: 'Dangerous', risk: 'High' },
];