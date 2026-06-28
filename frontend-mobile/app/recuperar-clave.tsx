import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RecuperarClaveScreen() {
  const [rut, setRut] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleRutChange = (text: string) => {
    let clean = text.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length <= 1) {
      setRut(clean);
      return;
    }
    let formatted = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + clean.slice(-1);
    setRut(formatted);
  };

  const handleEnviar = async () => {
    setError('');

    if (!rut) {
      setError('Ingrese su RUT para continuar.');
      return;
    }

    setLoading(true);

    // TODO: Conectar con Spring Boot + PostgreSQL
    // await fetch('http://IP:8080/auth/recuperar', { method: 'POST', ... });

    // Simulación de envío
    setTimeout(() => {
      setLoading(false);
      setEnviado(true);
    }, 1500);
  };

  if (enviado) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.exitoWrapper}>
          <View style={styles.exitoCircle}>
            <Ionicons name="mail-open-outline" size={44} color="#059669" />
          </View>
          <Text style={styles.exitoTitulo}>Instrucciones enviadas</Text>
          <Text style={styles.exitoTexto}>
            Si el RUT está registrado, enviamos las instrucciones para restablecer tu Clave Única al
            correo asociado.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
            <Text style={styles.buttonText}>VOLVER A INICIAR SESIÓN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#059669" />
            <Text style={styles.backLinkText}>Volver</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={44} color="#059669" />
            </View>
            <Text style={styles.title}>Recuperar Clave</Text>
            <Text style={styles.subtitle}>Te ayudamos a restablecer tu acceso</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.formText}>
              Ingresa tu RUT y te enviaremos las instrucciones para restablecer tu Clave Única.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>RUT</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="card-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
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

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleEnviar}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'ENVIANDO...' : 'ENVIAR INSTRUCCIONES'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/')}>
            <Text style={styles.loginLinkText}>
              ¿Recordaste tu clave? <Text style={styles.loginLinkBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
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
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backLinkText: {
    color: '#059669',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
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
    textAlign: 'center',
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
  formText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
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
    marginBottom: 18,
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
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLinkBold: {
    color: '#059669',
    fontWeight: '700',
  },
  exitoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  exitoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#d1fae5',
    borderWidth: 3,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  exitoTitulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  exitoTexto: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
});
