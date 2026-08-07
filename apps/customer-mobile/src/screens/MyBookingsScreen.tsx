import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BookingView } from '@barber-marketplace/api-contracts';
import { formatCurrencyILS } from '@barber-marketplace/i18n';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { cancelBooking, listMyBookings } from '../api/bookings-api';
import { theme } from '../theme';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'MyBookings'>;

function statusLabel(status: string): string {
  if (status === 'confirmed') return t('booking.statusConfirmed');
  if (status === 'cancelled') return t('booking.statusCancelled');
  return t('booking.statusCompleted');
}

export function MyBookingsScreen(_props: Props): React.JSX.Element {
  const [items, setItems] = useState<BookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await listMyBookings());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function onCancel(id: string): Promise<void> {
    try {
      await cancelBooking(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>{t('booking.myTitle')}</Text>
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.center} />
      ) : error !== null ? (
        <Text style={styles.error}>{error}</Text>
      ) : items.length === 0 ? (
        <Text style={styles.empty}>{t('booking.empty')}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.pro}>{item.professionalName}</Text>
                <Text style={styles.status}>{statusLabel(item.status)}</Text>
              </View>
              <Text style={styles.service}>{item.serviceName}</Text>
              <Text style={styles.meta}>{`${item.date}  ·  ${item.start}\u2013${item.end}`}</Text>
              <Text style={styles.price}>{formatCurrencyILS(item.priceMinorUnits)}</Text>
              {item.status === 'confirmed' && (
                <TouchableOpacity style={styles.cancel} onPress={() => void onCancel(item.id)} accessibilityRole="button">
                  <Text style={styles.cancelText}>{t('booking.cancelCta')}</Text>
                </TouchableOpacity>
              )}
            </View>
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
  error: { color: theme.colors.danger, textAlign: 'center', marginTop: theme.spacing(4) },
  empty: { color: theme.colors.muted, textAlign: 'center', marginTop: theme.spacing(6) },
  list: { padding: theme.spacing(2), gap: theme.spacing(1.5) },
  card: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius, padding: theme.spacing(2) },
  rowBetween: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  pro: { color: theme.colors.text, fontSize: 18, fontWeight: '700', textAlign: 'right' },
  status: { color: theme.colors.muted, fontSize: 13 },
  service: { color: theme.colors.text, fontSize: 15, marginTop: 4, textAlign: 'right' },
  meta: { color: theme.colors.muted, fontSize: 14, marginTop: 2, textAlign: 'right' },
  price: { color: theme.colors.primary, fontSize: 16, fontWeight: '700', marginTop: 4, textAlign: 'right' },
  cancel: { marginTop: theme.spacing(1.5), alignItems: 'center', paddingVertical: theme.spacing(1) },
  cancelText: { color: theme.colors.danger, fontSize: 15, fontWeight: '600' },
});
