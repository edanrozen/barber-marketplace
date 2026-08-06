import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/auth-context';
import { theme } from '../theme';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { user, logout } = useAuth();
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>{t('home.greeting')}</Text>
        <Text style={styles.title}>{user?.phone ?? t('common.appName')}</Text>
      </View>
      <View>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')} accessibilityRole="button">
          <Text style={styles.buttonText}>{t('home.profileCta')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout} onPress={() => void logout()} accessibilityRole="button">
          <Text style={styles.logoutText}>{t('home.logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: theme.spacing(3), justifyContent: 'space-between', paddingVertical: theme.spacing(10) },
  greeting: { color: theme.colors.muted, fontSize: 18, textAlign: 'right' },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: '700', textAlign: 'right' },
  button: { backgroundColor: theme.colors.primary, borderRadius: theme.radius, padding: theme.spacing(2), alignItems: 'center', marginBottom: theme.spacing(2) },
  buttonText: { color: theme.colors.bg, fontSize: 18, fontWeight: '700' },
  logout: { padding: theme.spacing(2), alignItems: 'center' },
  logoutText: { color: theme.colors.danger, fontSize: 16, fontWeight: '600' },
});
