import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

export default function LlamadaScreen() {
  const [estado, setEstado] = useState<'espera' | 'conectado'>('espera');
  const [segundos, setSegundos] = useState(0);
  const [modalColgar, setModalColgar] = useState(false);

  // Cronómetro que corre desde que inicia la llamada
  useEffect(() => {
    const intervalo = setInterval(() => {
      setSegundos(s => s + 1);
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  // Simulación de que el operador contesta después de 5 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      setEstado('conectado');
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  const formatearTiempo = (seg: number) => {
    const m = Math.floor(seg / 60).toString().padStart(2, '0');
    const s = (seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const colgarLlamada = async () => {
    // TODO: Registrar llamada en Spring Boot + PostgreSQL
    // await fetch('http://IP:8080/api/llamada/registrar', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     duracionSegundos: segundos,
    //     estado: estado,
    //     token: await obtenerDato('token'),
    //   }),
    // });

    setModalColgar(false);
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>

      {estado === 'espera' ? (
        // Pantalla de espera
        <View style={styles.esperaContainer}>
          <View style={styles.avatarOperador}>
            <Text style={styles.avatarTexto}>CENCO</Text>
          </View>
          <Text style={styles.esperaTitulo}>Conectando con operador...</Text>
          <Text style={styles.esperaSubtitulo}>Central de Carabineros de Chile</Text>

          <View style={styles.cronometroContainer}>
            <Text style={styles.cronometroLabel}>Tiempo de espera</Text>
            <Text style={styles.cronometro}>{formatearTiempo(segundos)}</Text>
          </View>

          <View style={styles.puntosContainer}>
            <Text style={styles.puntos}>. . .</Text>
          </View>

          <TouchableOpacity
            style={styles.btnColgarEspera}
            onPress={() => setModalColgar(true)}
          >
            <Text style={styles.btnColgarTexto}>CANCELAR LLAMADA</Text>
          </TouchableOpacity>
        </View>

      ) : (
        // Pantalla de videollamada activa
        <View style={styles.llamadaContainer}>

          {/* Vista del operador (fondo) */}
          <View style={styles.videoOperador}>
            <Text style={styles.videoOperadorTexto}>Operador CENCO</Text>
            <Text style={styles.videoOperadorSubtexto}>Videollamada activa</Text>
            {/* TODO: Integrar WebRTC o servicio de videollamada */}
          </View>

          {/* Vista propia (picture in picture) */}
          <View style={styles.videoProp}>
            <Text style={styles.videoPropTexto}>Usted</Text>
            {/* TODO: Integrar cámara frontal con expo-camera */}
          </View>

          {/* Info superior */}
          <View style={styles.infoSuperior}>
            <Text style={styles.infoNombre}>Operador CENCO</Text>
            <Text style={styles.infoCronometro}>{formatearTiempo(segundos)}</Text>
          </View>

          {/* Controles inferiores */}
          <View style={styles.controles}>
            <TouchableOpacity style={styles.btnControl}>
              <Text style={styles.btnControlTexto}>Silencio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnColgar}
              onPress={() => setModalColgar(true)}
            >
              <Text style={styles.btnColgarIcono}>X</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnControl}>
              <Text style={styles.btnControlTexto}>Cámara</Text>
            </TouchableOpacity>
          </View>

        </View>
      )}

      {/* Modal confirmar colgar */}
      <Modal visible={modalColgar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              {estado === 'espera' ? '¿Cancelar llamada?' : '¿Finalizar llamada?'}
            </Text>
            <Text style={styles.modalDescripcion}>
              Duración: {formatearTiempo(segundos)}{'\n'}
              La llamada quedará registrada en el sistema de Carabineros.
            </Text>
            <TouchableOpacity style={styles.btnConfirmarColgar} onPress={colgarLlamada}>
              <Text style={styles.btnConfirmarColgarTexto}>
                {estado === 'espera' ? 'CANCELAR LLAMADA' : 'FINALIZAR LLAMADA'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSeguir}
              onPress={() => setModalColgar(false)}
            >
              <Text style={styles.btnSeguirTexto}>Continuar llamada</Text>
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
    backgroundColor: '#0a0a0a',
  },
  // Pantalla de espera
  esperaContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#1a1a2e',
  },
  avatarOperador: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1B4332',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#C9A84C',
    marginBottom: 24,
  },
  avatarTexto: {
    color: '#C9A84C',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  esperaTitulo: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  esperaSubtitulo: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 32,
  },
  cronometroContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cronometroLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  cronometro: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  puntosContainer: {
    marginBottom: 48,
  },
  puntos: {
    color: '#C9A84C',
    fontSize: 24,
    letterSpacing: 8,
  },
  btnColgarEspera: {
    height: 52,
    backgroundColor: '#cc0000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    shadowColor: '#cc0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  btnColgarTexto: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // Pantalla de videollamada
  llamadaContainer: {
    flex: 1,
    position: 'relative',
  },
  videoOperador: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOperadorTexto: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  videoOperadorSubtexto: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 8,
  },
  videoProp: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 100,
    height: 140,
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPropTexto: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  infoSuperior: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoNombre: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  infoCronometro: {
    color: '#C9A84C',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 2,
  },
  controles: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  btnControl: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnControlTexto: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  btnColgar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#cc0000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#cc0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  btnColgarIcono: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  modalTitulo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescripcion: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  btnConfirmarColgar: {
    width: '100%',
    height: 52,
    backgroundColor: '#cc0000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnConfirmarColgarTexto: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  btnSeguir: {
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#1B4332',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSeguirTexto: {
    color: '#1B4332',
    fontSize: 14,
    fontWeight: '700',
  },
});