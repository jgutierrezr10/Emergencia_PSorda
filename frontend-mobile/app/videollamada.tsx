import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { WebView } from 'react-native-webview';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { baseUrl } from './_config';

export default function VideollamadaScreen() {
  const params = useLocalSearchParams();
  const isIncoming = params.incoming === 'true';

  const [rut, setRut] = useState<string | null>(null);
  
  // Permisos nativos
  const [camStatus, requestCam] = useCameraPermissions();
  const [micStatus, requestMic] = useMicrophonePermissions();

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

  const hasPermissions = camStatus?.granted && micStatus?.granted;

  useEffect(() => {
    if (!hasPermissions && camStatus && micStatus) {
      const ask = async () => {
        if (!camStatus.granted) await requestCam();
        if (!micStatus.granted) await requestMic();
      };
      ask();
    }
  }, [hasPermissions, camStatus, micStatus]);

  if (!rut || !camStatus || !micStatus) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!hasPermissions) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="camera-outline" size={64} color="#dc2626" />
        <Text style={[styles.loadingText, { color: 'white', marginTop: 16, textAlign: 'center', paddingHorizontal: 20 }]}>
          Se necesitan permisos de cámara y micrófono para realizar la videollamada.
        </Text>
        <TouchableOpacity style={[styles.btnVolver, { position: 'relative', marginTop: 24, top: 0, right: 0 }]} onPress={async () => {
          await requestCam();
          await requestMic();
        }}>
          <Text style={styles.btnVolverTexto}>DAR PERMISOS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 24 }} onPress={() => router.back()}>
          <Text style={{ color: '#aaa', fontSize: 16 }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const wsUrl = baseUrl.replace('http', 'ws') + '/ws-chat';

  // Script WebRTC modificado para el flujo Ring & Answer
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
      display: none;
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
  <div id="status"><div class="spinner"></div>Conectando al servidor...</div>

  <script src="https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js"></script>
  <script>
    const RUT = '${rut}';
    const WS_URL = '${wsUrl}';
    const IS_INCOMING = ${isIncoming};
    const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

    let pc = null;
    let localStream = null;
    let stompClient = null;

    async function initMedia() {
      const statusEl = document.getElementById('status');
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user', width: 640, height: 480 } });
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = localStream;
        localVideo.style.display = 'block';
      } catch(e) {
        statusEl.textContent = 'Error: no se pudo acceder a la cámara nativa.';
        throw e;
      }

      pc = new RTCPeerConnection(ICE);
      localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

      pc.ontrack = (ev) => {
        if (ev.streams && ev.streams[0]) {
          document.getElementById('remoteVideo').srcObject = ev.streams[0];
          statusEl.style.display = 'none';
        }
      };

      pc.onicecandidate = (ev) => {
        if (ev.candidate && stompClient && stompClient.connected) {
          stompClient.publish({ destination: '/app/webrtc/' + RUT, body: JSON.stringify({ type: 'candidate', candidate: ev.candidate }) });
        }
      };
    }

    async function start() {
      const statusEl = document.getElementById('status');
      
      stompClient = new StompJs.Client({
        brokerURL: WS_URL,
        reconnectDelay: 5000,
        onConnect: () => {
          stompClient.subscribe('/topic/webrtc/' + RUT, async (msg) => {
            const data = JSON.parse(msg.body);
            try {
              if (data.type === 'call_accepted' && !IS_INCOMING) {
                statusEl.innerHTML = '<div class="spinner"></div>Conectando videollamada...';
                await initMedia();
                stompClient.publish({ destination: '/app/webrtc/' + RUT, body: JSON.stringify({ type: 'ready' }) });
              } else if (data.type === 'call_rejected') {
                statusEl.innerHTML = 'La llamada fue rechazada o finalizada.';
                setTimeout(() => window.ReactNativeWebView.postMessage('call_rejected'), 2000);
              } else if (data.type === 'offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                stompClient.publish({ destination: '/app/webrtc/' + RUT, body: JSON.stringify({ type: 'answer', sdp: pc.localDescription }) });
                if (pc && pc.pendingCandidates) {
                  for (const c of pc.pendingCandidates) {
                    await pc.addIceCandidate(new RTCIceCandidate(c));
                  }
                  pc.pendingCandidates = [];
                }
              } else if (data.type === 'answer') {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                if (pc && pc.pendingCandidates) {
                  for (const c of pc.pendingCandidates) {
                    await pc.addIceCandidate(new RTCIceCandidate(c));
                  }
                  pc.pendingCandidates = [];
                }
              } else if (data.type === 'candidate') {
                if (pc.remoteDescription) {
                  await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } else {
                  if (pc) {
                    if (!pc.pendingCandidates) pc.pendingCandidates = [];
                    pc.pendingCandidates.push(data.candidate);
                  }
                }
              } else if (data.type === 'ready') {
                if (IS_INCOMING || pc.signalingState !== 'stable') {
                  const offer = await pc.createOffer();
                  await pc.setLocalDescription(offer);
                  stompClient.publish({ destination: '/app/webrtc/' + RUT, body: JSON.stringify({ type: 'offer', sdp: pc.localDescription }) });
                }
              }
            } catch(err) { console.error('Signal error:', err); }
          });

          // Lógica inicial dependiendo de si iniciamos o recibimos la llamada
          if (IS_INCOMING) {
            statusEl.innerHTML = '<div class="spinner"></div>Conectando cámara...';
            initMedia().then(() => {
              stompClient.publish({ destination: '/app/webrtc/' + RUT, body: JSON.stringify({ type: 'call_accepted' }) });
            });
          } else {
            statusEl.innerHTML = '<div class="spinner"></div>Llamando al operador...';
            stompClient.publish({ destination: '/app/webrtc/' + RUT, body: JSON.stringify({ type: 'call_request', from: 'ciudadano' }) });
          }
        },
        onStompError: (f) => { statusEl.textContent = 'Error de conexión al servidor.'; }
      });

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
        onMessage={(event) => {
          if (event.nativeEvent.data === 'call_rejected') {
            router.back();
          }
        }}
      />
      {/* Botón Colgar flotante */}
      <TouchableOpacity style={styles.btnVolver} onPress={() => {
        // Enviar evento de rechazo/colgar y salir
        router.back();
      }}>
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
