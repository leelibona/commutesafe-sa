import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { strings, LANGUAGES } from './strings';

const KEY = 'appLanguage';
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(v => { if (v && strings[v]) setLang(v); })
      .catch(() => {});
  }, []);

  const setLanguage = useCallback(async (code) => {
    if (!strings[code]) return;
    setLang(code);
    try { await AsyncStorage.setItem(KEY, code); } catch { /* ignore */ }
  }, []);

  // Looks up a key in the chosen language, falls back to English, then to the key itself
  const t = useCallback((key, vars) => {
    let text = strings[lang]?.[key] ?? strings.en[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => { text = text.replace(`{${k}}`, String(v)); });
    }
    return text;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLanguage, t, languages: LANGUAGES }), [lang, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}

/** Shortcut: const t = useT(); t('home.report') */
export const useT = () => useLanguage().t;
