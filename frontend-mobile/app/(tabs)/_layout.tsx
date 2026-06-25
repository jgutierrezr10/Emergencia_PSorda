import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none', // Para que parezcan tabs sin animación de transición
      }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="perfil" />
    </Stack>
  );
}
