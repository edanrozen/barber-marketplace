import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfessionalSummary } from '@barber-marketplace/api-contracts';
import { formatCurrencyILS } from '@barber-marketplace/i18n';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { listProfessionals } from '../api/professionals-api';
import { useAuth } from '../auth/auth-context';
import { theme } from '../theme';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { logout } = useAuth();
  const [items, setItems] = useState<ProfessionalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const page = await listProfessionals();
        setItems([...page.items]);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('common.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('discovery.title')}</Text>
        <View style={styles.headerLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('MyBookings')} accessibilityRole="button">
            <Text style={styles.link}>{t('home.myBookings')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} accessibilityRole="button">
            <Text style={styles.link}>{t('home.profileCta')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.center} />
      ) : error !== null ? (
        <Text style={styles.error}>{error}</Text>
      ) : items.length === 0 ? (
        <Text style={styles.empty}>{t('discovery.empty')}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <Card item={item} onPress={() => navigation.navigate('Professional', { id: item.id })} />}
        />
      )}

      <TouchableOpacity style={styles.logout} onPress={() => void logout()} accessibilityRole="button">
        <Text style={styles.logoutText}>{t('home.logout')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function Card({ item, onPress }: { item: ProfessionalSummary; onPress: () => void }): React.JSX.Element {
  const eta =
    item.etaMinMinutes !== null && item.etaMaxMinutes !== null
      ? `${item.etaMinMinutes}\u2013${item.etaMaxMinutes} ${t('common.minutesShort')}`
      : '';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} accessibilityRole="button">
      {item.profilePhotoUrl !== null && <Image source={{ uri: item.profilePhotoUrl }} style={styles.avatar} />}
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.displayName}</Text>
        <Text style={styles.meta}>{`${item.ratingAvg.toFixed(1)} \u2605  \u00b7  ${item.ratingCount} ${t('discovery.reviews')}`}</Text>
        <Text style={styles.meta}>{`${item.zoneName}  \u00b7  ${eta}`}</Text>
        {item.priceFromMinorUnits !== null && (
          <Text style={styles.price}>{`${t('discovery.priceFrom')} ${formatCurrencyILS(item.priceFromMinorUnits)}`}</Text>
        )}
        {item.availabilitySummary !== null && <Text style={styles.avail}>{item.availabilitySummary}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing(2) },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700' },
  link: { color: theme.colors.primary, fontSize: 15 },
  headerLinks: { flexDirection: 'row-reverse', gap: theme.spacing(2) },
  center: { marginTop: theme.spacing(6) },
  error: { color: theme.colors.danger, textAlign: 'center', marginTop: theme.spacing(4) },
  empty: { color: theme.colors.muted, textAlign: 'center', marginTop: theme.spacing(6) },
  list: { padding: theme.spacing(2), gap: theme.spacing(1.5) },
  card: { flexDirection: 'row-reverse', backgroundColor: theme.colors.surface, borderRadius: theme.radius, padding: theme.spacing(1.5), gap: theme.spacing(1.5), borderColor: theme.colors.border, borderWidth: 1 },
  avatar: { width: 72, height: 72, borderRadius: 12, backgroundColor: theme.colors.border },
  cardBody: { flex: 1, alignItems: 'flex-start' },
  name: { color: theme.colors.text, fontSize: 18, fontWeight: '700', textAlign: 'right' },
  meta: { color: theme.colors.muted, fontSize: 13, marginTop: 2, textAlign: 'right' },
  price: { color: theme.colors.primary, fontSize: 15, fontWeight: '600', marginTop: 4, textAlign: 'right' },
  avail: { color: theme.colors.text, fontSize: 13, marginTop: 2, textAlign: 'right' },
  logout: { padding: theme.spacing(1.5), alignItems: 'center' },
  logoutText: { color: theme.colors.danger, fontSize: 15, fontWeight: '600' },
});
