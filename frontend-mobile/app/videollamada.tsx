import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { WebView } from 'react-native-webview';
import { baseUrl } from './_config';

export default function VideollamadaScreen() {
  const [rut, setRut] = useState<string | null>(null);

  useEffect(() => {
    const getRut = async () => {
      try {
        const storedRut = await (Platform.OS === 'web'
          ? localStorage.getItem('rut')
          : SecureStore.getItemAsync('rut'));
        if (storedRut) setRut(storedRut.replace(/[^0-9Kk]/g, ''));
        else setRut('Desconocido');
      } catch (e) {
        setRut('Desconocido');
      }
    };
    getRut();
  }, []);

  if (!rut) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const wsUrl = baseUrl.replace('http', 'ws') + '/ws-chat';

  // Página HTML mínima que ejecuta WebRTC usando las APIs nativas del navegador Chrome (WebView)
  const webrtcHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; overflow: hidden; font-family: sans-serif; width: 100vw; height: 100vh; }
    #remoteVideo { width: 100vw; height: 100vh; object-fit: cover; }
    #localVideo {
      position: absolute; bottom: 100px; right: 16px;
      width: 110px; height: 150px; object-fit: cover;
      border-radius: 12px; border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      z-index: 10;
    }
    #status {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      color: white; font-size: 16px; text-align: center; z-index: 5;
    }
    .spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3);
      border-top: 4px solid #10b981; border-radius: 50%;
      animation: spin 1s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <video id="remoteVideo" autoplay playsinline></video>
  <video id="localVideo" autoplay playsinline muted></video>
  <div id="status"><div class="spinner"></div>Conectando videollamada...</div>

  <script src="https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js"></script>
  <script>
    const RUT = '${rut}';
    const WS_URL = '${wsUrl}';
    const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

    let pc = null;
    let localStream = null;
    let stompClient = null;

    async function start() {
      const statusEl = document.getElementById('status');
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user', width: 640, height: 480 } });
        document.getElementById('localVideo').srcObject = localStream;
      } catch(e) {
        statusEl.textContent = 'Error: no se pudo acceder a la cámara.';
        return;
      }

      pc = new RTCPeerConnection(ICE);
      localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

      pc.ontrack = (ev) => {
        if (ev.streams && ev.streams[0]) {
          document.getElementById('remoteVideo').srcObject = ev.streams[0];
          statusEl.style.display = 'none';
        }
      };

      stompClient = new StompJs.Client({
        brokerURL: WS_URL,
        reconnectDelay: 5000,
        onConnect: () => {
          statusEl.innerHTML = '<div class="spinner"></div>Esperando al operador...';
          stompClient.subscribe('/topic/webrtc/' + RUT, async (msg) => {
            const data = JSON.parse(msg.body);
            try {
              if (data.type === 'offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                stompClient.publish({ destination: '/app/webrtc/' + RUT, body: JSON.stringify({ type: 'answer', sdp: pc.localDescription }) });
              } else if (data.type === 'answer') {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              } else if (data.type === 'candidate') {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              } else if (data.type === 'ready') {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                stompClient.publish({ destination: '/app/webrtc/' + RUT, body: JSON.stringify({ type: 'offer', sdp: pc.localDescription }) });
              }
            } catch(err) { console.error('Signal error:', err); }
          });
          stompClient.publish({ destination: '/app/webrtc/' + RUT, body: JSON.stringify({ type: 'ready' }) });
        },
        onStompError: (f) => { statusEl.textContent = 'Error de conexión al servidor.'; }
      });

      pc.onicecandidate = (ev) => {
        if (ev.candidate && stompClient && stompClient.connected) {
          stompClient.publish({ destination: '/app/webrtc/' + RUT, body: JSON.stringify({ type: 'candidate', candidate: ev.candidate }) });
        }
      };

      stompClient.activate();
    }

    start();
  </script>
</body>
</html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ html: webrtcHtml }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        mediaCapturePermissionGrantType="grant"
        originWhitelist={['*']}
      />
      {/* Botón Colgar flotante */}
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
