import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Pregunta {
  titulo: string;
  subtitulo: string;
}

const PREGUNTAS: Pregunta[] = [
  { titulo: '¿Estás herido?', subtitulo: 'Si tienes alguna lesión o necesitas atención médica' },
  { titulo: '¿El agresor está armado?', subtitulo: 'Con arma de fuego, arma blanca u objeto peligroso' },
  { titulo: '¿El agresor está dentro de la casa?', subtitulo: 'En tu domicilio o en el mismo espacio que tú' },
];

export default function TriageScreen() {
  const [cargando, setCargando] = useState(true);
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<boolean[]>([]);
  const [enviado, setEnviado] = useState(false);

  // Envío de la alerta (simulado). Es una pantalla normal (no un modal), así
  // que el botón de camuflaje (snake) sigue disponible mientras carga.
  useEffect(() => {
    // TODO: Enviar la alerta + ubicación GPS al backend (Spring Boot)
    const t = setTimeout(() => setCargando(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const responder = (valor: boolean) => {
    const nuevas = [...respuestas, valor];
    setRespuestas(nuevas);

    if (paso < PREGUNTAS.length - 1) {
      setPaso(paso + 1);
    } else {
      // TODO: Enviar respuestas de triage al backend (Spring Boot)
      // await fetch('http://IP:8080/api/emergencia/triage', { method: 'POST', body: JSON.stringify(nuevas) });
      setEnviado(true);
    }
  };

  // Pantalla de carga: enviando la alerta
  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.finalWrapper}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.cargandoTitulo}>Enviando alerta a Carabineros…</Text>
          <Text style={styles.cargandoTexto}>
            Obteniendo tu ubicación GPS y notificando a la central CENCO.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla final: información enviada
  if (enviado) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.finalWrapper}>
          <View style={styles.finalCircle}>
            <Ionicons name="checkmark" size={52} color="#059669" />
          </View>
          <Text style={styles.finalTitulo}>Información enviada al operador</Text>
          <Text style={styles.finalTexto}>
            El operador CENCO ya tiene tu información de triage y está preparando la respuesta.
          </Text>
          <TouchableOpacity style={styles.verEstadoBtn} onPress={() => router.replace('/estado')}>
            <Text style={styles.verEstadoTexto}>VER ESTADO</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pregunta = PREGUNTAS[paso];

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado: TRIAGE + progreso */}
      <View style={styles.topRow}>
        <Text style={styles.triageLabel}>TRIAGE</Text>
        <Text style={styles.pasoLabel}>{paso + 1} / {PREGUNTAS.length}</Text>
      </View>

      <View style={styles.progressRow}>
        {PREGUNTAS.map((_, i) => (
          <View key={i} style={[styles.progressSeg, i <= paso && styles.progressSegActivo]} />
        ))}
      </View>

      {/* Tarjeta de seña (GIF LSCh) */}
      <View style={styles.gifCard}>
        <View style={styles.gifBadge}>
          <Text style={styles.gifBadgeTexto}>GIF</Text>
        </View>
        <View style={styles.gifContenido}>
          <View style={styles.manosRow}>
            <Ionicons name="hand-left" size={56} color="#9ca3af" />
            <Ionicons name="hand-right" size={56} color="#9ca3af" />
          </View>
          <Text style={styles.gifCaption}>Lengua de Señas Chilena (LSCh)</Text>
        </View>
      </View>

      {/* Pregunta */}
      <View style={styles.preguntaWrapper}>
        <Text style={styles.preguntaTitulo}>{pregunta.titulo}</Text>
        <Text style={styles.preguntaSubtitulo}>{pregunta.subtitulo}</Text>
      </View>

      {/* Botones Sí / No */}
      <View style={styles.botonesRow}>
        <TouchableOpacity
          style={[styles.boton, styles.botonSi]}
          onPress={() => responder(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.botonTexto}>SÍ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.boton, styles.botonNo]}
          onPress={() => responder(false)}
          activeOpacity={0.85}
        >
          <Text style={styles.botonTexto}>NO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
  },
  cargandoTitulo: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 20,
  },
  cargandoTexto: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  triageLabel: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  pasoLabel: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '800',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  progressSeg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
  },
  progressSegActivo: {
    backgroundColor: '#059669',
  },
  gifCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  gifBadge: {
    alignSelf: 'flex-end',
    backgroundColor: '#059669',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  gifBadgeTexto: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gifContenido: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 36,
    alignItems: 'center',
    marginTop: 8,
  },
  manosRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  gifCaption: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  preguntaWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  preguntaTitulo: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  preguntaSubtitulo: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },
  botonesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  boton: {
    flex: 1,
    height: 96,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  botonSi: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  botonNo: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  finalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  finalCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: '#059669',
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  finalTitulo: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  finalTexto: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  verEstadoBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#059669',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verEstadoTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
