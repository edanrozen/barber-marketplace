import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatCurrencyILS } from '@barber-marketplace/i18n';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export function BookingConfirmationScreen({ route, navigation }: Props): React.JSX.Element {
  const { booking } = route.params;
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.check}>{'\u2713'}</Text>
        <Text style={styles.title}>{t('confirm.title')}</Text>
        <View style={styles.card}>
          <Text style={styles.pro}>{booking.professionalName}</Text>
          <Text style={styles.service}>{booking.serviceName}</Text>
          <Text style={styles.meta}>{`${booking.date}  \u00b7  ${booking.start}\u2013${booking.end}`}</Text>
          <Text style={styles.price}>{formatCurrencyILS(booking.priceMinorUnits)}</Text>
          <Text style={styles.payment}>{`${t('payment.label')}: ${t('payment.cashOnArrival')}`}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate('MyBookings')} accessibilityRole="button">
          <Text style={styles.primaryText}>{t('confirm.viewBookings')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => navigation.popToTop()} accessibilityRole="button">
          <Text style={styles.secondaryText}>{t('confirm.backHome')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'space-between', padding: theme.spacing(3) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  check: { color: theme.colors.primary, fontSize: 64, fontWeight: '800', marginBottom: theme.spacing(1) },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: '700', marginBottom: theme.spacing(3) },
  card: { alignSelf: 'stretch', backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius, padding: theme.spacing(2), alignItems: 'flex-end' },
  pro: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  service: { color: theme.colors.text, fontSize: 16, marginTop: 4 },
  meta: { color: theme.colors.muted, fontSize: 14, marginTop: 4 },
  price: { color: theme.colors.primary, fontSize: 18, fontWeight: '700', marginTop: 6 },
  payment: { color: theme.colors.muted, fontSize: 14, marginTop: 6 },
  actions: { gap: theme.spacing(1.5) },
  primary: { backgroundColor: theme.colors.primary, borderRadius: theme.radius, padding: theme.spacing(2), alignItems: 'center' },
  primaryText: { color: theme.colors.bg, fontSize: 18, fontWeight: '700' },
  secondary: { padding: theme.spacing(1.5), alignItems: 'center' },
  secondaryText: { color: theme.colors.muted, fontSize: 15, fontWeight: '600' },
});
