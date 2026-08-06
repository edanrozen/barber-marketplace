import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { getMe, updateMe } from '../api/profile-api';
import { useAuth } from '../auth/auth-context';
import { theme } from '../theme';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen(_props: Props): React.JSX.Element {
  const { logout } = useAuth();
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const me = await getMe();
        setPhone(me.phone);
        setDisplayName(me.displayName ?? '');
      } catch (e) {
        setError(e instanceof Error ? e.message : t('errorGeneric'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(): Promise<void> {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const me = await updateMe(displayName);
      setDisplayName(me.displayName ?? '');
      setMessage(t('profileSaved'));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorGeneric'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('profileTitle')}</Text>

      <Text style={styles.label}>{t('profilePhone')}</Text>
      <Text style={styles.readonly}>{phone}</Text>

      <Text style={styles.label}>{t('profileName')}</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder={t('profileNamePlaceholder')}
        placeholderTextColor={theme.colors.muted}
        textAlign="right"
      />

      {message !== null && <Text style={styles.success}>{message}</Text>}
      {error !== null && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={save} disabled={saving} accessibilityRole="button">
        {saving ? <ActivityIndicator color={theme.colors.bg} /> : <Text style={styles.buttonText}>{t('profileSave')}</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.logout} onPress={() => void logout()} accessibilityRole="button">
        <Text style={styles.logoutText}>{t('homeLogout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: theme.spacing(3), paddingVertical: theme.spacing(8) },
  center: { alignItems: 'center', justifyContent: 'center' },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '700', marginBottom: theme.spacing(4), textAlign: 'right' },
  label: { color: theme.colors.muted, fontSize: 14, marginBottom: theme.spacing(1), textAlign: 'right' },
  readonly: { color: theme.colors.text, fontSize: 18, marginBottom: theme.spacing(3), textAlign: 'right' },
  input: {
    backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius,
    color: theme.colors.text, fontSize: 18, padding: theme.spacing(2), marginBottom: theme.spacing(2),
  },
  success: { color: theme.colors.primary, marginBottom: theme.spacing(2), textAlign: 'right' },
  error: { color: theme.colors.danger, marginBottom: theme.spacing(2), textAlign: 'right' },
  button: { backgroundColor: theme.colors.primary, borderRadius: theme.radius, padding: theme.spacing(2), alignItems: 'center', marginTop: theme.spacing(1) },
  buttonText: { color: theme.colors.bg, fontSize: 18, fontWeight: '700' },
  logout: { padding: theme.spacing(2), alignItems: 'center', marginTop: theme.spacing(2) },
  logoutText: { color: theme.colors.danger, fontSize: 16, fontWeight: '600' },
});
