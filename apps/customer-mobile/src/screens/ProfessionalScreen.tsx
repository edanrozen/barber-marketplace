import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AvailabilityResponse, ProfessionalDetail } from '@barber-marketplace/api-contracts';
import { formatCurrencyILS, formatDateIL } from '@barber-marketplace/i18n';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { getAvailability, getProfessional } from '../api/professionals-api';
import { createBooking } from '../api/bookings-api';
import { theme } from '../theme';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Professional'>;

export function ProfessionalScreen({ route, navigation }: Props): React.JSX.Element {
  const { id } = route.params;
  const [pro, setPro] = useState<ProfessionalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [availLoading, setAvailLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        setPro(await getProfessional(id));
      } catch (e) {
        setError(e instanceof Error ? e.message : t('common.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (selectedServiceId === null) return;
    setAvailLoading(true);
    setAvailability(null);
    void (async () => {
      try {
        setAvailability(await getAvailability(id, selectedServiceId));
      } catch {
        setAvailability(null);
      } finally {
        setAvailLoading(false);
      }
    })();
  }, [id, selectedServiceId]);

  function confirmBook(date: string, start: string): void {
    const serviceId = selectedServiceId;
    if (serviceId === null) return;
    Alert.alert(t('booking.confirmTitle'), `${date} · ${start}`, [
      { text: t('booking.dismiss'), style: 'cancel' },
      { text: t('booking.confirm'), onPress: () => void doBook(serviceId, date, start) },
    ]);
  }
  async function doBook(serviceId: string, date: string, start: string): Promise<void> {
    try {
      const created = await createBooking({ professionalId: id, serviceId, date, start });
      navigation.navigate('BookingConfirmation', { booking: created });
    } catch (e) {
      Alert.alert(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setAvailLoading(false);
    }
  }

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator color={theme.colors.primary} /></View>;
  if (error !== null || pro === null) return <View style={[styles.container, styles.center]}><Text style={styles.error}>{error ?? t('common.error')}</Text></View>;

  const eta =
    pro.travelArea.etaMinMinutes !== null && pro.travelArea.etaMaxMinutes !== null
      ? `${pro.travelArea.etaMinMinutes}\u2013${pro.travelArea.etaMaxMinutes} ${t('common.minutesShort')}`
      : '';

  return (
    <ScrollView style={styles.container}>
      {pro.coverPhotoUrl !== null && <Image source={{ uri: pro.coverPhotoUrl }} style={styles.cover} />}
      <View style={styles.head}>
        {pro.profilePhotoUrl !== null && <Image source={{ uri: pro.profilePhotoUrl }} style={styles.avatar} />}
        <Text style={styles.name}>{pro.displayName}</Text>
        <Text style={styles.rating}>{`${pro.ratingAvg.toFixed(1)} \u2605  \u00b7  ${pro.ratingCount} ${t('discovery.reviews')}`}</Text>
        {pro.bio !== null && <Text style={styles.bio}>{pro.bio}</Text>}
      </View>

      {pro.portfolio.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('pro.portfolio')}</Text>
          <FlatList
            horizontal
            data={[...pro.portfolio]}
            keyExtractor={(m) => m.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gallery}
            renderItem={({ item }) => <Image source={{ uri: item.url }} style={styles.portfolio} />}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('pro.services')}</Text>
        {pro.services.map((s) => {
          const selected = s.id === selectedServiceId;
          return (
            <TouchableOpacity key={s.id} style={[styles.serviceRow, selected && styles.serviceRowSelected]} onPress={() => setSelectedServiceId(s.id)} accessibilityRole="button">
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{s.name}</Text>
                <Text style={styles.serviceDur}>{`${s.durationMinutes} ${t('common.minutesShort')}`}</Text>
              </View>
              <Text style={styles.servicePrice}>{formatCurrencyILS(s.priceMinorUnits)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('avail.title')}</Text>
        {selectedServiceId === null ? (
          <Text style={styles.meta}>{t('avail.pickService')}</Text>
        ) : availLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : availability === null || availability.days.length === 0 ? (
          <Text style={styles.meta}>{t('avail.noSlots')}</Text>
        ) : (
          availability.days.map((day) => {
            const [y, mo, d] = day.date.split('-').map(Number);
            return (
              <View key={day.date} style={styles.dayBlock}>
                <Text style={styles.dayLabel}>{formatDateIL(new Date(y ?? 2000, (mo ?? 1) - 1, d ?? 1))}</Text>
                <View style={styles.slotWrap}>
                  {day.slots.map((slot) => (
                    <TouchableOpacity key={slot.start} style={styles.slot} onPress={() => confirmBook(day.date, slot.start)} accessibilityRole="button">
                      <Text style={styles.slotText}>{slot.start}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </View>
      <View style={styles.footerSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  error: { color: theme.colors.danger },
  cover: { width: '100%', height: 160, backgroundColor: theme.colors.border },
  head: { alignItems: 'center', padding: theme.spacing(2), marginTop: -40 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: theme.colors.bg, backgroundColor: theme.colors.border },
  name: { color: theme.colors.text, fontSize: 24, fontWeight: '700', marginTop: theme.spacing(1) },
  rating: { color: theme.colors.muted, fontSize: 14, marginTop: 4 },
  bio: { color: theme.colors.text, fontSize: 15, textAlign: 'center', marginTop: theme.spacing(1.5), lineHeight: 22 },
  section: { paddingHorizontal: theme.spacing(2), paddingVertical: theme.spacing(1.5) },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: theme.spacing(1), textAlign: 'right' },
  gallery: { gap: theme.spacing(1) },
  portfolio: { width: 130, height: 130, borderRadius: 12, backgroundColor: theme.colors.border },
  serviceRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing(1), paddingHorizontal: theme.spacing(1), borderRadius: 10, borderBottomColor: theme.colors.border, borderBottomWidth: 1 },
  serviceRowSelected: { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.primary },
  serviceInfo: { alignItems: 'flex-end' },
  serviceName: { color: theme.colors.text, fontSize: 16 },
  serviceDur: { color: theme.colors.muted, fontSize: 13, marginTop: 2 },
  servicePrice: { color: theme.colors.primary, fontSize: 16, fontWeight: '700' },
  meta: { color: theme.colors.muted, fontSize: 14, textAlign: 'right', marginTop: 2 },
  dayBlock: { marginTop: theme.spacing(1.5) },
  dayLabel: { color: theme.colors.text, fontSize: 15, fontWeight: '600', textAlign: 'right', marginBottom: theme.spacing(0.5) },
  slotWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: theme.spacing(1) },
  slot: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 10, paddingVertical: theme.spacing(0.75), paddingHorizontal: theme.spacing(1.5) },
  slotText: { color: theme.colors.primary, fontSize: 15, fontWeight: '600' },
  footerSpace: { height: theme.spacing(4) },
});
