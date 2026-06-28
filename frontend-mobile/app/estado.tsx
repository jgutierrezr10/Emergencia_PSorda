import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapaUbicacion from '@/components/MapaUbicacion';

type EstadoGps = 'cargando' | 'ok' | 'denegado' | 'error';

export default function EstadoScreen() {
  // Cronómetro de la emergencia (simulado)
  const [segundos, setSegundos] = useState(13);
  // Ubicación real del dispositivo
  const [coords, setCoords] = useState<{ lat: number; lng: number; acc: number | null } | null>(null);
  const [direccion, setDireccion] = useState('');
  const [gps, setGps] = useState<EstadoGps>('cargando');

  useEffect(() => {
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const cargarUbicacion = useCallback(async () => {
    setGps('cargando');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGps('denegado');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCoords({ lat, lng, acc: pos.coords.accuracy ?? null });
      setGps('ok');

      // Dirección legible (puede no estar disponible en web)
      try {
        const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geo && geo[0]) {
          const g = geo[0];
          const calle = [g.street, g.streetNumber].filter(Boolean).join(' ');
          const ciudad = g.city || g.subregion || g.region || '';
          setDireccion([calle, ciudad].filter(Boolean).join(', ') || 'Ubicación encontrada');
        }
      } catch {
        // reverseGeocode no soportado en esta plataforma
      }
    } catch {
      setGps('error');
    }
  }, []);

  useEffect(() => {
    cargarUbicacion();
  }, [cargarUbicacion]);

  const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
  const ss = String(segundos % 60).padStart(2, '0');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header de estado */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/home')}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCheck}>
          <Ionicons name="checkmark" size={20} color="#059669" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitulo}>Alerta recibida por CENCO</Text>
          <Text style={styles.headerSubtitulo}>Unidades en camino — Tiempo: {mm}:{ss}</Text>
        </View>
        <Ionicons name="navigate" size={22} color="#d1fae5" />
      </View>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {/* ===================================================================
            MAPA REAL: OpenStreetMap centrado en la ubicación del dispositivo
            (expo-location). La posición de la patrulla y el ETA en vivo aún
            deben venir del backend (Spring Boot).
            =================================================================== */}
        <View style={styles.mapa}>
          {gps === 'ok' && coords ? (
            <MapaUbicacion lat={coords.lat} lng={coords.lng} />
          ) : (
            <View style={styles.mapaEstado}>
              {gps === 'cargando' && (
                <>
                  <ActivityIndicator color="#059669" size="large" />
                  <Text style={styles.mapaEstadoTexto}>Obteniendo tu ubicación…</Text>
                </>
              )}
              {gps === 'denegado' && (
                <>
                  <Ionicons name="location-outline" size={40} color="#9ca3af" />
                  <Text style={styles.mapaEstadoTexto}>Permiso de ubicación denegado</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={cargarUbicacion}>
                    <Text style={styles.retryTexto}>Permitir ubicación</Text>
                  </TouchableOpacity>
                </>
              )}
              {gps === 'error' && (
                <>
                  <Ionicons name="warning-outline" size={40} color="#dc2626" />
                  <Text style={styles.mapaEstadoTexto}>No se pudo obtener la ubicación</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={cargarUbicacion}>
                    <Text style={styles.retryTexto}>Reintentar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        {/* Tu ubicación (real) */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="location" size={22} color="#dc2626" style={styles.cardIcon} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Tu ubicación</Text>
              <Text style={styles.cardTitulo}>
                {direccion || (gps === 'ok' ? 'Ubicación obtenida' : 'Obteniendo dirección…')}
              </Text>
              <Text style={styles.cardSub}>
                {coords
                  ? `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}° (GPS ±${coords.acc ? Math.round(coords.acc) : '—'}m)`
                  : 'Esperando señal GPS…'}
              </Text>
            </View>
          </View>
        </View>

        {/* Unidad más cercana (datos del backend — por ahora simulados) */}
        <View style={[styles.card, styles.cardUnidad]}>
          <View style={styles.cardRow}>
            <View style={styles.unidadIcono}>
              <Ionicons name="car-sport" size={24} color="#ffffff" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.unidadLabel}>UNIDAD MÁS CERCANA</Text>
              <Text style={styles.cardTitulo}>Patrulla 42 — Carabineros</Text>
              <View style={styles.etaRow}>
                <Ionicons name="time-outline" size={14} color="#059669" />
                <Text style={styles.etaTexto}>ETA: ~4 minutos · 1.2 km</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Acciones: videollamada y chat */}
        <TouchableOpacity style={styles.btnAccion} onPress={() => router.push('/videollamada')} activeOpacity={0.85}>
          <Ionicons name="videocam" size={22} color="#ffffff" />
          <Text style={styles.btnAccionTexto}>INICIAR VIDEOLLAMADA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnAccion} onPress={() => router.push('/chat')} activeOpacity={0.85}>
          <Ionicons name="chatbubbles" size={22} color="#ffffff" />
          <Text style={styles.btnAccionTexto}>ABRIR CHAT</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/home')}>
          <Ionicons name="home-outline" size={22} color="#9ca3af" />
          <Text style={styles.navTexto}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/perfil')}>
          <Ionicons name="person-outline" size={22} color="#9ca3af" />
          <Text style={styles.navTexto}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCheck: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitulo: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitulo: {
    color: '#d1fae5',
    fontSize: 12,
    marginTop: 2,
  },
  contenido: {
    padding: 16,
    paddingBottom: 28,
  },
  mapa: {
    height: 280,
    borderRadius: 16,
    backgroundColor: '#e8efe9',
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapaEstado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  mapaEstadoTexto: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 4,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryTexto: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardUnidad: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  cardSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 3,
  },
  unidadIcono: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unidadLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb',
    marginBottom: 2,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  etaTexto: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  btnAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    backgroundColor: '#059669',
    borderRadius: 14,
    marginTop: 6,
    marginBottom: 6,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnAccionTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  navTexto: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
});
