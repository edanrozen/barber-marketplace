import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NotificationView } from '@barber-marketplace/api-contracts';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { listNotifications, markNotificationRead } from '../api/notifications-api';
import { theme } from '../theme';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen(_props: Props): React.JSX.Element {
  const [items, setItems] = useState<NotificationView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try { setItems(await listNotifications()); } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  async function onOpen(n: NotificationView): Promise<void> {
    if (n.read) return;
    try {
      await markNotificationRead(n.id);
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    } catch { /* ignore */ }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>{t('notif.title')}</Text>
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.center} />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>{t('notif.empty')}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.card, !item.read && styles.unread]} onPress={() => void onOpen(item)} accessibilityRole="button">
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700', padding: theme.spacing(2), textAlign: 'right' },
  center: { marginTop: theme.spacing(6) },
  empty: { color: theme.colors.muted, textAlign: 'center', marginTop: theme.spacing(6) },
  list: { padding: theme.spacing(2), gap: theme.spacing(1) },
  card: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius, padding: theme.spacing(2) },
  unread: { borderColor: theme.colors.primary },
  cardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700', textAlign: 'right' },
  body: { color: theme.colors.muted, fontSize: 14, marginTop: 4, textAlign: 'right' },
});
