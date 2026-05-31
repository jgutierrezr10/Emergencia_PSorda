import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [alertaEnviada, setAlertaEnviada] = useState(false);

  const handleBotonPanico = () => {
    setModalConfirmar(true);
  };

  const confirmarAlerta = async () => {
    setEnviando(true);

    // TODO: Conectar con Spring Boot + PostgreSQL
    // 1. Obtener GPS
    // const location = await Location.getCurrentPositionAsync({});
    // 2. Enviar alerta con ubicación
    // await fetch('http://IP:8080/api/emergencia/alerta', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     latitud: location.coords.latitude,
    //     longitud: location.coords.longitude,
    //     token: await obtenerDato('token'),
    //   }),
    // });

    // Simulación de envío
    setTimeout(() => {
      setEnviando(false);
      setAlertaEnviada(true);
    }, 2000);
  };

  const cancelarAlerta = () => {
    setModalConfirmar(false);
  };

  const cerrarConfirmacion = () => {
    setAlertaEnviada(false);
    setModalConfirmar(false);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>SISTEMA DE EMERGENCIA</Text>
        <Text style={styles.headerSubtitulo}>Carabineros de Chile</Text>
      </View>

      {/* Contenido principal */}
      <View style={styles.contenido}>

        <Text style={styles.instruccion}>
          Presione el botón en caso de emergencia
        </Text>

        {/* Botón de pánico */}
        <TouchableOpacity
          style={styles.botonPanico}
          onPress={handleBotonPanico}
          activeOpacity={0.85}
        >
          <View style={styles.botonPanicoInner}>
            <Text style={styles.botonPanicoTexto}>EMERGENCIA</Text>
            <Text style={styles.botonPanicoSubtexto}>Presione para alertar</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.aviso}>
          Al presionar se enviará su ubicación GPS{'\n'}a la central de Carabineros (CENCO)
        </Text>

      </View>

      {/* Barra de navegación inferior */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActivo}>▲</Text>
          <Text style={[styles.navTexto, styles.navTextoActivo]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/denuncia')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navTexto}>Denuncia</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/llamada')}>
          <Text style={styles.navIcon}>📹</Text>
          <Text style={styles.navTexto}>Llamada LSCh</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/perfil')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navTexto}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmación */}
      <Modal visible={modalConfirmar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {!alertaEnviada ? (
              <>
                {enviando ? (
                  <View style={styles.enviandoContainer}>
                    <ActivityIndicator size="large" color="#1B4332" />
                    <Text style={styles.enviandoTexto}>Enviando alerta...</Text>
                    <Text style={styles.enviandoSubtexto}>Obteniendo ubicación GPS</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.modalIcono}>
                      <Text style={styles.modalIconoTexto}>!</Text>
                    </View>
                    <Text style={styles.modalTitulo}>¿Confirmar Emergencia?</Text>
                    <Text style={styles.modalDescripcion}>
                      Se enviará una alerta inmediata con su ubicación GPS a la central de Carabineros.
                    </Text>
                    <TouchableOpacity style={styles.btnConfirmar} onPress={confirmarAlerta}>
                      <Text style={styles.btnConfirmarTexto}>CONFIRMAR ALERTA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnCancelar} onPress={cancelarAlerta}>
                      <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <>
                <View style={styles.exitoIcono}>
                  <Text style={styles.exitoIconoTexto}>✓</Text>
                </View>
                <Text style={styles.exitoTitulo}>Alerta Enviada</Text>
                <Text style={styles.exitoDescripcion}>
                  Carabineros ha recibido su alerta y está en camino a su ubicación.
                </Text>
                <TouchableOpacity style={styles.btnVolver} onPress={cerrarConfirmacion}>
                  <Text style={styles.btnVolverTexto}>Volver al Inicio</Text>
                </TouchableOpacity>
              </>
            )}

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
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitulo: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerSubtitulo: {
    color: '#C9A84C',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 1,
  },
  contenido: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  instruccion: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.3,
  },
  botonPanico: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#cc0000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#cc0000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 6,
    borderColor: '#ff4444',
  },
  botonPanicoInner: {
    alignItems: 'center',
  },
  botonPanicoTexto: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  botonPanicoSubtexto: {
    color: '#ffcccc',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  aviso: {
    marginTop: 40,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 3,
  },
  navIconActivo: {
    fontSize: 20,
    marginBottom: 3,
    color: '#1B4332',
  },
  navTexto: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
  navTextoActivo: {
    color: '#1B4332',
    fontWeight: '800',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalIcono: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    borderWidth: 3,
    borderColor: '#cc0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconoTexto: {
    fontSize: 28,
    fontWeight: '900',
    color: '#cc0000',
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
    lineHeight: 20,
    marginBottom: 24,
  },
  btnConfirmar: {
    width: '100%',
    height: 52,
    backgroundColor: '#cc0000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#cc0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnConfirmarTexto: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  btnCancelar: {
    width: '100%',
    height: 44,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancelarTexto: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  enviandoContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  enviandoTexto: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B4332',
    marginTop: 16,
  },
  enviandoSubtexto: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
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
    fontSize: 28,
    fontWeight: '900',
    color: '#1B4332',
  },
  exitoTitulo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  exitoDescripcion: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btnVolver: {
    width: '100%',
    height: 48,
    backgroundColor: '#1B4332',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnVolverTexto: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});