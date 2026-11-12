import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { colors, radius, shadows, spacing } from '../theme/colors';

const ToastContext = createContext({ show: () => {} });

const TONES = {
  success: { icon: 'checkmark-circle', color: colors.success },
  error: { icon: 'close-circle', color: colors.danger },
  warning: { icon: 'warning', color: colors.warning },
  info: { icon: 'information-circle', color: colors.primary },
};

/**
 * Slide-in message that works on phones AND web (Alert popups don't show on web).
 * Usage:  const toast = useToast();  toast.show('Saved', { type: 'success', message: 'Details…' })
 */
export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);
  const native = Platform.OS !== 'web';

  const hide = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: native })
      .start(() => setToast(null));
  }, [anim, native]);

  const show = useCallback((title, { type = 'info', message, duration = 3500 } = {}) => {
    clearTimeout(timer.current);
    setToast({ title, type, message });
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, useNativeDriver: native, friction: 8 }).start();
    timer.current = setTimeout(hide, duration);
  }, [anim, hide, native]);

  const tone = toast ? TONES[toast.type] || TONES.info : TONES.info;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.wrap,
            { top: insets.top + spacing.sm },
            {
              opacity: anim,
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
            },
          ]}
        >
          <Pressable onPress={hide} style={[styles.toast, shadows.lg]} accessibilityRole="alert">
            <View style={[styles.stripe, { backgroundColor: tone.color }]} />
            <Icon name={tone.icon} size={22} color={tone.color} />
            <View style={styles.textCol}>
              <Text style={styles.title}>{toast.title}</Text>
              {toast.message ? <Text style={styles.message}>{toast.message}</Text> : null}
            </View>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/** Turns an axios error into a friendly sentence. */
export function friendlyError(e) {
  if (e?.response?.data?.error) return e.response.data.error;
  if (e?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (e?.message === 'Network Error') return "Can't reach the server. Check your connection and that the backend is running.";
  return 'Something went wrong. Please try again.';
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, zIndex: 1000, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  textCol: { flex: 1, marginLeft: spacing.md },
  title: { fontSize: 14, fontWeight: '700', color: colors.text },
  message: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
});