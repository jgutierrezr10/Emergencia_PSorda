// Polyfill para 'global' en entorno web (necesario para stompjs y otras librerías RN en web)
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}

import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import BotonSnake from '@/components/BotonSnake';
import { ThemeProvider, useTheme } from '@/theme/theme';
import { FUENTES } from '@/theme/fonts'; // importa y aplica el parche de fuente

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNav() {
  const { esquema } = useTheme();

  return (
    <NavThemeProvider value={esquema === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ headerShown: false }} />
        <Stack.Screen name="recuperar-clave" options={{ headerShown: false }} />
        <Stack.Screen name="editar-perfil" options={{ headerShown: false }} />
        <Stack.Screen name="triage" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="estado" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="videollamada" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="snake" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <BotonSnake />
      <StatusBar style={esquema === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const [fuentesListas] = useFonts(FUENTES);

  if (!fuentesListas) return null;

  return (
    <ThemeProvider>
      <RootNav />
    </ThemeProvider>
  );
}
