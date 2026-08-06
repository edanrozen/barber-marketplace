import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { t } from '../i18n';

/** Shown while the session is being restored/validated on cold start. */
export function SplashScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>{t('common.appName')}</Text>
      <ActivityIndicator color={theme.colors.primary} style={styles.spinner} />
      <Text style={styles.loading}>{t('common.loading')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
  brand: { color: theme.colors.primary, fontSize: 32, fontWeight: '700', marginBottom: theme.spacing(3) },
  spinner: { marginBottom: theme.spacing(2) },
  loading: { color: theme.colors.muted, fontSize: 16 },
});
