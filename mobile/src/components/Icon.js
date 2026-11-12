import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

/**
 * One place for all icons, so the whole app uses the same icon set.
 * Browse names at https://icons.expo.fyi (choose "Ionicons").
 */
export default function Icon({ name, size = 20, color = colors.text, style }) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}