import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

const TIPOS_INCIDENTE = [
  { id: 1, label: 'Robo' },
  { id: 2, label: 'Agresión' },
  { id: 3, label: 'Accidente' },
  { id: 4, label: 'Incendio' },
  { id: 5, label: 'Violencia Intrafamiliar' },
  { id: 6, label: 'Otro' },
];

export default function DenunciaScreen() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<number | null>(null);
  const [videoAdjunto, setVideoAdjunto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [modalExito, setModalExito] = useState(false);
  const [folio, setFolio] = useState('');
  const [error, setError] = useState('');
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAhora(new Date());
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const fechaActual = ahora.toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const horaActual = ahora.toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const adjuntarVideo = () => {
    // TODO: Integrar expo-camera o expo-document-picker
    setVideoAdjunto(true);
  };

  const enviarDenuncia = async () => {
    setError('');

    if (!tipoSeleccionado) {
      setError('Seleccione el tipo de incidente.');
      return;
    }

    if (!videoAdjunto) {
      setError('Adjunte un video en LSCh describiendo lo ocurrido.');
      return;
    }

    setEnviando(true);

    // TODO: Conectar con Spring Boot + PostgreSQL
    // const response = await fetch('http://IP:8080/api/denuncia', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     tipoIncidente: tipoSeleccionado,
    //     fecha: fechaActual,
    //     hora: horaActual,
    //     videoUrl: 'url_del_video',
    //     token: await obtenerDato('token'),
    //   }),
    // });
    // const data = await response.json();
    // setFolio(data.folio);

    setTimeout(() => {
      setEnviando(false);
      setFolio('DEN-' + Math.floor(Math.random() * 100000));
      setModalExito(true);
    }, 2000);
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.btnVolver}>
          <Text style={styles.btnVolverTexto}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>DENUNCIA DIGITAL</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>FECHA Y HORA DEL INCIDENTE</Text>
          <View style={styles.fechaRow}>
            <View style={styles.fechaItem}>
              <Text style={styles.fechaLabel}>Fecha</Text>
              <Text style={styles.fechaValor}>{fechaActual}</Text>
            </View>
            <View style={styles.separadorVertical} />
            <View style={styles.fechaItem}>
              <Text style={styles.fechaLabel}>Hora</Text>
              <Text style={styles.fechaValor}>{horaActual}</Text>
            </View>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>UBICACIÓN</Text>
          <View style={styles.ubicacionCard}>
            <Text style={styles.ubicacionTexto}>Ubicación obtenida automáticamente por GPS</Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>TIPO DE INCIDENTE</Text>
          <View style={styles.gridTipos}>
            {TIPOS_INCIDENTE.map((tipo) => (
              <TouchableOpacity
                key={tipo.id}
                style={[
                  styles.tipoBtn,
                  tipoSeleccionado === tipo.id && styles.tipoBtnActivo,
                ]}
                onPress={() => setTipoSeleccionado(tipo.id)}
              >
                <Text style={[
                  styles.tipoBtnTexto,
                  tipoSeleccionado === tipo.id && styles.tipoBtnTextoActivo,
                ]}>
                  {tipo.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>VIDEO EN LENGUA DE SEÑAS (LSCh)</Text>
          <TouchableOpacity
            style={[styles.videoBtn, videoAdjunto && styles.videoBtnActivo]}
            onPress={adjuntarVideo}
          >
            {videoAdjunto ? (
              <>
                <Text style={styles.videoIconActivo}>OK</Text>
                <Text style={styles.videoBtnTextoActivo}>Video adjunto correctamente</Text>
                <Text style={styles.videoBtnSubtexto}>Toque para reemplazar</Text>
              </>
            ) : (
              <>
                <Text style={styles.videoIcon}>+</Text>
                <Text style={styles.videoBtnTexto}>Grabar video en LSCh</Text>
                <Text style={styles.videoBtnSubtexto}>Describa los hechos en Lengua de Señas Chilena</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorTexto}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.btnEnviar}
          onPress={enviarDenuncia}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.btnEnviarTexto}>ENVIAR DENUNCIA</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.aviso}>
          La denuncia quedará registrada oficialmente en el sistema de Carabineros.
        </Text>

      </ScrollView>

      <Modal visible={modalExito} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.exitoIcono}>
              <Text style={styles.exitoIconoTexto}>OK</Text>
            </View>
            <Text style={styles.modalTitulo}>Denuncia Enviada</Text>
            <Text style={styles.modalDescripcion}>
              Su denuncia ha sido registrada exitosamente.
            </Text>
            <View style={styles.folioCard}>
              <Text style={styles.folioLabel}>Número de Folio</Text>
              <Text style={styles.folioValor}>{folio}</Text>
            </View>
            <Text style={styles.modalAviso}>
              Guarde este número como comprobante de su denuncia.
            </Text>
            <TouchableOpacity
              style={styles.btnModalVolver}
              onPress={() => {
                setModalExito(false);
                router.replace('/(tabs)/home');
              }}
            >
              <Text style={styles.btnModalVolverTexto}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f0',
  },
  header: {
    backgroundColor: '#1B4332',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnVolver: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#C9A84C',
    borderRadius: 6,
    width: 60,
    alignItems: 'center',
  },
  btnVolverTexto: {
    color: '#C9A84C',
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitulo: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  seccion: {
    marginBottom: 24,
  },
  seccionTitulo: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1B4332',
    letterSpacing: 1,
    marginBottom: 10,
  },
  fechaRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  fechaItem: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  fechaLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 4,
  },
  fechaValor: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B4332',
  },
  separadorVertical: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  ubicacionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  ubicacionTexto: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  gridTipos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tipoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    minWidth: '30%',
    alignItems: 'center',
  },
  tipoBtnActivo: {
    backgroundColor: '#1B4332',
    borderColor: '#1B4332',
  },
  tipoBtnTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  tipoBtnTextoActivo: {
    color: '#ffffff',
  },
  videoBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  videoBtnActivo: {
    borderColor: '#1B4332',
    backgroundColor: '#f0fdf4',
    borderStyle: 'solid',
  },
  videoIcon: {
    fontSize: 32,
    color: '#9ca3af',
    marginBottom: 8,
  },
  videoIconActivo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1B4332',
    marginBottom: 8,
  },
  videoBtnTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  videoBtnTextoActivo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4332',
    marginBottom: 4,
  },
  videoBtnSubtexto: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
  errorTexto: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  btnEnviar: {
    height: 52,
    backgroundColor: '#1B4332',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnEnviarTexto: {
    color: '#C9A84C',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  aviso: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  exitoIcono: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    borderWidth: 3,
    borderColor: '#1B4332',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  exitoIconoTexto: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1B4332',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  modalDescripcion: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  folioCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1B4332',
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  folioLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  folioValor: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1B4332',
    letterSpacing: 2,
  },
  modalAviso: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  btnModalVolver: {
    width: '100%',
    height: 48,
    backgroundColor: '#1B4332',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnModalVolverTexto: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});