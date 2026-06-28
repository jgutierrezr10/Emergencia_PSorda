import { StyleSheet, View, Text, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLS = 15;
const ROWS = 15;
const { width } = Dimensions.get('window');
const CELL = Math.floor(Math.min(width - 32, 360) / COLS);
const BOARD = CELL * COLS;
const TICK_MS = 160;

interface Cell {
  x: number;
  y: number;
}

interface Juego {
  snake: Cell[];
  dir: Cell;
  pendingDir: Cell;
  food: Cell;
  score: number;
  over: boolean;
}

const comidaAleatoria = (snake: Cell[]): Cell => {
  let c: Cell;
  do {
    c = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((s) => s.x === c.x && s.y === c.y));
  return c;
};

const estadoInicial = (): Juego => {
  const snake = [
    { x: 7, y: 7 },
    { x: 6, y: 7 },
    { x: 5, y: 7 },
  ];
  return {
    snake,
    dir: { x: 1, y: 0 },
    pendingDir: { x: 1, y: 0 },
    food: comidaAleatoria(snake),
    score: 0,
    over: false,
  };
};

export default function SnakeScreen() {
  const [juego, setJuego] = useState<Juego>(estadoInicial);

  const cambiarDir = useCallback((dx: number, dy: number) => {
    setJuego((g) => {
      if (g.over) return g;
      // Evitar giro de 180°
      if (dx === -g.dir.x && dy === -g.dir.y) return g;
      return { ...g, pendingDir: { x: dx, y: dy } };
    });
  }, []);

  // Bucle del juego
  useEffect(() => {
    const id = setInterval(() => {
      setJuego((g) => {
        if (g.over) return g;
        const dir = g.pendingDir;
        const head = { x: g.snake[0].x + dir.x, y: g.snake[0].y + dir.y };

        // Choque con pared
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
          return { ...g, over: true };
        }
        // Choque con su cuerpo
        if (g.snake.some((s) => s.x === head.x && s.y === head.y)) {
          return { ...g, over: true };
        }

        const comio = head.x === g.food.x && head.y === g.food.y;
        const snake = [head, ...g.snake];
        if (!comio) snake.pop();

        return {
          ...g,
          snake,
          dir,
          food: comio ? comidaAleatoria(snake) : g.food,
          score: comio ? g.score + 1 : g.score,
        };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Teclado (web)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === 'ArrowUp' || k === 'w') cambiarDir(0, -1);
      else if (k === 'ArrowDown' || k === 's') cambiarDir(0, 1);
      else if (k === 'ArrowLeft' || k === 'a') cambiarDir(-1, 0);
      else if (k === 'ArrowRight' || k === 'd') cambiarDir(1, 0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cambiarDir]);

  const reiniciar = () => setJuego(estadoInicial());

  const snakeSet = new Set(juego.snake.map((s) => `${s.x},${s.y}`));
  const head = juego.snake[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.titulo}>Snake</Text>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreTexto}>{juego.score}</Text>
        </View>
      </View>

      {/* Tablero */}
      <View style={styles.tableroWrap}>
        <View style={[styles.tablero, { width: BOARD, height: BOARD }]}>
          {Array.from({ length: ROWS }).map((_, y) => (
            <View key={y} style={styles.fila}>
              {Array.from({ length: COLS }).map((_, x) => {
                const esCabeza = head.x === x && head.y === y;
                const esCuerpo = !esCabeza && snakeSet.has(`${x},${y}`);
                const esComida = juego.food.x === x && juego.food.y === y;
                return (
                  <View
                    key={x}
                    style={[
                      styles.celda,
                      { width: CELL, height: CELL },
                      esCuerpo && styles.cuerpo,
                      esCabeza && styles.cabeza,
                      esComida && styles.comida,
                    ]}
                  />
                );
              })}
            </View>
          ))}

          {juego.over && (
            <View style={styles.overlay}>
              <Text style={styles.overTitulo}>¡Perdiste!</Text>
              <Text style={styles.overScore}>Puntaje: {juego.score}</Text>
              <TouchableOpacity style={styles.reiniciarBtn} onPress={reiniciar}>
                <Text style={styles.reiniciarTexto}>JUGAR DE NUEVO</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Controles D-pad */}
      <View style={styles.dpad}>
        <TouchableOpacity style={styles.dBtn} onPress={() => cambiarDir(0, -1)}>
          <Ionicons name="caret-up" size={30} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.dpadRow}>
          <TouchableOpacity style={styles.dBtn} onPress={() => cambiarDir(-1, 0)}>
            <Ionicons name="caret-back" size={30} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.dGap} />
          <TouchableOpacity style={styles.dBtn} onPress={() => cambiarDir(1, 0)}>
            <Ionicons name="caret-forward" size={30} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.dBtn} onPress={() => cambiarDir(0, 1)}>
          <Ionicons name="caret-down" size={30} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scoreBox: {
    minWidth: 48,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  scoreTexto: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '900',
  },
  tableroWrap: {
    alignItems: 'center',
    marginTop: 12,
  },
  tablero: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#334155',
  },
  fila: {
    flexDirection: 'row',
  },
  celda: {
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cuerpo: {
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  cabeza: {
    backgroundColor: '#86efac',
    borderRadius: 4,
  },
  comida: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overTitulo: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
  },
  overScore: {
    color: '#cbd5e1',
    fontSize: 16,
    marginBottom: 22,
  },
  reiniciarBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  reiniciarTexto: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  dpad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dGap: {
    width: 64,
  },
  dBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
