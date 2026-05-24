import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Funciones compatibles con web y móvil
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

useEffect(() => {
  const verificarSesion = async () => {
    try {
      const token = await obtenerDato('token');
      const rol = await obtenerDato('rol');

      if (token && rol === 'ciudadano') {
        router.replace('/(tabs)');
      }
    } catch (e) {
      // SecureStore no disponible en web, se ignora
    }
  };

  verificarSesion();
}, []);

  const handleLogin = async () => {
    setError('');

    if (!rut || !password) {
      setError('Por favor complete todos los campos.');
      return;
    }

    // Por hacer: Conectar con Spring Boot + PostgreSQL
    // const response = await fetch('http://IP:8080/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ rut, password }),
    // });
    // const data = await response.json();
    //
    // if (data.rol === 'ciudadano') {
    //   await guardarDato('token', data.token);
    //   await guardarDato('rol', 'ciudadano');
    //   router.replace('/(tabs)'); // TODO: cambiar a '/(tabs)/home'
    // }
    //
    // if (data.rol === 'carabinero') {
    //   router.replace('/(tabs)/explore'); // TODO: cambiar a '/(tabs)/carabineros'
    // }
  };

  return (
    <View style={styles.container}>

      <View style={styles.topBar}>
        <Text style={styles.topBarTexto}>GOBIERNO DE CHILE</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandSection}>
          <Image
            source={require('@/assets/images/escudo.png')}
            style={styles.escudoImagen}
            resizeMode="contain"
          />
          <Text style={styles.institucion}>CARABINEROS DE CHILE</Text>
          <Text style={styles.sistema}>Sistema de Emergencia Inclusivo</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Inicio de Sesión</Text>
            <Text style={styles.formSubtitle}>Ingrese sus credenciales institucionales</Text>
          </View>

          <View style={styles.formBody}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>RUT</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="12.345.678-9"
                placeholderTextColor="#9ca3af"
                value={rut}
                onChangeText={setRut}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Contraseña</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.btnPrimario} onPress={handleLogin}>
              <Text style={styles.btnPrimarioText}>INGRESAR</Text>
            </TouchableOpacity>

            <View style={styles.separador}>
              <View style={styles.separadorLinea} />
              <Text style={styles.separadorTexto}>o</Text>
              <View style={styles.separadorLinea} />
            </View>

            <TouchableOpacity style={styles.btnSecundario}>
              <Text style={styles.btnSecundarioText}>Registrarse</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.linkTexto}>¿Olvidó su contraseña?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerTexto}>
          Uso exclusivo de personal autorizado y ciudadanos registrados.{'\n'}
          © 2025 Carabineros de Chile. Todos los derechos reservados.
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f0',
  },
  topBar: {
    backgroundColor: '#1B4332',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  topBarTexto: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  escudoImagen: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  institucion: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1B4332',
    letterSpacing: 2,
  },
  sistema: {
    fontSize: 12,
    color: '#4B7A62',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#C9A84C',
    borderRadius: 2,
    marginTop: 10,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 440,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    borderTopWidth: 4,
    borderTopColor: '#1B4332',
  },
  formHeader: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#a7d4b8',
    marginTop: 2,
  },
  formBody: {
    padding: 24,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B4332',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldInput: {
    height: 44,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  btnPrimario: {
    height: 48,
    backgroundColor: '#1B4332',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnPrimarioText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  separadorLinea: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  separadorTexto: {
    marginHorizontal: 12,
    color: '#9ca3af',
    fontSize: 12,
  },
  btnSecundario: {
    height: 44,
    borderWidth: 1.5,
    borderColor: '#1B4332',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnSecundarioText: {
    color: '#1B4332',
    fontSize: 13,
    fontWeight: '700',
  },
  linkTexto: {
    color: '#2D6A4F',
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  footerTexto: {
    marginTop: 16,
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});