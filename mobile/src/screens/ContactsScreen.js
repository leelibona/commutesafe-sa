import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Icon from '../components/Icon';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { SkeletonRow } from '../components/Skeleton';
import { useToast, friendlyError } from '../components/Toast';
import { useT } from '../i18n/LanguageContext';
import { callNumber, formatPhone } from '../utils/messaging';
import { validateName } from '../utils/validation';
import { colors, radius, shadows, spacing, type } from '../theme/colors';

const RELATIONSHIPS = ['Parent', 'Partner', 'Sibling', 'Friend', 'Other'];
const MAX = 5;

const validatePhone = (v = '') => {
  const p = v.replace(/[\s()-]/g, '');
  if (!p) return 'Phone number is required';
  if (!/^(\+27|0)[1-9]\d{8}$/.test(p)) return 'Enter a valid SA number, e.g. 082 123 4567';
  return '';
};

export default function ContactsScreen() {
  const t = useT();
  const toast = useToast();
  const [contacts, setContacts] = useState(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Parent');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/contacts');
      setContacts(data);
    } catch (e) {
      setContacts(c => c || []);
      toast.show('Could not load contacts', { type: 'error', message: friendlyError(e) });
    }
  }, [toast]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    const next = { name: validateName(name), phone: validatePhone(phone) };
    setErrors(next);
    if (next.name || next.phone) return;
    setSaving(true);
    try {
      const { data } = await api.post('/contacts', { name: name.trim(), phone, relationship });
      setContacts(c => [...(c || []), data]);
      setName(''); setPhone(''); setRelationship('Parent'); setAdding(false);
      toast.show('Contact added', { type: 'success', message: `${data.name} will be offered a message when you send an SOS.` });
    } catch (e) {
      toast.show('Could not add contact', { type: 'error', message: friendlyError(e) });
    } finally { setSaving(false); }
  };

  const doRemove = async (c) => {
    try {
      await api.delete(`/contacts/${c.contact_id}`);
      setContacts(list => list.filter(x => x.contact_id !== c.contact_id));
      toast.show('Contact removed', { type: 'info', message: c.name });
    } catch (e) {
      toast.show('Could not remove contact', { type: 'error', message: friendlyError(e) });
    }
  };

  const remove = (c) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${c.name}?`)) doRemove(c);
      return;
    }
    Alert.alert(`Remove ${c.name}?`, 'They will no longer be offered SOS messages.', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => doRemove(c) },
    ]);
  };

  const full = contacts && contacts.length >= MAX;

  return (
    <Screen tabbed={false} contentStyle={{ padding: spacing.lg }}>
      <View style={styles.intro}>
        <Icon name="people-circle-outline" size={22} color={colors.primary} />
        <Text style={styles.introText}>{t('contacts.subtitle')}</Text>
      </View>

      {contacts === null && [0, 1].map(i => <SkeletonRow key={i} />)}

      {contacts && contacts.length === 0 && !adding && (
        <View style={styles.empty}>
          <Icon name="person-add-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>{t('contacts.empty')}</Text>
          <Text style={styles.emptyText}>Add up to {MAX} people you trust.</Text>
        </View>
      )}

      {contacts && contacts.map(c => (
        <View key={c.contact_id} style={[styles.contact, shadows.sm]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{c.name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{c.name}</Text>
            <Text style={styles.meta}>
              {formatPhone(c.phone)}{c.relationship ? ` · ${c.relationship}` : ''}
            </Text>
          </View>
          <Pressable onPress={() => callNumber(c.phone)} hitSlop={8} style={styles.iconBtn} accessibilityLabel={`Call ${c.name}`}>
            <Icon name="call-outline" size={18} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => remove(c)} hitSlop={8} style={[styles.iconBtn, { backgroundColor: colors.dangerLight }]} accessibilityLabel={`Remove ${c.name}`}>
            <Icon name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        </View>
      ))}

      {adding ? (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={type.heading}>{t('contacts.add')}</Text>
          <TextField
            label={t('contacts.name')} icon="person-outline" value={name} error={errors.name}
            onChangeText={(v) => { setName(v); setErrors(e => ({ ...e, name: '' })); }} placeholder="e.g. Thandi Mokoena"
          />
          <TextField
            label={t('contacts.phone')} icon="call-outline" value={phone} error={errors.phone}
            onChangeText={(v) => { setPhone(v); setErrors(e => ({ ...e, phone: '' })); }}
            keyboardType="phone-pad" placeholder="082 123 4567"
          />
          <Text style={styles.label}>{t('contacts.relationship')}</Text>
          <View style={styles.chips}>
            {RELATIONSHIPS.map(r => (
              <Chip key={r} label={r} selected={relationship === r} onPress={() => setRelationship(r)} />
            ))}
          </View>
          <View style={styles.formButtons}>
            <PrimaryButton title={t('common.cancel')} variant="ghost" onPress={() => { setAdding(false); setErrors({}); }} style={{ flex: 1 }} />
            <PrimaryButton title={t('common.save')} icon="checkmark" onPress={save} loading={saving} style={{ flex: 1 }} />
          </View>
        </Card>
      ) : (
        contacts && (
          <PrimaryButton
            title={full ? `Maximum of ${MAX} contacts` : t('contacts.add')}
            icon="person-add-outline"
            variant="secondary"
            disabled={full}
            onPress={() => setAdding(true)}
            style={{ marginTop: spacing.md }}
          />
        )
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    backgroundColor: colors.primaryLight, borderRadius: radius.md, marginBottom: spacing.lg,
  },
  introText: { flex: 1, marginLeft: spacing.sm, fontSize: 13, color: colors.primaryDark, lineHeight: 18 },
  empty: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyTitle: { ...type.heading, marginTop: spacing.sm },
  emptyText: { ...type.caption, marginTop: 4 },
  contact: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm + 2,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { ...type.caption, marginTop: 2 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginLeft: spacing.sm,
  },
  label: { ...type.label, marginTop: spacing.lg, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  formButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
});
