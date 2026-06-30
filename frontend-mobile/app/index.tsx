import { View, Text, TextInput, Pressable, ScrollView, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Colors } from '@/theme/theme';
import { baseUrl } from './_config';

import TerminosModal from '@/components/TerminosModal';
import { TERMINOS_VERSION } from '@/constants/terminos';

const guardarDato = async (key: string, value: string) => {
  if (Platform.OS === 'web') localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
};

const obtenerDato = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return await SecureStore.getItemAsync(key);
};

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [foco, setFoco] = useState<'rut' | 'clave' | null>(null);
  
  // NUEVO: Estado para el modal de T&C
  const [mostrarTerminos, setMostrarTerminos] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const token = await obtenerDato('token');
        const rol = await obtenerDato('rol');
        if (token && rol === 'Sordo') router.replace('/(tabs)/home');
      } catch (e) {
        // SecureStore no disponible en web, se ignora
      }
    };
    verificarSesion();
  }, []);

  const handleRutChange = (text: string) => {
    let clean = text.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length <= 1) {
      setRut(clean);
      return;
    }
    let formatted = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + clean.slice(-1);
    setRut(formatted);
  };

  // NUEVA FUNCIÓN: Verifica si debe mostrar modal o avanzar a home
  const procesarIngresoExitoso = async () => {
    try {
      const versionAceptada = await obtenerDato('terminos_version');
      if (versionAceptada === TERMINOS_VERSION) {
        router.replace('/(tabs)/home');
      } else {
        setMostrarTerminos(true); // Levanta el modal bloqueante
      }
    } catch (e) {
      setMostrarTerminos(true);
    }
  };

  const handleAceptarTerminos = async () => {
    await guardarDato('terminos_version', TERMINOS_VERSION);
    setMostrarTerminos(false);
    router.replace('/(tabs)/home');
  };

  const handleLogin = async () => {
    setError('');
    if (!rut || !password) {
      setError('FALTAN DATOS. COMPLETA TODO.');
      return;
    }
    setLoading(true);

    try {
      const cleanRut = rut.replace(/\./g, '');
      
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut: cleanRut, clave: password }),
      });
      
      if (!response.ok) {
        throw new Error('Credenciales incorrectas o error de conexión.');
      }
      
      const data = await response.json();
      
      if (data.rol === 'Carabinero') {
        setError('Acceso denegado: Usa el portal web de Carabineros.');
        setLoading(false);
        return;
      }
      
      if (data.rol === 'Sordo') {
        try {
          await guardarDato('token', data.token);
          await guardarDato('rol', data.rol);
          await guardarDato('rut', data.rut || cleanRut);
          await guardarDato('usuarioId', String(data.usuarioId));
          await guardarDato('personaSordaId', String(data.personaSordaId));
        } catch (e) {}
        
        await procesarIngresoExitoso(); // Reemplaza router.replace directo
      } else {
        setError('Rol de usuario no válido para esta aplicación.');
      }
    } catch (err: any) {
      setError(err.message || 'Error de red. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.brand}>
            <View style={styles.iconRingOuter}>
              <View style={styles.iconRing}>
                <Ionicons name="ear" size={40} color={colors.primary} />
              </View>
            </View>
            <Text style={styles.title}>Emergencia{'\n'}Inclusiva</Text>
            <View style={styles.subtitleRow}>
              <View style={styles.dot} />
              <Text style={styles.subtitle}>CONEXIÓN DIRECTA CARABINEROS</Text>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>HOLA, BIENVENIDO</Text>
            <Text style={styles.formSubtitle}>TÚ ENTRAR TU CUENTA</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>RUT</Text>
            <View style={[styles.inputWrap, foco === 'rut' && styles.inputWrapFoco]}>
              <Ionicons name="person-outline" size={20} color={foco === 'rut' ? colors.primary : colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="12.345.678-9"
                placeholderTextColor={colors.textMuted}
                value={rut}
                onChangeText={handleRutChange}
                onFocus={() => setFoco('rut')}
                onBlur={() => setFoco(null)}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>CLAVE ÚNICA</Text>
            <View style={[styles.inputWrap, foco === 'clave' && styles.inputWrapFoco]}>
              <Ionicons name="lock-closed-outline" size={20} color={foco === 'clave' ? colors.primary : colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFoco('clave')}
                onBlur={() => setFoco(null)}
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'CONECTANDO…' : 'ENTRAR'}</Text>
              {!loading && <Ionicons name="arrow-forward" size={18} color={colors.primaryText} />}
            </Pressable>

            <Pressable style={styles.forgotLink} onPress={() => router.push('/recuperar-clave')}>
              <Text style={styles.forgotLinkText}>¿CLAVE ÚNICA OLVIDASTE?</Text>
            </Pressable>
          </View>

          <Pressable style={styles.registroLink} onPress={() => router.push('/registro')}>
            <Text style={styles.registroLinkText}>
              ¿CUENTA NO TIENES? <Text style={styles.registroLinkBold}>REGISTRAR AQUÍ</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* COMPONENTE MODAL AQUÍ */}
      <TerminosModal 
        visible={mostrarTerminos} 
        onAceptar={handleAceptarTerminos}
        onRechazar={() => setMostrarTerminos(false)} 
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
    brand: { alignItems: 'center', marginBottom: 36 },
    iconRingOuter: { width: 104, height: 104, borderRadius: 52, backgroundColor: c.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    iconRing: { width: 76, height: 76, borderRadius: 38, backgroundColor: c.surface, justifyContent: 'center', alignItems: 'center', shadowColor: c.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 6 },
    title: { fontSize: 34, lineHeight: 38, fontWeight: '800', color: c.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
    subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.primary },
    subtitle: { fontSize: 14, color: c.textSecondary, fontWeight: '500' },
    form: { backgroundColor: c.surface, borderRadius: 24, padding: 26, shadowColor: '#000000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 30, elevation: 4, borderWidth: 1, borderColor: c.borderSoft },
    formTitle: { fontSize: 22, fontWeight: '800', color: c.textPrimary },
    formSubtitle: { fontSize: 14, color: c.textMuted, marginTop: 4, marginBottom: 22 },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.dangerSoft, padding: 12, borderRadius: 12, marginBottom: 18 },
    errorText: { color: c.danger, fontSize: 13, fontWeight: '500', flex: 1 },
    label: { fontSize: 12, fontWeight: '700', color: c.textSecondary, marginBottom: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.inputBg, borderWidth: 1.5, borderColor: c.border, borderRadius: 14, paddingHorizontal: 16, height: 58, marginBottom: 16 },
    inputWrapFoco: { borderColor: c.primary, backgroundColor: c.surface },
    input: { flex: 1, fontSize: 16, color: c.textPrimary, height: '100%' },
    button: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: c.primary, borderRadius: 14, height: 58, marginTop: 10, shadowColor: c.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.32, shadowRadius: 14, elevation: 6 },
    buttonPressed: { transform: [{ scale: 0.98 }], shadowOpacity: 0.2 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: c.primaryText, fontSize: 16, fontWeight: '800', letterSpacing: 0.8 },
    forgotLink: { alignItems: 'center', marginTop: 18 },
    forgotLinkText: { color: c.primary, fontSize: 14, fontWeight: '600' },
    registroLink: { alignItems: 'center', marginTop: 26 },
    registroLinkText: { color: c.textMuted, fontSize: 14 },
    registroLinkBold: { color: c.primary, fontWeight: '700' },
  });