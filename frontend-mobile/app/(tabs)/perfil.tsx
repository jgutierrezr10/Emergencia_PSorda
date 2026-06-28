import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

interface Contacto {
  id: number;
  nombre: string;
  relacion: string;
  telefono: string;
}

export default function PerfilScreen() {
  const [notificacionesExpandido, setNotificacionesExpandido] = useState(false);
  const [alertasPush, setAlertasPush] = useState(true);
  const [alertasSMS, setAlertasSMS] = useState(true);
  const [compartirUbicacion, setCompartirUbicacion] = useState(true);
  const [vibracion, setVibracion] = useState(true);

  const [contactos, setContactos] = useState<Contacto[]>([
    { id: 1, nombre: 'Ana Muñoz', relacion: 'Madre', telefono: '+56 9 8765 4321' },
    { id: 2, nombre: 'Pedro González', relacion: 'Hermano', telefono: '+56 9 5555 1234' },
  ]);

  const [modalContacto, setModalContacto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoRelacion, setNuevoRelacion] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [errorContacto, setErrorContacto] = useState('');

  const agregarContacto = () => {
    setErrorContacto('');

    if (!nuevoNombre || !nuevoRelacion || !nuevoTelefono) {
      setErrorContacto('Complete todos los campos.');
      return;
    }

    const nuevo: Contacto = {
      id: Date.now(),
      nombre: nuevoNombre,
      relacion: nuevoRelacion,
      telefono: nuevoTelefono,
    };

    setContactos([...contactos, nuevo]);

    // TODO: Guardar en Spring Boot + PostgreSQL
    // await fetch('http://IP:8080/api/contactos', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(nuevo),
    // });

    setNuevoNombre('');
    setNuevoRelacion('');
    setNuevoTelefono('');
    setModalContacto(false);
  };

  const eliminarContacto = (id: number) => {
    setContactos(contactos.filter(c => c.id !== id));

    // TODO: Eliminar en Spring Boot + PostgreSQL
    // await fetch(`http://IP:8080/api/contactos/${id}`, { method: 'DELETE' });
  };

  const cerrarSesion = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
      } else {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('rol');
      }
    } catch (e) {
      // Ignorar errores de borrado
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Hola, Carlos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>

        {/* Card usuario */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>CM</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Carlos Muñoz Rojas</Text>
            <Text style={styles.userRut}>RUT: 12.345.678-9</Text>
            <Text style={styles.userEmail}>carlos.munoz@email.com</Text>
            <View style={styles.verificadoBadge}>
              <Text style={styles.verificadoTexto}>Cuenta Verificada</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btnEditar} onPress={() => router.push('/editar-perfil')}>
            <Ionicons name="pencil" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Notificaciones */}
        <View style={styles.seccionCard}>
          <TouchableOpacity
            style={styles.seccionHeader}
            onPress={() => setNotificacionesExpandido(!notificacionesExpandido)}
          >
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="notifications-outline" size={20} color="#059669" />
              <Text style={styles.seccionTitulo}>Notificaciones</Text>
            </View>
            <Ionicons name={notificacionesExpandido ? 'chevron-up' : 'chevron-down'} size={18} color="#059669" />
          </TouchableOpacity>

          {notificacionesExpandido && (
            <View style={styles.notificacionesBody}>
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Alertas push</Text>
                  <Text style={styles.switchSubtexto}>Recibir alertas en tiempo real</Text>
                </View>
                <Switch
                  value={alertasPush}
                  onValueChange={setAlertasPush}
                  trackColor={{ false: '#d1d5db', true: '#059669' }}
                  thumbColor="#ffffff"
                />
              </View>
              <View style={styles.divisor} />
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Alertas SMS</Text>
                  <Text style={styles.switchSubtexto}>Enviar SMS al contacto de emergencia</Text>
                </View>
                <Switch
                  value={alertasSMS}
                  onValueChange={setAlertasSMS}
                  trackColor={{ false: '#d1d5db', true: '#059669' }}
                  thumbColor="#ffffff"
                />
              </View>
              <View style={styles.divisor} />
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Compartir ubicación</Text>
                  <Text style={styles.switchSubtexto}>Enviar GPS automáticamente en alerta</Text>
                </View>
                <Switch
                  value={compartirUbicacion}
                  onValueChange={setCompartirUbicacion}
                  trackColor={{ false: '#d1d5db', true: '#059669' }}
                  thumbColor="#ffffff"
                />
              </View>
              <View style={styles.divisor} />
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Vibración de alerta</Text>
                  <Text style={styles.switchSubtexto}>Vibración al recibir confirmación</Text>
                </View>
                <Switch
                  value={vibracion}
                  onValueChange={setVibracion}
                  trackColor={{ false: '#d1d5db', true: '#059669' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          )}
        </View>

        {/* Contactos de emergencia */}
        <View style={[styles.seccionCard, styles.contactosCard]}>
          <View style={styles.contactosHeader}>
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="call-outline" size={20} color="#dc2626" />
              <Text style={[styles.seccionTitulo, styles.contactosTitulo]}>Contactos de Emergencia</Text>
            </View>
            <TouchableOpacity style={styles.btnAgregar} onPress={() => setModalContacto(true)}>
              <Text style={styles.btnAgregarTexto}>+ Agregar</Text>
            </TouchableOpacity>
          </View>

          {contactos.length === 0 && (
            <Text style={styles.sinContactos}>No hay contactos de emergencia registrados.</Text>
          )}

          {contactos.map((contacto, index) => (
            <View key={contacto.id}>
              {index > 0 && <View style={styles.divisor} />}
              <View style={styles.contactoRow}>
                <View style={styles.contactoAvatar}>
                  <Text style={styles.contactoAvatarTexto}>
                    {contacto.nombre.charAt(0)}
                  </Text>
                </View>
                <View style={styles.contactoInfo}>
                  <Text style={styles.contactoNombre}>{contacto.nombre}</Text>
                  <Text style={styles.contactoDetalle}>
                    {contacto.relacion} · {contacto.telefono}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.btnEliminar}
                  onPress={() => eliminarContacto(contacto.id)}
                >
                  <Ionicons name="close" size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Opciones adicionales */}
        <View style={styles.seccionCard}>
          <TouchableOpacity style={styles.opcionRow} onPress={() => router.push('/editar-perfil')}>
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="lock-closed-outline" size={20} color="#059669" />
              <View>
                <Text style={styles.opcionTitulo}>Privacidad y seguridad</Text>
                <Text style={styles.opcionSubtexto}>Datos personales y clave única</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <View style={styles.divisor} />
          <TouchableOpacity style={styles.opcionRow}>
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="help-circle-outline" size={20} color="#059669" />
              <View>
                <Text style={styles.opcionTitulo}>Ayuda y soporte</Text>
                <Text style={styles.opcionSubtexto}>FAQ, videotutoriales en LSCh</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <View style={styles.divisor} />
          <TouchableOpacity style={styles.opcionRow}>
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="information-circle-outline" size={20} color="#059669" />
              <View>
                <Text style={styles.opcionTitulo}>Acerca de la app</Text>
                <Text style={styles.opcionSubtexto}>Versión 1.0.0 · SENADIS Chile</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.btnCerrarSesion} onPress={cerrarSesion}>
          <Text style={styles.btnCerrarSesionTexto}>CERRAR SESIÓN</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          App Emergencia Gente Sorda v1.0.0{'\n'}
          Desarrollado con apoyo de SENADIS Chile
        </Text>

      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/home')}>
          <Ionicons name="home-outline" size={22} color="#9ca3af" style={styles.navIcon} />
          <Text style={styles.navTexto}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={22} color="#059669" style={styles.navIconActivo} />
          <Text style={styles.navTextoActivo}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Modal agregar contacto */}
      <Modal visible={modalContacto} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Agregar Contacto de Emergencia</Text>

            <Text style={styles.fieldLabel}>Nombre completo</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Ej: Ana Muñoz"
              placeholderTextColor="#9ca3af"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
            />

            <Text style={styles.fieldLabel}>Relación</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Ej: Madre, Hermano, Amigo"
              placeholderTextColor="#9ca3af"
              value={nuevoRelacion}
              onChangeText={setNuevoRelacion}
            />

            <Text style={styles.fieldLabel}>Teléfono</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="+56 9 1234 5678"
              placeholderTextColor="#9ca3af"
              value={nuevoTelefono}
              onChangeText={setNuevoTelefono}
              keyboardType="phone-pad"
            />

            {errorContacto ? <Text style={styles.errorTexto}>{errorContacto}</Text> : null}

            <TouchableOpacity style={styles.btnGuardar} onPress={agregarContacto}>
              <Text style={styles.btnGuardarTexto}>GUARDAR CONTACTO</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCancelarModal}
              onPress={() => {
                setModalContacto(false);
                setErrorContacto('');
                setNuevoNombre('');
                setNuevoRelacion('');
                setNuevoTelefono('');
              }}
            >
              <Text style={styles.btnCancelarModalTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  headerTitulo: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  contenido: {
    padding: 16,
    paddingBottom: 32,
  },
  userCard: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#047857',
    borderWidth: 3,
    borderColor: '#6ee7b7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTexto: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  userRut: {
    color: '#d1fae5',
    fontSize: 12,
    marginBottom: 2,
  },
  userEmail: {
    color: '#d1fae5',
    fontSize: 12,
    marginBottom: 8,
  },
  verificadoBadge: {
    backgroundColor: '#047857',
    borderWidth: 1,
    borderColor: '#6ee7b7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  verificadoTexto: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  btnEditar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#047857',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  seccionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  seccionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  seccionTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  notificacionesBody: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  switchSubtexto: {
    fontSize: 11,
    color: '#9ca3af',
  },
  divisor: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
  contactosCard: {
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  contactosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  contactosTitulo: {
    color: '#dc2626',
  },
  btnAgregar: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnAgregarTexto: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sinContactos: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
    paddingVertical: 16,
  },
  contactoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactoAvatarTexto: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '800',
  },
  contactoInfo: {
    flex: 1,
  },
  contactoNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  contactoDetalle: {
    fontSize: 12,
    color: '#6b7280',
  },
  btnEliminar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  opcionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  opcionTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  opcionSubtexto: {
    fontSize: 11,
    color: '#9ca3af',
  },
  btnCerrarSesion: {
    height: 52,
    borderWidth: 2,
    borderColor: '#dc2626',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  btnCerrarSesionTexto: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
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
    marginBottom: 3,
  },
  navIconActivo: {
    marginBottom: 3,
  },
  navTexto: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
  navTextoActivo: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 32,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#f9fafb',
    marginBottom: 14,
  },
  errorTexto: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  btnGuardar: {
    height: 52,
    backgroundColor: '#059669',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnGuardarTexto: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  btnCancelarModal: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancelarModalTexto: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
