import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Colors } from '@/theme/theme';
import { Platform, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { baseUrl } from './_config';

export default function SobreScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [currentAlertaId, setCurrentAlertaId] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [claveInput, setClaveInput] = useState('');
  const [errorClave, setErrorClave] = useState('');
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    const checkAlert = async () => {
      try {
        const alertaId = await (Platform.OS === 'web' ? localStorage.getItem('currentAlertaId') : SecureStore.getItemAsync('currentAlertaId'));
        if (alertaId && alertaId !== '999') {
          setCurrentAlertaId(alertaId);
        }
      } catch (e) { }
    };
    checkAlert();
  }, []);

  const intentarCancelar = async () => {
    if (!claveInput.trim()) {
      setErrorClave('Ingresa tu clave.');
      return;
    }
    setErrorClave('');
    setCancelando(true);

    try {
      const rut = await (Platform.OS === 'web' ? localStorage.getItem('rut') : SecureStore.getItemAsync('rut'));
      
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, clave: claveInput })
      });

      if (!loginRes.ok) {
        setErrorClave('Clave incorrecta.');
        setCancelando(false);
        return;
      }
      
      await procederConCancelacion();
    } catch (e) {
      setErrorClave('Error de conexión.');
      setCancelando(false);
    }
  };

  const procederConCancelacion = async () => {
    if (!currentAlertaId) return;
    const clearLocal = async () => {
      if (Platform.OS === 'web') {
        localStorage.removeItem('currentAlertaId');
      } else {
        await SecureStore.deleteItemAsync('currentAlertaId');
      }
      setCurrentAlertaId(null);
    };

    try {
      const token = await (Platform.OS === 'web' ? localStorage.getItem('token') : SecureStore.getItemAsync('token'));
      
      const getResp = await fetch(`${baseUrl}/api/alertas/${currentAlertaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (getResp.ok) {
        const alertData = await getResp.json();
        alertData.estado = 'Finalizada';
        delete alertData.notasOperador; // no pisar las notas del operador (las conserva el backend)
        const putResp = await fetch(`${baseUrl}/api/alertas/${currentAlertaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(alertData)
        });
        
        if (putResp.ok) {
          await clearLocal();
          Alert.alert("Éxito", "La alerta fue cancelada.");
          router.replace('/(tabs)/home');
        }
      }
    } catch (error) {
      console.error("Error al cancelar alerta", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.title}>SOBRE LA APP</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.logoContainer}>
          <Ionicons name="shield" size={80} color={colors.primary} />
          <Text style={styles.appName}>Emergencia PSorda</Text>
          <Text style={styles.appVersion}>Versión 1.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>
            Esta aplicación ha sido diseñada y desarrollada para brindar acceso inclusivo y directo a los servicios de emergencia (Carabineros de Chile) para la comunidad de Personas Sordas del país.
            {'\n\n'}
            El objetivo principal es reducir los tiempos de respuesta y entregar herramientas visuales (Lengua de Señas Chilena - LSCh) y de chat adaptadas a las necesidades de la comunidad, sin depender exclusivamente de llamadas de voz.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>APOYO INSTITUCIONAL</Text>
          </View>
          <Text style={styles.cardText}>
            Desarrollado con el apoyo y directrices de la <Text style={styles.textBold}>Central de Comunicaciones (CENCO)</Text> y Carabineros de Chile.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="lock-closed" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>PROTOCOLO DE SEGURIDAD</Text>
          </View>
          <Text style={styles.cardText}>
            Por motivos de seguridad y para garantizar la integridad de la información enviada a las patrullas, <Text style={styles.textBold}>la edición de datos personales queda deshabilitada mientras mantengas una emergencia activa</Text>.
          </Text>
        </View>

        {currentAlertaId && (
          <TouchableOpacity style={styles.btnCancelarOculto} onPress={() => { setMostrarModal(true); setClaveInput(''); setErrorClave(''); }}>
            <Ionicons name="close-circle" size={24} color="#fff" />
            <Text style={styles.btnCancelarOcultoTexto}>CANCELAR EMERGENCIA ACTIVA</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          © {new Date().getFullYear()} Gobierno de Chile.{'\n'}Todos los derechos reservados.
        </Text>

      </ScrollView>

      {mostrarModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Cancelación</Text>
            <Text style={styles.modalText}>Ingresa tu clave para verificar tu identidad y cancelar la alerta activa:</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Tu clave personal"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={claveInput}
              onChangeText={setClaveInput}
              autoCapitalize="none"
            />
            {errorClave ? <Text style={styles.errorText}>{errorClave}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setMostrarModal(false)} disabled={cancelando}>
                <Text style={styles.modalBtnCancelText}>VOLVER</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={intentarCancelar} disabled={cancelando}>
                {cancelando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalBtnConfirmText}>CANCELAR ALERTA</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingVertical: 16, paddingHorizontal: 20 },
    backLink: { paddingRight: 16 },
    title: { fontSize: 18, fontWeight: '800', color: c.primaryText, letterSpacing: 0.5 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    logoContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    appName: { fontSize: 24, fontWeight: '900', color: c.textPrimary, marginTop: 12 },
    appVersion: { fontSize: 14, color: c.textSecondary, marginTop: 4 },
    card: { backgroundColor: c.surface, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: c.borderSoft },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: c.primary, letterSpacing: 0.5 },
    cardText: { fontSize: 14, color: c.textSecondary, lineHeight: 22 },
    textBold: { fontWeight: '800', color: c.textPrimary },
    footerText: { textAlign: 'center', fontSize: 12, color: c.textMuted, marginTop: 20, lineHeight: 18 },
    btnCancelarOculto: { backgroundColor: c.danger, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, gap: 8, elevation: 3, shadowColor: c.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
    btnCancelarOcultoTexto: { color: '#ffffff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modalContent: { width: '85%', backgroundColor: c.surface, borderRadius: 16, padding: 24, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: c.danger, marginBottom: 12, textAlign: 'center' },
    modalText: { fontSize: 14, color: c.textSecondary, marginBottom: 20, textAlign: 'center', lineHeight: 20 },
    modalInput: { backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border, borderRadius: 8, paddingHorizontal: 16, height: 50, fontSize: 16, color: c.textPrimary, marginBottom: 12 },
    errorText: { color: c.danger, fontSize: 13, marginBottom: 16, textAlign: 'center', fontWeight: 'bold' },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalBtnCancel: { flex: 1, backgroundColor: c.bg, borderWidth: 1, borderColor: c.border, borderRadius: 8, height: 48, justifyContent: 'center', alignItems: 'center' },
    modalBtnCancelText: { color: c.textSecondary, fontWeight: '700' },
    modalBtnConfirm: { flex: 1, backgroundColor: c.danger, borderRadius: 8, height: 48, justifyContent: 'center', alignItems: 'center' },
    modalBtnConfirmText: { color: '#ffffff', fontWeight: '700' },
  });
