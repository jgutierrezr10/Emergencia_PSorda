import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VideollamadaScreen() {
  const [segundos, setSegundos] = useState(0);
  const [silenciado, setSilenciado] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
  const ss = String(segundos % 60).padStart(2, '0');

  return (
    <SafeAreaView style={styles.container}>
      {/* Estado superior */}
      <View style={styles.topRow}>
        <View style={styles.pill}>
          <Ionicons name="wifi" size={16} color="#34d399" />
          <Text style={styles.pillTexto}>Señal estable</Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name="time-outline" size={16} color="#ffffff" />
          <Text style={styles.pillTexto}>{mm}:{ss}</Text>
        </View>
      </View>

      {/* Intérprete */}
      <View style={styles.centro}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={84} color="#ffffff" />
        </View>
        <Text style={styles.nombre}>Intérprete LSCh</Text>
        <Text style={styles.subnombre}>María González — CENCO</Text>
        <View style={styles.enLineaBadge}>
          <View style={styles.enLineaDot} />
          <Text style={styles.enLineaTexto}>EN LÍNEA</Text>
        </View>
      </View>

      {/* Tu cámara (PiP) */}
      <View style={styles.pip}>
        <Ionicons name="person" size={34} color="#9ca3af" />
        <Text style={styles.pipTexto}>Tu cámara</Text>
      </View>

      {/* Controles */}
      <View style={styles.controles}>
        <View style={styles.controlItem}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.btnSecundario]}
            onPress={() => setSilenciado((v) => !v)}
          >
            <Ionicons name={silenciado ? 'mic-off' : 'mic'} size={26} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>{silenciado ? 'Activar' : 'Silenciar'}</Text>
        </View>

        <View style={styles.controlItem}>
          <TouchableOpacity style={[styles.controlBtn, styles.btnColgar]} onPress={() => router.back()}>
            <Ionicons name="call" size={30} color="#ffffff" style={styles.iconoColgar} />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>Colgar</Text>
        </View>

        <View style={styles.controlItem}>
          <TouchableOpacity style={[styles.controlBtn, styles.btnCambiar]}>
            <Ionicons name="camera-reverse" size={26} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>Cambiar</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b',
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillTexto: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#059669',
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  nombre: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  subnombre: {
    color: '#a7f3d0',
    fontSize: 15,
    marginTop: 6,
  },
  enLineaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#34d399',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: 'rgba(52,211,153,0.12)',
  },
  enLineaDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#34d399',
  },
  enLineaTexto: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  pip: {
    position: 'absolute',
    right: 20,
    bottom: 170,
    width: 100,
    height: 130,
    borderRadius: 14,
    backgroundColor: '#0b3b2e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  pipTexto: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  controles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingBottom: 24,
    paddingTop: 8,
  },
  controlItem: {
    alignItems: 'center',
    gap: 10,
  },
  controlBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecundario: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  btnColgar: {
    backgroundColor: '#dc2626',
  },
  iconoColgar: {
    transform: [{ rotate: '135deg' }],
  },
  btnCambiar: {
    backgroundColor: '#2563eb',
  },
  controlLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
