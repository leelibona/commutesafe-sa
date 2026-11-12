import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import api from '../api/client';
import { useAuth } from './AuthContext';
import { showLocalNotification, setupNotifications } from '../utils/notify';
import { getSettings, SETTING_FOR_TYPE } from '../utils/settings';

const NotificationsContext = createContext({ unread: 0, refresh: () => {}, markAllRead: () => {} });

const POLL_MS = 60 * 1000; // check for new notifications every minute while the app is open

export function NotificationsProvider({ children }) {
  const { token } = useAuth();
  const [unread, setUnread] = useState(0);
  const seen = useRef(null); // ids we've already shown, so each pops up only once

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/notifications');
      setUnread(data.unread);

      const items = data.items || [];
      if (seen.current === null) {
        // First load after opening the app: don't pop up old notifications
        seen.current = new Set(items.map(n => n.notification_id));
        return;
      }
      const settings = await getSettings();
      for (const n of items) {
        if (seen.current.has(n.notification_id)) continue;
        seen.current.add(n.notification_id);
        const settingKey = SETTING_FOR_TYPE[n.type];
        const allowed = settings.popups && (!settingKey || settings[settingKey]);
        if (!n.is_read && allowed) showLocalNotification(n.title, n.body || '');
      }
    } catch {
      // Offline or table not created yet: try again next time
    }
  }, [token]);

  const markAllRead = useCallback(async () => {
    setUnread(0);
    try { await api.patch('/notifications/read'); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!token) { setUnread(0); seen.current = null; return undefined; }
    getSettings().then(s => { if (s.popups) setupNotifications(); });
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    const sub = AppState.addEventListener('change', s => { if (s === 'active') refresh(); });
    return () => { clearInterval(timer); sub.remove(); };
  }, [token, refresh]);

  const value = useMemo(() => ({ unread, refresh, markAllRead }), [unread, refresh, markAllRead]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
