import { StyleSheet, View, Text, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as SecureStore from 'expo-secure-store';
import { Camera } from 'expo-camera';

export default function VideollamadaScreen() {
  const [rut, setRut] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getRut = async () => {
      try {
        const storedRut = await (Platform.OS === 'web' ? localStorage.getItem('rut') : SecureStore.getItemAsync('rut'));
        if (storedRut) {
          // Remover caracteres no alfanuméricos para que sea una URL limpia para Jitsi
          setRut(storedRut.replace(/[^0-9Kk]/g, ''));
        } else {
          setRut('Desconocido');
        }
      } catch (e) {
        setRut('Desconocido');
      }
    };
    getRut();

    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(cameraStatus.status === 'granted' && audioStatus.status === 'granted');
    })();
  }, []);

  if (!rut || hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Conectando videollamada...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="camera-outline" size={48} color="#ef4444" />
        <Text style={[styles.loadingText, { color: '#ef4444', marginTop: 10, textAlign: 'center' }]}>
          Se necesitan permisos de cámara y micrófono para la videollamada.
        </Text>
        <TouchableOpacity style={{ marginTop: 20, padding: 10, backgroundColor: '#10b981', borderRadius: 8 }} onPress={() => router.back()}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Jitsi Meet permite parámetros en la URL (ej: configuraciones iniciales)
  const jitsiUrl = `https://meet.jit.si/Emergencia_CENCO_${rut}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: jitsiUrl }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Configs for WebRTC inside Android WebView
        mediaCapturePermissionGrantType="grant"
      />
      
      <TouchableOpacity style={styles.btnVolver} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color="#ffffff" />
        <Text style={styles.btnVolverTexto}>SALIR</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#10b981',
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnVolver: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 20,
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  btnVolverTexto: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
