import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/auth-context';
import { theme } from '../theme';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpEntry'>;

export function OtpEntryScreen({ route }: Props): React.JSX.Element {
  const { challengeId, phone } = route.params;
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      // On success, auth status flips to 'authenticated' and the navigator swaps to the app stack.
      await verifyOtp(challengeId, code);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorGeneric'));
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('otpTitle')}</Text>
      <Text style={styles.subtitle}>{t('otpSubtitle')}</Text>
      <Text style={styles.phone}>{phone}</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder={t('otpPlaceholder')}
        placeholderTextColor={theme.colors.muted}
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
        autoFocus
      />
      {error !== null && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading} accessibilityRole="button">
        {loading ? <ActivityIndicator color={theme.colors.bg} /> : <Text style={styles.buttonText}>{t('otpCta')}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: theme.spacing(3), justifyContent: 'center' },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '700', marginBottom: theme.spacing(1), textAlign: 'right' },
  subtitle: { color: theme.colors.muted, fontSize: 16, marginBottom: theme.spacing(1), textAlign: 'right' },
  phone: { color: theme.colors.primary, fontSize: 18, marginBottom: theme.spacing(3), textAlign: 'right' },
  input: {
    backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius,
    color: theme.colors.text, fontSize: 28, letterSpacing: 8, padding: theme.spacing(2), marginBottom: theme.spacing(2),
  },
  error: { color: theme.colors.danger, marginBottom: theme.spacing(2), textAlign: 'right' },
  button: { backgroundColor: theme.colors.primary, borderRadius: theme.radius, padding: theme.spacing(2), alignItems: 'center' },
  buttonText: { color: theme.colors.bg, fontSize: 18, fontWeight: '700' },
});
