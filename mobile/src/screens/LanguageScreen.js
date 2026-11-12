import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

const SAMPLE = { en: 'Travel. Report. Stay safe.', af: 'Reis. Rapporteer. Bly veilig.', xh: 'Hamba. Xela. Hlala ukhuselekile.' };

export default function LanguageScreen({ navigation }) {
  const { lang, setLanguage, languages, t } = useLanguage();

  const choose = async (code) => {
    await setLanguage(code);
    navigation.goBack();
  };

  return (
    <Screen tabbed={false} contentStyle={{ padding: spacing.lg }}>
      <Text style={styles.subtitle}>{t('lang.subtitle')}</Text>
      <View style={[styles.group, shadows.sm]}>
        {languages.map((l, i) => {
          const active = l.code === lang;
          return (
            <Pressable
              key={l.code}
              onPress={() => choose(l.code)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.row,
                i < languages.length - 1 && styles.border,
                pressed && { backgroundColor: colors.backgroundAlt },
              ]}
            >
              <View style={[styles.code, active && { backgroundColor: colors.primary }]}>
                <Text style={[styles.codeText, active && { color: '#fff' }]}>{l.code.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, active && { color: colors.primary }]}>{l.native}</Text>
                <Text style={styles.sample}>{SAMPLE[l.code]}</Text>
              </View>
              {active && <Icon name="checkmark-circle" size={22} color={colors.primary} />}
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.note}>
        Some screens and server messages are still in English. Translations are being reviewed by first-language speakers.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...type.body, color: colors.textMuted, marginBottom: spacing.lg },
  group: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  border: { borderBottomWidth: 1, borderBottomColor: colors.border },
  code: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  codeText: { fontWeight: '800', color: colors.primary },
  label: { fontSize: 16, fontWeight: '700', color: colors.text },
  sample: { ...type.caption, marginTop: 2 },
  note: { ...type.caption, marginTop: spacing.lg, paddingHorizontal: 4, lineHeight: 17 },
});
