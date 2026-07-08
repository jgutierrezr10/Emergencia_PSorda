import { View, Text, Pressable, Modal, Animated, Easing, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useTheme, Colors } from '@/theme/theme';
import { baseUrl } from '../_config';

const obtenerDato = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return await SecureStore.getItemAsync(key);
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [alertaActiva, setAlertaActiva] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const verificarEstado = async () => {
        try {
          const currentId = await obtenerDato('currentAlertaId');
          const token = await obtenerDato('token');
          let alertaSigueActiva = false;

          if (currentId && currentId !== '999') {
            const res = await fetch(`${baseUrl}/api/alertas/${currentId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              if (data.estado !== 'Finalizada') {
                alertaSigueActiva = true;
              } else {
                await (Platform.OS === 'web' ? localStorage.removeItem('currentAlertaId') : SecureStore.deleteItemAsync('currentAlertaId'));
              }
            }
          } else if (currentId === '999') {
            alertaSigueActiva = true;
          }

          // Si no hay alerta activa conocida, consultar al backend por RUT
          if (!alertaSigueActiva) {
            const rut = await obtenerDato('rut');
            if (rut) {
              const resActiva = await fetch(`${baseUrl}/api/alertas/activa/rut/${rut}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (resActiva.ok) {
                const activaData = await resActiva.json();
                await (Platform.OS === 'web' ? localStorage.setItem('currentAlertaId', activaData.id.toString()) : SecureStore.setItemAsync('currentAlertaId', activaData.id.toString()));
                alertaSigueActiva = true;
              }
            }
          }

          if (isMounted) setAlertaActiva(alertaSigueActiva);
        } catch (e) {
          console.warn('Error verificando estado de alerta:', e);
          if (isMounted) setAlertaActiva(false);
        } finally {
          if (isMounted) setVerificando(false);
        }
      };
      
      verificarEstado();
      
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mk = (v: Animated.Value) =>
      Animated.loop(
        Animated.timing(v, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      );
    const a1 = mk(ring1);
    a1.start();
    let a2: Animated.CompositeAnimation;
    const t = setTimeout(() => {
      a2 = mk(ring2);
      a2.start();
    }, 1100);
    return () => {
      a1.stop();
      a2?.stop();
      clearTimeout(t);
    };
  }, [ring1, ring2]);

  const ringStyle = (v: Animated.Value) => ({
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
  });

  const confirmarAlerta = () => {
    setModalConfirmar(false);
    router.push('/triage');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
          </View>
          <Text style={styles.brandTexto}>CARABINEROS CHILE · CENCO</Text>
        </View>
        <View style={styles.estadoPill}>
          <View style={styles.estadoDot} />
          <Text style={styles.estadoTexto}>ACTIVO</Text>
        </View>
      </View>

      <View style={styles.contenido}>
        {verificando ? (
          <Text style={styles.titulo}>CARGANDO...</Text>
        ) : alertaActiva ? (
          <>
            <Text style={styles.titulo}>¡EMERGENCIA EN CURSO!</Text>
            <Text style={[styles.instruccion, { color: colors.danger, fontWeight: 'bold' }]}>
              CARABINEROS YA TIENE TU UBICACIÓN
            </Text>

            <View style={styles.botonZona}>
              <Animated.View style={[styles.ring, ringStyle(ring1), { backgroundColor: colors.primary }]} />
              <Animated.View style={[styles.ring, ringStyle(ring2), { backgroundColor: colors.primary }]} />
              <Pressable
                style={({ pressed }) => [styles.botonPanico, { backgroundColor: colors.primary, shadowColor: colors.primary }, pressed && styles.botonPanicoPressed]}
                onPress={() => router.push('/estado')}
              >
                <Ionicons name="map" size={52} color="#ffffff" />
                <Text style={styles.botonPanicoTexto}>VER ESTADO</Text>
              </Pressable>
            </View>

            <View style={styles.avisoCard}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={styles.aviso}>
                TOCA EL BOTÓN AZUL PARA VER EL MAPA Y CHATEAR CON EL OPERADOR.
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.titulo}>¿NECESITAS AYUDA?</Text>
            <Text style={styles.instruccion}>CALMA. TOCA BOTÓN.</Text>

            <View style={styles.botonZona}>
              <Animated.View style={[styles.ring, ringStyle(ring1)]} />
              <Animated.View style={[styles.ring, ringStyle(ring2)]} />
              <Pressable
                style={({ pressed }) => [styles.botonPanico, pressed && styles.botonPanicoPressed]}
                onPress={() => setModalConfirmar(true)}
              >
                <Ionicons name="alert" size={52} color="#ffffff" />
                <Text style={styles.botonPanicoTexto}>URGENCIA</Text>
              </Pressable>
            </View>

            <View style={styles.avisoCard}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={styles.aviso}>
                TÚ TOCAR BOTÓN. ENVIAR TU UBICACIÓN GPS A CARABINEROS (CENCO).
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.navBar}>
        <Pressable style={styles.navItem}>
          <Ionicons name="home" size={22} color={colors.primary} />
          <Text style={[styles.navTexto, styles.navTextoActivo]}>INICIO</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('/perfil')}>
          <Ionicons name="person-outline" size={22} color={colors.textMuted} />
          <Text style={styles.navTexto}>PERFIL</Text>
        </Pressable>
      </View>

      <Modal visible={modalConfirmar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcono}>
              <Ionicons name="alert" size={30} color={colors.danger} />
            </View>
            <Text style={styles.modalTitulo}>¿CONFIRMAR URGENCIA?</Text>
            <Text style={styles.modalDescripcion}>
              ENVIAR ALERTA + TU UBICACIÓN GPS A CARABINEROS. AHORA.
            </Text>
            <Pressable style={({ pressed }) => [styles.btnConfirmar, pressed && { opacity: 0.9 }]} onPress={confirmarAlerta}>
              <Text style={styles.btnConfirmarTexto}>SÍ, ENVIAR ALERTA</Text>
            </Pressable>
            <Pressable style={styles.btnCancelar} onPress={() => setModalConfirmar(false)}>
              <Text style={styles.btnCancelarTexto}>CANCELAR</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    brandIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: c.primarySoft, justifyContent: 'center', alignItems: 'center' },
    brandTexto: { fontSize: 12, color: c.textSecondary, fontWeight: '600' },
    estadoPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.primarySoft, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
    estadoDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.primary },
    estadoTexto: { fontSize: 11, color: c.primary, fontWeight: '700' },
    contenido: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
    titulo: { fontSize: 28, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.4 },
    instruccion: { fontSize: 15, color: c.textMuted, marginTop: 6, marginBottom: 56 },
    botonZona: { width: 280, height: 280, justifyContent: 'center', alignItems: 'center' },
    ring: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: c.danger },
    botonPanico: {
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: c.danger,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      shadowColor: c.danger,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.45,
      shadowRadius: 24,
      elevation: 14,
      borderWidth: 8,
      borderColor: c.bg,
    },
    botonPanicoPressed: { transform: [{ scale: 0.96 }] },
    botonPanicoTexto: { color: '#ffffff', fontSize: 22, fontWeight: '900', letterSpacing: 1.5 },
    avisoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginTop: 56,
      borderWidth: 1,
      borderColor: c.borderSoft,
    },
    aviso: { flex: 1, fontSize: 13, color: c.textSecondary, lineHeight: 19 },
    navBar: { flexDirection: 'row', backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.borderSoft, paddingVertical: 10, paddingHorizontal: 8 },
    navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, gap: 3 },
    navTexto: { fontSize: 10, color: c.textMuted, fontWeight: '600' },
    navTextoActivo: { color: c.primary, fontWeight: '800' },
    modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalCard: { backgroundColor: c.surface, borderRadius: 24, padding: 28, width: '100%', maxWidth: 380, alignItems: 'center' },
    modalIcono: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.dangerSoft, borderWidth: 2, borderColor: c.danger, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
    modalTitulo: { fontSize: 20, fontWeight: '800', color: c.textPrimary, marginBottom: 10, textAlign: 'center' },
    modalDescripcion: { fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
    btnConfirmar: { width: '100%', height: 54, backgroundColor: c.danger, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    btnConfirmarTexto: { color: '#ffffff', fontSize: 15, fontWeight: '900', letterSpacing: 0.8 },
    btnCancelar: { width: '100%', height: 48, justifyContent: 'center', alignItems: 'center' },
    btnCancelarTexto: { color: c.textMuted, fontSize: 14, fontWeight: '600' },
  });
