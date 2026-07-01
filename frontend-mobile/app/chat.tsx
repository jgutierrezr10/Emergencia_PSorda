import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme, Colors } from '@/theme/theme';
import * as SecureStore from 'expo-secure-store';
import { Client } from '@stomp/stompjs';
import { baseUrl } from './_config';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';

const MensajeVideo = ({ uri, style }: { uri: string, style: any }) => {
  const player = useVideoPlayer(uri, player => {
    player.loop = false;
  });
  return <VideoView player={player} style={style} allowsFullscreen allowsPictureInPicture />;
};

const obtenerDato = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return await SecureStore.getItemAsync(key);
};

type Autor = 'op' | 'yo';

interface Mensaje {
  id: number;
  autor: Autor;
  tipo: 'texto' | 'gif' | 'archivo';
  texto: string;
  hora: string;
  archivoUrl?: string;
  tipoArchivo?: string;
}

const GIFS = [
  { label: 'YO NECESITO AYUDA', icon: 'medkit' as const, color: '#ec4899' },
  { label: 'YO EN PELIGRO', icon: 'warning' as const, color: '#f59e0b' },
  { label: 'VENGAN RÁPIDO', icon: 'walk' as const, color: '#f97316' },
  { label: 'MI UBICACIÓN', icon: 'location' as const, color: '#ec4899' },
];

// Mensajes de texto predeterminados en LSCh (reemplazan los bloques de GIF).
// Al tocarlos se envían como un mensaje de texto normal al operador.
const MENSAJES_RAPIDOS = [
  '🆘 YO NECESITO AYUDA',
  '⚠️ YO EN PELIGRO',
  '🏃 VENGAN RÁPIDO',
  '🔪 AGRESOR CERCA DE MÍ',
  '🫣 YO ESCONDIDO',
  '🚪 NO PUEDO SALIR',
];

const colorGif = (label: string) => GIFS.find((g) => g.label === label)?.color ?? '#ec4899';
const iconGif = (label: string) => GIFS.find((g) => g.label === label)?.icon ?? 'image';

const ahora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function ChatScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 1,
      autor: 'op',
      tipo: 'texto',
      texto: 'HOLA. YO OPERADOR CENCO. YO CONTIGO POR CHAT. TÚ ESCRIBIR O TOCAR MENSAJE RÁPIDO. CUENTA QUÉ PASA.',
      hora: ahora(),
    },
  ]);
  const [texto, setTexto] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const [alertaId, setAlertaId] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const stompClient = useRef<Client | null>(null);
  useEffect(() => {
    const initData = async () => {
      let aid = await obtenerDato('currentAlertaId');
      if (!aid) aid = await obtenerDato('alerta_id');
      const uid = await obtenerDato('usuarioId');
      setAlertaId(aid);
      setUsuarioId(uid);

      if (aid && aid !== '999') {
        // 1. Transformamos la baseUrl (http://...) a formato WebSocket (ws://...) y le sumamos tu ruta
        const wsUrl = baseUrl.replace('http://', 'ws://') + '/ws-chat';

        // 2. Creamos el cliente usando la URL dinámica
        const client = new Client({
          brokerURL: wsUrl,
          forceBinaryWSFrames: true,
          appendMissingNULLonIncoming: true,
          onConnect: () => {
            console.log('STOMP CONNECTED');
            client.subscribe(`/topic/chat/${aid}`, (message) => {
              const data = JSON.parse(message.body);
              setMensajes((prev) => {
                const hourStr = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
                // Avoid duplicating messages already fetched via polling or added optimistically
                if (prev.some(m => m.texto === data.texto && m.hora === hourStr)) return prev;
                return [...prev, { 
                  ...data, 
                  id: Date.now(), 
                  hora: hourStr,
                  autor: String(data.emisorId) === String(uid) ? 'yo' : 'op'
                }];
              });
            });
          }
        });
        client.activate();
        stompClient.current = client;
      }
    };
    initData();

    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, []);

  useEffect(() => {
    if (!alertaId || alertaId === '999') return;

    const cargarMensajes = async () => {
      try {
        const token = await obtenerDato('token');
        const res = await fetch(`${baseUrl}/api/chats/alerta/${alertaId}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped: Mensaje[] = data.map((m: any) => {
            const time = new Date(m.fechaHoraEnvio);
            const hourStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
            const isMe = String(m.emisorId) === String(usuarioId);
            return {
              id: m.id,
              autor: isMe ? 'yo' : 'op',
              tipo: m.tipo === 'gif' ? 'gif' : m.tipo === 'archivo' ? 'archivo' : 'texto',
              texto: m.texto,
              hora: hourStr,
              archivoUrl: m.archivoUrl,
              tipoArchivo: m.tipoArchivo
            };
          });
        

          if (mapped.length === 0) {
            setMensajes([
              {
                id: 1,
                autor: 'op',
                tipo: 'texto',
                texto: 'HOLA. YO OPERADOR CENCO. YO CONTIGO POR CHAT. TÚ ESCRIBIR O TOCAR MENSAJE RÁPIDO. CUENTA QUÉ PASA.',
                hora: ahora(),
              }
            ]);
          } else {
            setMensajes(mapped);
          }
        }
      } catch (e) {
        console.warn('Error fetching messages:', e);
      }
    };

    const intervalId = setInterval(cargarMensajes, 2000);
    cargarMensajes();
    return () => clearInterval(intervalId);
  }, [alertaId, usuarioId]);

  const enviarMensajeBackend = async (tipo: 'texto' | 'gif' | 'archivo', textoVal: string, archivoUrlVal?: string, tipoArchivoVal?: string) => {
    const emisor = usuarioId ? Number(usuarioId) : 2;

    // Mostrar el mensaje de inmediato en pantalla (optimista)
    setMensajes((prev) => [
      ...prev,
      {
        id: Date.now(),
        autor: 'yo',
        tipo: tipo,
        texto: textoVal,
        hora: ahora(),
        archivoUrl: archivoUrlVal,
        tipoArchivo: tipoArchivoVal,
      },
    ]);

    // Modo simulado (sin alerta real): solo queda local
    if (!alertaId || alertaId === '999') return;

    // SIEMPRE guardar por REST en el backend (el WebSocket no persiste, por eso
    // antes los mensajes del usuario no le llegaban a CENCO y desaparecían).
    try {
      const token = await obtenerDato('token');
      await fetch(`${baseUrl}/api/chats`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          texto: textoVal,
          fechaHoraEnvio: new Date().toISOString().replace('Z', ''),
          emisorId: emisor,
          tipo: tipo,
          archivoUrl: archivoUrlVal,
          tipoArchivo: tipoArchivoVal,
          alerta: { id: Number(alertaId) },
        }),
      });
    } catch (e) {
      console.warn('Error sending message:', e);
    }
  };

  const seleccionarArchivo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Permite videos e imágenes
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const tipoArchivo = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
      const fileName = uri.split('/').pop() || (asset.type === 'video' ? 'video.mp4' : 'image.jpg');
      
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: tipoArchivo,
      } as any);

      try {
        const token = await obtenerDato('token');
        const res = await fetch(`${baseUrl}/api/uploads`, {
          method: 'POST',
          body: formData,
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
        });
        if (res.ok) {
          const data = await res.json();
          await enviarMensajeBackend('archivo', data.fileName, data.fileUrl, data.fileType);
        }
      } catch (e) {
        console.warn('Error subiendo archivo', e);
      }
    }
  };

  const enviarTexto = async () => {
    if (!texto.trim()) return;
    const txt = texto.trim();
    setTexto('');
    await enviarMensajeBackend('texto', txt);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.opAvatar}>
          <Ionicons name="shield-checkmark" size={22} color="#ffffff" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitulo}>OPERADOR CENCO</Text>
          <Text style={styles.headerSubtitulo}>● EN LÍNEA — CHAT ACCESIBILIDAD</Text>
        </View>
        <TouchableOpacity style={styles.videoBtn} onPress={() => router.push('/videollamada')}>
          <Ionicons name="videocam" size={16} color="#ffffff" />
          <Text style={styles.videoBtnTexto}>VIDEO</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.mensajes}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {mensajes.map((m) => {
            const esYo = m.autor === 'yo';
            return (
              <View key={m.id} style={[styles.fila, esYo ? styles.filaYo : styles.filaOp]}>
                {!esYo && (
                  <View style={styles.opMini}>
                    <Ionicons name="shield-checkmark" size={14} color="#ffffff" />
                  </View>
                )}
                <View style={[styles.burbuja, esYo ? styles.burbujaYo : styles.burbujaOp]}>
                  {m.tipo === 'gif' ? (
                    <View>
                      <View style={[styles.gifTile, { backgroundColor: colorGif(m.texto) }]}>
                        <View style={styles.gifBadge}>
                          <Text style={styles.gifBadgeTexto}>GIF</Text>
                        </View>
                        <Ionicons name={iconGif(m.texto)} size={42} color="#ffffff" />
                      </View>
                      <Text style={[styles.gifLabel, esYo ? styles.textoYo : styles.textoOp]}>{m.texto}</Text>
                    </View>
                  ) : m.tipo === 'archivo' ? (
                    <View style={{ gap: 6, minWidth: 150 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: esYo ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 8 }}>
                        <Ionicons name={m.tipoArchivo?.startsWith('video') ? 'videocam' : m.tipoArchivo?.startsWith('image') ? 'image' : 'document-attach'} size={24} color={esYo ? '#ffffff' : colors.primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={[{ fontSize: 13, fontWeight: '700' }, esYo ? styles.textoYo : styles.textoOp]} numberOfLines={1}>{m.texto}</Text>
                          <Text style={[{ fontSize: 10, opacity: 0.8 }, esYo ? styles.textoYo : styles.textoOp]}>Adjunto</Text>
                        </View>
                      </View>
                      {m.tipoArchivo?.startsWith('video') && m.archivoUrl && (
                        <MensajeVideo uri={m.archivoUrl} style={{ width: '100%', height: 180, borderRadius: 8, marginTop: 4 }} />
                      )}
                      {m.tipoArchivo?.startsWith('image') && m.archivoUrl && (
                        <Image source={{ uri: m.archivoUrl }} style={{ width: '100%', height: 120, borderRadius: 8, marginTop: 4 }} contentFit="cover" />
                      )}
                    </View>
                  ) : (
                    <Text style={[styles.textoMsg, esYo ? styles.textoYo : styles.textoOp]}>{m.texto}</Text>
                  )}
                  <Text style={[styles.hora, esYo ? styles.horaYo : styles.horaOp]}>{m.hora}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.gifBar}>
          <Text style={styles.gifBarTitulo}>MENSAJES RÁPIDOS (LSCh):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {MENSAJES_RAPIDOS.map((frase) => (
              <TouchableOpacity key={frase} style={styles.chip} onPress={() => enviarMensajeBackend('texto', frase)}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
                <Text style={styles.chipTexto} numberOfLines={1}>{frase}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachBtn} onPress={seleccionarArchivo}>
            <Ionicons name="attach" size={26} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="ESCRIBIR MENSAJE..."
            placeholderTextColor={colors.textMuted}
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={enviarTexto}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={enviarTexto}>
            <Ionicons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingVertical: 12, paddingHorizontal: 12, gap: 10 },
    backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    opAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#047857', borderWidth: 2, borderColor: '#6ee7b7', justifyContent: 'center', alignItems: 'center' },
    headerInfo: { flex: 1 },
    headerTitulo: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
    headerSubtitulo: { color: '#d1fae5', fontSize: 11, marginTop: 2 },
    videoBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: c.danger, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
    videoBtnTexto: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
    mensajes: { padding: 16, gap: 14 },
    fila: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '100%' },
    filaYo: { justifyContent: 'flex-end' },
    filaOp: { justifyContent: 'flex-start' },
    opMini: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center' },
    burbuja: { maxWidth: '76%', borderRadius: 16, padding: 12 },
    burbujaYo: { backgroundColor: c.primary, borderBottomRightRadius: 4 },
    burbujaOp: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderBottomLeftRadius: 4 },
    textoMsg: { fontSize: 15, lineHeight: 21 },
    textoYo: { color: c.primaryText },
    textoOp: { color: c.textPrimary },
    gifTile: { width: 130, height: 130, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    gifBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
    gifBadgeTexto: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
    gifLabel: { fontSize: 14, fontWeight: '700', marginTop: 8 },
    hora: { fontSize: 10, marginTop: 6, alignSelf: 'flex-end' },
    horaYo: { color: c.primaryText, opacity: 0.7 },
    horaOp: { color: c.textMuted },
    gifBar: { backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 },
    gifBarTitulo: { fontSize: 13, fontWeight: '700', color: c.primary, marginBottom: 10 },
    chipRow: { flexDirection: 'row', gap: 8, paddingRight: 12 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 14 },
    chipTexto: { fontSize: 16, fontWeight: '700', color: c.textPrimary },
    gifBarRow: { flexDirection: 'row', gap: 8 },
    gifQuick: { flex: 1, alignItems: 'center', backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 4, gap: 6 },
    gifQuickIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    gifQuickTexto: { fontSize: 10, fontWeight: '600', color: c.textSecondary, textAlign: 'center' },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border },
    attachBtn: { padding: 4 },
    input: { flex: 1, height: 48, backgroundColor: c.surfaceAlt, borderRadius: 24, paddingHorizontal: 18, fontSize: 15, color: c.textPrimary },
    sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center' },
  });
