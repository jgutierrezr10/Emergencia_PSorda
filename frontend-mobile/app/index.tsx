import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

// Funciones compatibles con web y movil
const guardarDato = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const obtenerDato = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export default function LoginScreen() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const token = await obtenerDato('token');
        const rol = await obtenerDato('rol');

        if (token && rol === 'Sordo') {
          router.replace('/(tabs)/home');
        }
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

  const handleLogin = async () => {
    setError('');

    if (!rut || !password) {
      setError('Por favor complete todos los campos.');
      return;
    }

    setLoading(true);

    // =========================================================================
    // MODO DEMO (sin backend): login simulado para poder probar el frontend.
    // El backend (Spring Boot) lo conecta otro integrante más adelante.
    // Cuando esté listo, borra este bloque y descomenta el bloque real de abajo.
    // =========================================================================
    setTimeout(async () => {
      try {
        await guardarDato('token', 'demo-token');
        await guardarDato('rol', 'Sordo');
      } catch (e) {
        // SecureStore no disponible en web, se ignora
      }
      setLoading(false);
      router.replace('/(tabs)/home');
    }, 800);

    /* =========================================================================
    // BLOQUE REAL (descomentar cuando el backend esté disponible):
    try {
      const baseUrl = 'http://192.168.1.123:8080'; // IP del servidor en la red Wi-Fi
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
        await guardarDato('token', data.token);
        await guardarDato('rol', data.rol);
        router.replace('/(tabs)/home');
      } else {
        setError('Rol de usuario no válido para esta aplicación.');
      }
    } catch (err: any) {
      setError(err.message || 'Error de red. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
    ========================================================================= */
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="ear-outline" size={48} color="#059669" />
            </View>
            <Text style={styles.title}>Emergencia Inclusiva</Text>
            <Text style={styles.subtitle}>Conexión directa y accesible</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            <Text style={styles.formSubtitle}>Ingresa tus datos para continuar</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>RUT</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="12.345.678-9"
                  placeholderTextColor="#9ca3af"
                  value={rut}
                  onChangeText={handleRutChange}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Clave Única</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'CONECTANDO...' : 'INGRESAR'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotLink} onPress={() => router.push('/recuperar-clave')}>
              <Text style={styles.forgotLinkText}>¿Olvidaste tu Clave Única?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.registroLink} onPress={() => router.push('/registro')}>
            <Text style={styles.registroLinkText}>
              ¿No tienes cuenta? <Text style={styles.registroLinkBold}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Desarrollado para la comunidad sorda.{'\n'}
            Garantizando acceso igualitario a emergencias.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#059669',
    fontWeight: '600',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: '100%',
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#6ee7b7',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  forgotLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotLinkText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  registroLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registroLinkText: {
    color: '#6b7280',
    fontSize: 14,
  },
  registroLinkBold: {
    color: '#059669',
    fontWeight: '700',
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
});
