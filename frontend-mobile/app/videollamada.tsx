import { StyleSheet, View, Text, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Camera } from 'expo-camera';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, RTCView, mediaDevices, MediaStream } from 'react-native-webrtc';
import { Client } from '@stomp/stompjs';
import { baseUrl } from './_config';

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function VideollamadaScreen() {
  const [rut, setRut] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let currentPc: RTCPeerConnection | null = null;

    const init = async () => {
      // 1. Obtener RUT
      let currentRut = 'Desconocido';
      try {
        const storedRut = await (Platform.OS === 'web' ? localStorage.getItem('rut') : SecureStore.getItemAsync('rut'));
        if (storedRut) currentRut = storedRut.replace(/[^0-9Kk]/g, '');
        setRut(currentRut);
      } catch (e) {}

      // 2. Permisos
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      const granted = cameraStatus.status === 'granted' && audioStatus.status === 'granted';
      setHasPermission(granted);

      if (!granted) return;

      // 3. Capturar Cámara
      try {
        currentStream = await mediaDevices.getUserMedia({
          audio: true,
          video: { width: 640, height: 480, frameRate: 30, facingMode: 'user' }
        });
        setLocalStream(currentStream);
      } catch (e) {
        console.warn('Error accediendo a la cámara', e);
        return;
      }

      // 4. Iniciar WebRTC
      const pc = new RTCPeerConnection(configuration);
      pcRef.current = pc;
      currentPc = pc;

      // Añadir tracks locales
      currentStream.getTracks().forEach((track) => {
        pc.addTrack(track, currentStream as MediaStream);
      });

      // Recibir tracks remotos
      pc.addEventListener('track', (event: any) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          setIsConnected(true);
        }
      });

      // 5. Iniciar STOMP
      const stompClient = new Client({
        brokerURL: baseUrl.replace('http', 'ws') + '/ws-chat',
        reconnectDelay: 5000,
        onConnect: () => {
          // Suscribirse al canal WebRTC de este RUT
          stompClient.subscribe(`/topic/webrtc/${currentRut}`, async (message) => {
            const data = JSON.parse(message.body);
            
            // Lógica de Señalización
            if (data.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              stompClient.publish({
                destination: `/app/webrtc/${currentRut}`,
                body: JSON.stringify({ type: 'answer', sdp: pc.localDescription })
              });
            } else if (data.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } else if (data.type === 'candidate') {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } else if (data.type === 'ready') {
              // Si el operador dice 'ready', enviamos oferta
              const offer = await pc.createOffer({});
              await pc.setLocalDescription(offer);
              stompClient.publish({
                destination: `/app/webrtc/${currentRut}`,
                body: JSON.stringify({ type: 'offer', sdp: pc.localDescription })
              });
            }
          });

          // Avisar que estamos listos
          stompClient.publish({ destination: `/app/webrtc/${currentRut}`, body: JSON.stringify({ type: 'ready' }) });
        },
        onStompError: (frame) => console.error('Broker error: ' + frame.headers['message'])
      });

      // Manejar ICE candidates generados localmente
      pc.addEventListener('icecandidate', (event: any) => {
        if (event.candidate && stompClient.connected) {
          stompClient.publish({
            destination: `/app/webrtc/${currentRut}`,
            body: JSON.stringify({ type: 'candidate', candidate: event.candidate })
          });
        }
      });

      stompClient.activate();
      stompClientRef.current = stompClient;
    };

    init();

    return () => {
      // Limpiar al desmontar
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
      }
      if (currentPc) {
        currentPc.close();
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  if (!rut || hasPermission === null || !localStream) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Conectando WebRTC nativo...</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Video Remoto (Operador CENCO) ocupando el fondo */}
      {remoteStream ? (
        <RTCView 
          streamURL={remoteStream.toURL()} 
          style={styles.remoteVideo} 
          objectFit="cover" 
        />
      ) : (
        <View style={styles.remotePlaceholder}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={{ color: 'white', marginTop: 10 }}>Esperando a Operador...</Text>
        </View>
      )}

      {/* Video Local (Ciudadano Sordo) en ventana flotante pequeña */}
      <View style={styles.localVideoContainer}>
        <RTCView 
          streamURL={localStream.toURL()} 
          style={styles.localVideo} 
          objectFit="cover" 
          mirror={true} 
        />
      </View>

      {/* Botón Salir */}
      <TouchableOpacity style={styles.btnVolver} onPress={() => router.back()}>
        <Ionicons name="call" size={24} color="#ffffff" />
        <Text style={styles.btnVolverTexto}>COLGAR</Text>
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
  remoteVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  remotePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#333333',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  btnVolver: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 20,
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  btnVolverTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
