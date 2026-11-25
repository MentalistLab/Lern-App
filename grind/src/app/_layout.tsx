import { BigShoulders_800ExtraBold, BigShoulders_900Black, useFonts as useDisplayFonts } from '@expo-google-fonts/big-shoulders';
import {
  Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold, useFonts as useBodyFonts,
} from '@expo-google-fonts/figtree';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { useReminderSync } from '../reminders';
import { StoreProvider, useStore } from '../store';
import { colors } from '../theme';

function Gate() {
  const { ready } = useStore();
  useReminderSync();
  const [d] = useDisplayFonts({ BigShoulders_800ExtraBold, BigShoulders_900Black });
  const [b] = useBodyFonts({ Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold });

  if (!ready || !d || !b) return <View style={{ flex: 1, backgroundColor: colors.screen }} />;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.screen },
        }}
      >
        <Stack.Screen name="timer/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="done" options={{ gestureEnabled: false }} />
        <Stack.Screen name="rankup" options={{ gestureEnabled: false }} />
        <Stack.Screen name="subject-form" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <Gate />
    </StoreProvider>
  );
}
