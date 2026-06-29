import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useTheme } from '@/theme/theme';

// Botón de camuflaje: presente en todas las pantallas. Abre un juego de Snake
// para aparentar que la persona solo juega y no pide ayuda si el agresor mira.
export default function BotonSnake() {
  const pathname = usePathname();
  const { colors } = useTheme();
  if (pathname === '/snake') return null;

  return (
    <Pressable
      accessibilityLabel="Juego"
      style={[styles.fab, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push('/snake')}
      hitSlop={10}
    >
      <Text style={styles.emoji}>🐍</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 14,
    bottom: Platform.OS === 'web' ? 90 : 96,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 1000,
  },
  emoji: { fontSize: 26 },
});
