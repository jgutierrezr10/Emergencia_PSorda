import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Autor = 'op' | 'yo';

interface Mensaje {
  id: number;
  autor: Autor;
  tipo: 'texto' | 'gif';
  texto: string;
  hora: string;
}

// GIFs predeterminados en Lengua de Señas Chilena (LSCh)
const GIFS = [
  { label: 'Necesito ayuda', icon: 'medkit' as const, color: '#ec4899' },
  { label: 'Estoy en peligro', icon: 'warning' as const, color: '#f59e0b' },
  { label: 'Vengan rápido', icon: 'walk' as const, color: '#f97316' },
  { label: 'Mi ubicación', icon: 'location' as const, color: '#ec4899' },
];

const colorGif = (label: string) => GIFS.find((g) => g.label === label)?.color ?? '#ec4899';
const iconGif = (label: string) => GIFS.find((g) => g.label === label)?.icon ?? 'image';

const ahora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function ChatScreen() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { id: 1, autor: 'op', tipo: 'texto', texto: 'Hola, soy el operador CENCO. Te atiendo por el Chat de Accesibilidad en Lengua de Señas Chilena.', hora: '17:52' },
    { id: 2, autor: 'yo', tipo: 'gif', texto: 'Necesito ayuda', hora: '17:53' },
    { id: 3, autor: 'op', tipo: 'texto', texto: 'Entendido. ¿Puedes confirmar tu ubicación actual?', hora: '17:53' },
    { id: 4, autor: 'yo', tipo: 'gif', texto: 'Mi ubicación', hora: '17:53' },
  ]);
  const [texto, setTexto] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const agregar = (m: Omit<Mensaje, 'id' | 'hora'>) => {
    setMensajes((prev) => [...prev, { ...m, id: Date.now(), hora: ahora() }]);
  };

  const enviarTexto = () => {
    if (!texto.trim()) return;
    agregar({ autor: 'yo', tipo: 'texto', texto: texto.trim() });
    setTexto('');
  };

  const enviarGif = (label: string) => {
    agregar({ autor: 'yo', tipo: 'gif', texto: label });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.opAvatar}>
          <Ionicons name="shield-checkmark" size={22} color="#ffffff" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitulo}>Operador CENCO</Text>
          <Text style={styles.headerSubtitulo}>● En línea — Chat de Accesibilidad</Text>
        </View>
        <TouchableOpacity style={styles.videoBtn} onPress={() => router.push('/videollamada')}>
          <Ionicons name="videocam" size={16} color="#ffffff" />
          <Text style={styles.videoBtnTexto}>VIDEO</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Mensajes */}
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
                  ) : (
                    <Text style={[styles.textoMsg, esYo ? styles.textoYo : styles.textoOp]}>{m.texto}</Text>
                  )}
                  <Text style={[styles.hora, esYo ? styles.horaYo : styles.horaOp]}>{m.hora}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* GIFs predeterminados */}
        <View style={styles.gifBar}>
          <Text style={styles.gifBarTitulo}>Enviar GIFs predeterminados (LSCh):</Text>
          <View style={styles.gifBarRow}>
            {GIFS.map((g) => (
              <TouchableOpacity key={g.label} style={styles.gifQuick} onPress={() => enviarGif(g.label)}>
                <View style={[styles.gifQuickIcon, { backgroundColor: g.color }]}>
                  <Ionicons name={g.icon} size={20} color="#ffffff" />
                </View>
                <Text style={styles.gifQuickTexto} numberOfLines={1}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Mensaje de texto..."
            placeholderTextColor="#9ca3af"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  opAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#047857',
    borderWidth: 2,
    borderColor: '#6ee7b7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitulo: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitulo: {
    color: '#d1fae5',
    fontSize: 11,
    marginTop: 2,
  },
  videoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  videoBtnTexto: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  mensajes: {
    padding: 16,
    gap: 14,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '100%',
  },
  filaYo: {
    justifyContent: 'flex-end',
  },
  filaOp: {
    justifyContent: 'flex-start',
  },
  opMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  burbuja: {
    maxWidth: '76%',
    borderRadius: 16,
    padding: 12,
  },
  burbujaYo: {
    backgroundColor: '#059669',
    borderBottomRightRadius: 4,
  },
  burbujaOp: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomLeftRadius: 4,
  },
  textoMsg: {
    fontSize: 15,
    lineHeight: 21,
  },
  textoYo: {
    color: '#ffffff',
  },
  textoOp: {
    color: '#111827',
  },
  gifTile: {
    width: 130,
    height: 130,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  gifBadgeTexto: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  gifLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  hora: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  horaYo: {
    color: '#d1fae5',
  },
  horaOp: {
    color: '#9ca3af',
  },
  gifBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  gifBarTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 10,
  },
  gifBarRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gifQuick: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 6,
  },
  gifQuickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gifQuickTexto: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#111827',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
