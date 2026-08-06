import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/auth-context';
import { SplashScreen } from '../screens/SplashScreen';
import { PhoneEntryScreen } from '../screens/PhoneEntryScreen';
import { OtpEntryScreen } from '../screens/OtpEntryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProfessionalScreen } from '../screens/ProfessionalScreen';

export type RootStackParamList = {
  Splash: undefined;
  PhoneEntry: undefined;
  OtpEntry: { challengeId: string; phone: string };
  Home: undefined;
  Profile: undefined;
  Professional: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'authenticated' ? (
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Professional" component={ProfessionalScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
          <Stack.Screen name="OtpEntry" component={OtpEntryScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
