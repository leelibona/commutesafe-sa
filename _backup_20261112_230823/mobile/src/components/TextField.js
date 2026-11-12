import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import Icon from './Icon';
import { colors, radius, spacing, type } from '../theme/colors';

/**
 * icon:  Ionicons name, e.g. "mail-outline"
 * error: message shown in red under the field
 * secureTextEntry: adds a show/hide eye button automatically
 */
export default function TextField({
  label, hint, error, icon, style, inputStyle, multiline, secureTextEntry, right, ...props
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;
  const iconColor = error ? colors.danger : focused ? colors.primary : colors.textMuted;

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          { borderColor },
          focused && !error && styles.fieldFocused,
          error && styles.fieldError,
        ]}
      >
        {icon ? (
          <Icon name={icon} size={18} color={iconColor} style={[styles.icon, multiline && { marginTop: 2 }]} />
        ) : null}
        <TextInput
          {...props}
          secureTextEntry={hidden}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          style={[styles.input, multiline && styles.inputMultiline, inputStyle]}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden(h => !h)}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
        {right}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Icon name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  label: { ...type.label, marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  fieldMultiline: { alignItems: 'flex-start', paddingVertical: 12 },
  fieldFocused: { backgroundColor: '#FDFCFF' },
  fieldError: { backgroundColor: '#FFFBFB' },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
    outlineStyle: 'none', // web: rely on our own focus border
  },
  inputMultiline: { minHeight: 96, paddingVertical: 0 },
  hint: { ...type.caption, marginTop: 6 },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  error: { fontSize: 12, color: colors.danger, marginLeft: 4, fontWeight: '500' },
});