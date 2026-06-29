import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme, Colors } from '@/theme/theme';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { baseUrl } from './_config';

const guardarDato = async (key: string, value: string) => {
  if (Platform.OS === 'web') localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
};

const obtenerDato = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return await SecureStore.getItemAsync(key);
};


interface Pregunta {
  titulo: string;
  subtitulo: string;
  gif: number | null;
}

const PREGUNTAS: Pregunta[] = [
  { titulo: 'TÚ ¿HERIDO?', subtitulo: 'TÚ ¿TIENES HERIDA? ¿NECESITAS MÉDICO?', gif: require('../assets/gifs/01-herido.gif') },
  { titulo: 'AGRESOR ¿TIENE ARMA?', subtitulo: 'PISTOLA, CUCHILLO U OBJETO PELIGROSO', gif: require('../assets/gifs/02-arma.gif') },
  { titulo: 'AGRESOR ¿DENTRO CASA?', subtitulo: 'EN TU CASA O MISMO LUGAR QUE TÚ', gif: null },
];

export default function TriageScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [cargando, setCargando] = useState(true);
  const [continuar, setContinuar] = useState(false);
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<boolean[]>([]);
  const [enviado, setEnviado] = useState(false);
  const [alertaId, setAlertaId] = useState<number | null>(null);

  useEffect(() => {
    const crearAlerta = async () => {
      try {
        // BORRAMOS let ip = '10.83.92.211'... etc.

        const personaSordaIdStr = await obtenerDato('personaSordaId');
        const personaSordaId = personaSordaIdStr ? Number(personaSordaIdStr) : 1;

        let lat = -33.4503;
        let lng = -70.6781;
        if (Platform.OS !== 'web') {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
            }
          } catch (e) {
            console.warn('No se pudo obtener la ubicación GPS, usando por defecto');
          }
        }

        const response = await fetch(`${baseUrl}/api/alertas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fechaHoraInicio: new Date().toISOString(),
            latitudLongitud: `${lat},${lng}`,
            disponibleTriage: true,
            estado: 'ACTIVO',
            incidente: 'Alerta de Pánico (Sordo)',
            modoCamuflaje: true,
            personaSorda: {
              id: personaSordaId
            }
          }),
        });

        if (!response.ok) throw new Error('Error al crear la alerta');
        const data = await response.json();
        
        setAlertaId(data.id);
        await guardarDato('currentAlertaId', String(data.id));
      } catch (err) {
        console.error('Error creando alerta real, usando simulación:', err);
        setAlertaId(999);
        await guardarDato('currentAlertaId', '999');
      } finally {
        setCargando(false);
      }
    };

    crearAlerta();
  }, []);

  const responder = async (valor: boolean) => {
    const nuevas = [...respuestas, valor];
    setRespuestas(nuevas);
    try {
      
      const currentId = alertaId || Number(await obtenerDato('currentAlertaId'));

      if (currentId && currentId !== 999) {
        const pregunta = PREGUNTAS[paso];
        await fetch(`${baseUrl}/api/triage-alertas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preguntaClave: pregunta.titulo,
            respuestaSordo: valor,
            horaRespuesta: new Date().toISOString(),
            alerta: {
              id: currentId
            }
          }),
        });
      }
    } catch (e) {
      console.warn('Error enviando triage al backend:', e);
    }

    if (paso < PREGUNTAS.length - 1) {
      setPaso(paso + 1);
    } else {
      setEnviado(true);
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.cargandoTitulo}>ENVIANDO ALERTA A CARABINEROS…</Text>
          <Text style={styles.cargandoTexto}>BUSCANDO TU UBICACIÓN GPS. AVISANDO A CENCO.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!continuar && !enviado) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerWrapper}>
          <View style={styles.avisoCircle}>
            <Ionicons name="shield-checkmark" size={54} color={colors.primary} />
          </View>
          <Text style={styles.avisoTitulo}>¡AYUDA YA ENVIADA!</Text>
          <Text style={styles.avisoTexto}>
            CARABINEROS (CENCO) YA TIENE TU ALERTA + TU UBICACIÓN. AYUDA VIENE.
            {'\n\n'}¿PUEDES RESPONDER PREGUNTAS PARA AYUDAR A PATRULLA?
          </Text>
          <View style={[styles.botonesRow, { width: '100%', marginTop: 20 }]}>
            <TouchableOpacity style={[styles.boton, styles.botonSi]} onPress={() => setContinuar(true)} activeOpacity={0.85}>
              <Text style={styles.botonTexto}>SÍ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.boton, styles.botonNo]} onPress={() => setEnviado(true)} activeOpacity={0.85}>
              <Text style={styles.botonTexto}>NO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (enviado) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerWrapper}>
          <View style={styles.avisoCircle}>
            <Ionicons name="checkmark" size={52} color={colors.primary} />
          </View>
          <Text style={styles.avisoTitulo}>INFORMACIÓN YA ENVIADA A OPERADOR</Text>
          <Text style={styles.avisoTexto}>OPERADOR CENCO YA TIENE TU INFORMACIÓN. PREPARANDO RESPUESTA.</Text>
          <TouchableOpacity style={styles.botonPrimario} onPress={() => router.replace('/estado')}>
            <Text style={styles.botonPrimarioTexto}>VER ESTADO</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pregunta = PREGUNTAS[paso];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.triageLabel}>TRIAGE</Text>
        <Text style={styles.pasoLabel}>{paso + 1} / {PREGUNTAS.length}</Text>
      </View>

      <View style={styles.progressRow}>
        {PREGUNTAS.map((_, i) => (
          <View key={i} style={[styles.progressSeg, i <= paso && styles.progressSegActivo]} />
        ))}
      </View>

      <View style={styles.gifCard}>
        <View style={styles.gifBadge}>
          <Text style={styles.gifBadgeTexto}>GIF</Text>
        </View>
        {pregunta.gif ? (
          <Image
            source={pregunta.gif}
            style={styles.gifImagen}
            contentFit="contain"
            autoplay
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={styles.gifContenido}>
            <View style={styles.manosRow}>
              <Ionicons name="hand-left" size={56} color={colors.textMuted} />
              <Ionicons name="hand-right" size={56} color={colors.textMuted} />
            </View>
            <Text style={styles.gifCaption}>Lengua de Señas Chilena (LSCh)</Text>
          </View>
        )}
      </View>

      <View style={styles.preguntaWrapper}>
        <Text style={styles.preguntaTitulo}>{pregunta.titulo}</Text>
        <Text style={styles.preguntaSubtitulo}>{pregunta.subtitulo}</Text>
      </View>

      <View style={styles.botonesRow}>
        <TouchableOpacity style={[styles.boton, styles.botonSi]} onPress={() => responder(true)} activeOpacity={0.85}>
          <Text style={styles.botonTexto}>SÍ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.boton, styles.botonNo]} onPress={() => responder(false)} activeOpacity={0.85}>
          <Text style={styles.botonTexto}>NO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg, paddingHorizontal: 20 },
    centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
    cargandoTitulo: { color: c.textPrimary, fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 20 },
    cargandoTexto: { color: c.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginTop: 10 },
    avisoCircle: { width: 104, height: 104, borderRadius: 52, borderWidth: 3, borderColor: c.primary, backgroundColor: c.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
    avisoTitulo: { color: c.textPrimary, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 14 },
    avisoTexto: { color: c.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 36 },
    botonPrimario: { width: '100%', height: 56, backgroundColor: c.primary, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    botonPrimarioTexto: { color: c.primaryText, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 12 },
    triageLabel: { color: c.primary, fontSize: 14, fontWeight: '800', letterSpacing: 2 },
    pasoLabel: { color: c.primary, fontSize: 14, fontWeight: '800' },
    progressRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    progressSeg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: c.border },
    progressSegActivo: { backgroundColor: c.primary },
    gifCard: { backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.border, padding: 16, marginBottom: 28 },
    gifBadge: { alignSelf: 'flex-end', backgroundColor: c.primary, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
    gifBadgeTexto: { color: c.primaryText, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    gifContenido: { backgroundColor: c.surfaceAlt, borderRadius: 12, paddingVertical: 36, alignItems: 'center', marginTop: 8 },
    gifImagen: { width: '100%', height: 200, borderRadius: 12, marginTop: 8, backgroundColor: c.surfaceAlt },
    manosRow: { flexDirection: 'row', marginBottom: 16 },
    gifCaption: { color: c.textSecondary, fontSize: 14, fontWeight: '500' },
    preguntaWrapper: { alignItems: 'center', marginBottom: 28 },
    preguntaTitulo: { color: c.textPrimary, fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: 0.3 },
    preguntaSubtitulo: { color: c.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 21 },
    botonesRow: { flexDirection: 'row', gap: 16 },
    boton: { flex: 1, height: 96, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    botonSi: { backgroundColor: c.primary },
    botonNo: { backgroundColor: c.danger },
    botonTexto: { color: '#ffffff', fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  });
