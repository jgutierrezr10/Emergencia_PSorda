import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapaUbicacion from '@/components/MapaUbicacion';
import { inicioPatrulla, posicionPatrulla, obtenerRutaCalles, puntoEnRuta, LatLng } from '@/components/patrulla-sim';
import { useTheme, Colors } from '@/theme/theme';
import * as SecureStore from 'expo-secure-store';
import { baseUrl } from './_config';

const obtenerDato = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return await SecureStore.getItemAsync(key);
};

type EstadoGps = 'cargando' | 'ok' | 'denegado' | 'error';

// === SIMULACIÓN DEL DESPACHO ===
// El ETA es simulado: una cuenta regresiva fija que arranca cuando CENCO despacha la patrulla.
// PARA LA VERSIÓN REAL: reemplazar ETA_TOTAL_SEG por el tiempo estimado que entregue el backend
// (p. ej. un campo despacho.segundosEstimados, o calcular desde la hora estimada de llegada).
// El disparo del despacho YA es real: se basa en alerta.estado === 'Despachada'.
const ETA_TOTAL_SEG = 360; // 6 minutos simulados

export default function EstadoScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [segundos, setSegundos] = useState(13);
  const [coords, setCoords] = useState<{ lat: number; lng: number; acc: number | null } | null>(null);
  const [direccion, setDireccion] = useState('');
  const [gps, setGps] = useState<EstadoGps>('cargando');
  const [alertaEstado, setAlertaEstado] = useState('ACTIVO');
  const [despachoInicio, setDespachoInicio] = useState<number | null>(null);
  const [etaRestante, setEtaRestante] = useState<number | null>(null);
  const [alertaId, setAlertaId] = useState<number | null>(null);
  const [patrulla, setPatrulla] = useState<LatLng | null>(null);
  const [ruta, setRuta] = useState<LatLng[] | null>(null);
  const [nombreRef, setNombreRef] = useState<string | null>(null);

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

      // Actualizar ubicación en el backend
      try {
        const currentId = await obtenerDato('currentAlertaId');
        if (currentId && currentId !== '999') {
          const token = await obtenerDato('token');
          const getResp = await fetch(`${baseUrl}/api/alertas/${currentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (getResp.ok) {
            const alertData = await getResp.json();
            alertData.latitudLongitud = `${lat},${lng}`;
            await fetch(`${baseUrl}/api/alertas/${currentId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(alertData)
            });
          }
        }
      } catch (e) {
        console.warn('Error actualizando ubicación en el servidor:', e);
      }

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

  // Polling del estado de la alerta
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const currentId = await obtenerDato('currentAlertaId');
        if (!currentId || currentId === '999') return;
        setAlertaId(Number(currentId));

        const token = await obtenerDato('token');
        const res = await fetch(`${baseUrl}/api/alertas/${currentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAlertaEstado(data.estado);
          if (data.personaSorda && data.personaSorda.nombreReferenciaCasa) {
            setNombreRef(data.personaSorda.nombreReferenciaCasa);
          }
          if (data.estado === 'Finalizada') {
            router.replace('/home');
          }
        }
      } catch (e) {
        console.warn('Error consultando estado de la alerta:', e);
      }
    };

    const intervalId = setInterval(checkStatus, 3000);
    checkStatus();
    return () => clearInterval(intervalId);
  }, []);

  // Detectar el despacho de la patrulla (CENCO apretó "DESPACHAR PATRULLA" => estado 'Despachada')
  // y arrancar la cuenta regresiva una sola vez.
  useEffect(() => {
    if (alertaEstado === 'Despachada' && despachoInicio === null) {
      setDespachoInicio(Date.now());
    }
  }, [alertaEstado, despachoInicio]);

  // Al despachar, traer la ruta por calles (OSRM) una sola vez.
  useEffect(() => {
    if (despachoInicio === null || !coords || ruta !== null) return;
    const destino: LatLng = { lat: coords.lat, lng: coords.lng };
    const inicio = inicioPatrulla(destino, alertaId ?? 7);
    let cancelado = false;
    obtenerRutaCalles(inicio, destino).then((r) => { if (!cancelado) setRuta(r); });
    return () => { cancelado = true; };
  }, [despachoInicio, coords, alertaId, ruta]);

  // Cuenta regresiva del ETA en tiempo real (1 vez por segundo).
  useEffect(() => {
    if (despachoInicio === null) return;
    const tick = () => {
      const transcurrido = Math.floor((Date.now() - despachoInicio) / 1000);
      setEtaRestante(Math.max(0, ETA_TOTAL_SEG - transcurrido));
      if (coords) {
        const destino: LatLng = { lat: coords.lat, lng: coords.lng };
        const progreso = transcurrido / ETA_TOTAL_SEG;
        if (ruta && ruta.length > 1) {
          setPatrulla(puntoEnRuta(ruta, progreso));
        } else {
          const inicio = inicioPatrulla(destino, alertaId ?? 7);
          setPatrulla(posicionPatrulla(inicio, destino, progreso));
        }
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [despachoInicio, coords, alertaId, ruta]);

  const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
  const ss = String(segundos % 60).padStart(2, '0');

  const patrullaDespachada = alertaEstado === 'Despachada';
  const etaSeg = etaRestante ?? ETA_TOTAL_SEG;
  const etaMin = String(Math.floor(etaSeg / 60)).padStart(2, '0');
  const etaSs = String(etaSeg % 60).padStart(2, '0');
  const patrullaLlegando = patrullaDespachada && etaRestante !== null && etaRestante <= 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/home')}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCheck}>
          <Ionicons name="checkmark" size={20} color={colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitulo}>CENCO YA TIENE TU ALERTA</Text>
          <Text style={styles.headerSubtitulo}>
            {patrullaDespachada
              ? (patrullaLlegando ? 'PATRULLA YA LLEGA AL LUGAR' : `PATRULLA EN CAMINO — LLEGA ${etaMin}:${etaSs}`)
              : `CENCO MIRA TU ALERTA — ${mm}:${ss}`}
          </Text>
        </View>
        <Ionicons name="navigate" size={22} color="#d1fae5" />
      </View>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {/* MAPA REAL (OpenStreetMap + expo-location). La patrulla y el ETA vienen del backend. */}
        <View style={styles.mapa}>
          {gps === 'ok' && coords ? (
            <MapaUbicacion
              lat={coords.lat}
              lng={coords.lng}
              patrolLat={patrullaDespachada ? patrulla?.lat : null}
              patrolLng={patrullaDespachada ? patrulla?.lng : null}
              routeCoords={patrullaDespachada && ruta ? ruta.map((p) => [p.lat, p.lng] as [number, number]) : null}
            />
          ) : (
            <View style={styles.mapaEstado}>
              {gps === 'cargando' && (
                <>
                  <ActivityIndicator color={colors.primary} size="large" />
                  <Text style={styles.mapaEstadoTexto}>BUSCANDO TU UBICACIÓN…</Text>
                </>
              )}
              {gps === 'denegado' && (
                <>
                  <Ionicons name="location-outline" size={40} color={colors.textMuted} />
                  <Text style={styles.mapaEstadoTexto}>UBICACIÓN BLOQUEADA. TÚ PERMITIR.</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={cargarUbicacion}>
                    <Text style={styles.retryTexto}>PERMITIR UBICACIÓN</Text>
                  </TouchableOpacity>
                </>
              )}
              {gps === 'error' && (
                <>
                  <Ionicons name="warning-outline" size={40} color={colors.danger} />
                  <Text style={styles.mapaEstadoTexto}>UBICACIÓN ERROR. NO ENCONTRADA.</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={cargarUbicacion}>
                    <Text style={styles.retryTexto}>INTENTAR OTRA VEZ</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="location" size={22} color={colors.danger} style={styles.cardIcon} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>TU UBICACIÓN</Text>
              <Text style={styles.cardTitulo}>{direccion || (gps === 'ok' ? 'UBICACIÓN LISTA' : 'BUSCANDO DIRECCIÓN…')}</Text>
              {nombreRef && <Text style={styles.cardRefTexto}>🏠 REFERENCIA: {nombreRef}</Text>}
              <Text style={styles.cardSub}>
                {coords ? `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}° (GPS ±${coords.acc ? Math.round(coords.acc) : '—'}m)` : 'ESPERANDO GPS…'}
              </Text>
            </View>
          </View>
        </View>

        {patrullaDespachada ? (
          <View style={[styles.card, styles.cardUnidad]}>
            <View style={styles.cardRow}>
              <View style={styles.unidadIcono}>
                <Ionicons name="car-sport" size={24} color="#ffffff" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.unidadLabel}>PATRULLA EN CAMINO</Text>
                <Text style={styles.cardTitulo}>Patrulla 42 — Carabineros</Text>
                <View style={styles.etaRow}>
                  <Ionicons name="time-outline" size={14} color={colors.primary} />
                  <Text style={styles.etaTexto}>
                    {patrullaLlegando ? 'PATRULLA YA LLEGA AL LUGAR' : `LLEGA EN ${etaMin}:${etaSs} MIN`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.card, styles.cardEspera]}>
            <View style={styles.cardRow}>
              <View style={styles.esperaIcono}>
                <ActivityIndicator color="#f59e0b" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.esperaLabel}>ESPERANDO DESPACHO</Text>
                <Text style={styles.cardTitulo}>CENCO MIRA TU ALERTA</Text>
                <Text style={styles.cardSub}>AÚN NO SALE PATRULLA. TÚ ESPERA.</Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.btnAccion} onPress={() => router.push('/videollamada')} activeOpacity={0.85}>
          <Ionicons name="videocam" size={22} color="#ffffff" />
          <Text style={styles.btnAccionTexto}>EMPEZAR VIDEOLLAMADA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnAccion} onPress={() => router.push('/chat')} activeOpacity={0.85}>
          <Ionicons name="chatbubbles" size={22} color="#ffffff" />
          <Text style={styles.btnAccionTexto}>ABRIR CHAT</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/home')}>
          <Ionicons name="home-outline" size={22} color={colors.textMuted} />
          <Text style={styles.navTexto}>INICIO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/perfil')}>
          <Ionicons name="person-outline" size={22} color={colors.textMuted} />
          <Text style={styles.navTexto}>PERFIL</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
    backBtn: { width: 32, height: 34, justifyContent: 'center', alignItems: 'center' },
    headerCheck: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
    headerInfo: { flex: 1 },
    headerTitulo: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
    headerSubtitulo: { color: '#d1fae5', fontSize: 12, marginTop: 2 },
    contenido: { padding: 16, paddingBottom: 28 },
    mapa: { height: 280, borderRadius: 16, backgroundColor: c.surfaceAlt, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: c.border },
    mapaEstado: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 20 },
    mapaEstadoTexto: { color: c.textSecondary, fontSize: 14, fontWeight: '600', textAlign: 'center' },
    retryBtn: { marginTop: 4, backgroundColor: c.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
    retryTexto: { color: c.primaryText, fontSize: 13, fontWeight: '700' },
    card: { backgroundColor: c.surface, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: c.border },
    cardUnidad: { borderColor: '#3b82f6', backgroundColor: c.surface },
    cardEspera: { borderColor: '#f59e0b', backgroundColor: c.surface },
    esperaIcono: { width: 44, height: 44, borderRadius: 10, backgroundColor: c.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    esperaLabel: { fontSize: 12, fontWeight: '800', color: '#f59e0b', marginBottom: 2 },
    cardRow: { flexDirection: 'row', alignItems: 'center' },
    cardIcon: { marginRight: 12 },
    cardInfo: { flex: 1 },
    cardLabel: { fontSize: 12, color: c.textMuted, marginBottom: 2 },
    cardTitulo: { fontSize: 15, fontWeight: '800', color: c.textPrimary },
    cardRefTexto: { fontSize: 13, fontWeight: 'bold', color: c.primary, marginTop: 4, marginBottom: 2 },
    cardSub: { fontSize: 12, color: c.textMuted, marginTop: 3 },
    unidadIcono: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    unidadLabel: { fontSize: 12, fontWeight: '800', color: '#3b82f6', marginBottom: 2 },
    etaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
    etaTexto: { fontSize: 13, color: c.primary, fontWeight: '600' },
    btnAccion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 56, backgroundColor: c.primary, borderRadius: 14, marginTop: 6, marginBottom: 6 },
    btnAccionTexto: { color: c.primaryText, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
    navBar: { flexDirection: 'row', backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border, paddingVertical: 10, paddingHorizontal: 8 },
    navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, gap: 3 },
    navTexto: { fontSize: 10, color: c.textMuted, fontWeight: '600' },
  });
