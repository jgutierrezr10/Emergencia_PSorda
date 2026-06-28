import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';

// Botón de camuflaje: presente en todas las pantallas. Al tocarlo abre un
// juego de Snake, de modo que la persona pueda aparentar que solo está jugando
// y no pidiendo ayuda si el agresor está cerca.
export default function BotonSnake() {
  const pathname = usePathname();
  if (pathname === '/snake') return null;

  return (
    <Pressable
      accessibilityLabel="Juego"
      style={styles.fab}
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 1000,
  },
  emoji: {
    fontSize: 26,
  },
});
