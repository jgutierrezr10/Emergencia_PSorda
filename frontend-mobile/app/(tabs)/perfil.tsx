import { View, Text, TouchableOpacity, ScrollView, Switch, Modal, TextInput, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Colors, Preferencia } from '@/theme/theme';
import { baseUrl } from '../_config';

interface Contacto {
  id: number;
  nombre: string;
  relacion: string;
  numero: string;
}

interface Entorno {
  id: number;
  nombre: string;
  parentesco: string;
  viveConUsuario: boolean;
}

interface Usuario {
  nombre: string;
  apellido: string;
  rut: string;
  telefono: string;
}

const OPCIONES_TEMA: { val: Preferencia; label: string; icon: 'phone-portrait-outline' | 'sunny-outline' | 'moon-outline' }[] = [
  { val: 'auto', label: 'AUTOMÁTICO', icon: 'phone-portrait-outline' },
  { val: 'light', label: 'CLARO', icon: 'sunny-outline' },
  { val: 'dark', label: 'OSCURO', icon: 'moon-outline' },
];

export default function PerfilScreen() {
  const { colors, preferencia, setPreferencia } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [notificacionesExpandido, setNotificacionesExpandido] = useState(false);
  const [alertasPush, setAlertasPush] = useState(true);
  const [alertasSMS, setAlertasSMS] = useState(true);
  const [compartirUbicacion, setCompartirUbicacion] = useState(true);
  const [vibracion, setVibracion] = useState(true);

  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [entornos, setEntornos] = useState<Entorno[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const rut = await (Platform.OS === 'web' ? localStorage.getItem('rut') : SecureStore.getItemAsync('rut'));
        const token = await (Platform.OS === 'web' ? localStorage.getItem('token') : SecureStore.getItemAsync('token'));
        if (rut) {
          // 1. Cargar Usuario
          const resUser = await fetch(`${baseUrl}/usuarios/rut/${rut}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resUser.ok) {
            const dataUser = await resUser.json();
            setUsuario(dataUser);
          }

          // 2. Cargar Contactos
          const resC = await fetch(`${baseUrl}/api/contactos-emergencia/usuario/${rut}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resC.ok) {
            const dataC = await resC.json();
            setContactos(dataC);
          }
          
          // 3. Cargar Entorno
          const resE = await fetch(`${baseUrl}/api/entornos/usuario/${rut}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resE.ok) {
            const dataE = await resE.json();
            setEntornos(dataE);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del perfil", err);
      }
    };
    cargarDatos();
  }, []);

  const [modalContacto, setModalContacto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoRelacion, setNuevoRelacion] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [errorContacto, setErrorContacto] = useState('');

  const agregarContacto = async () => {
    setErrorContacto('');
    if (!nuevoNombre || !nuevoRelacion || !nuevoTelefono) {
      setErrorContacto('FALTAN DATOS. COMPLETA TODO.');
      return;
    }
    
    try {
      const rut = await (Platform.OS === 'web' ? localStorage.getItem('rut') : SecureStore.getItemAsync('rut'));
      const token = await (Platform.OS === 'web' ? localStorage.getItem('token') : SecureStore.getItemAsync('token'));
      
      const res = await fetch(`${baseUrl}/api/contactos-emergencia/usuario/${rut}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ nombre: nuevoNombre, relacion: nuevoRelacion, numero: nuevoTelefono })
      });
      
      if (res.ok) {
        const data = await res.json();
        setContactos([...contactos, data]);
        setNuevoNombre('');
        setNuevoRelacion('');
        setNuevoTelefono('');
        setModalContacto(false);
      } else {
        setErrorContacto('Error al guardar contacto en el servidor.');
      }
    } catch (err) {
      setErrorContacto('Error de red. Intenta nuevamente.');
    }
  };

  const eliminarContacto = async (id: number) => {
    try {
      const token = await (Platform.OS === 'web' ? localStorage.getItem('token') : SecureStore.getItemAsync('token'));
      const res = await fetch(`${baseUrl}/api/contactos-emergencia/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setContactos(contactos.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error al eliminar contacto", err);
    }
  };
  const [modalEntorno, setModalEntorno] = useState(false);
  const [nuevoEntornoNombre, setNuevoEntornoNombre] = useState('');
  const [nuevoEntornoParentesco, setNuevoEntornoParentesco] = useState('');
  const [nuevoEntornoVive, setNuevoEntornoVive] = useState(false);
  const [errorEntorno, setErrorEntorno] = useState('');

  const agregarEntorno = async () => {
    setErrorEntorno('');
    if (!nuevoEntornoNombre || !nuevoEntornoParentesco) {
      setErrorEntorno('FALTAN DATOS. COMPLETA TODO.');
      return;
    }
    
    try {
      const rut = await (Platform.OS === 'web' ? localStorage.getItem('rut') : SecureStore.getItemAsync('rut'));
      const token = await (Platform.OS === 'web' ? localStorage.getItem('token') : SecureStore.getItemAsync('token'));
      
      const res = await fetch(`${baseUrl}/api/entornos/usuario/${rut}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ nombre: nuevoEntornoNombre, parentesco: nuevoEntornoParentesco, viveConUsuario: nuevoEntornoVive })
      });
      
      if (res.ok) {
        const data = await res.json();
        setEntornos([...entornos, data]);
        setNuevoEntornoNombre('');
        setNuevoEntornoParentesco('');
        setNuevoEntornoVive(false);
        setModalEntorno(false);
      } else {
        setErrorEntorno('Error al guardar familiar en el servidor.');
      }
    } catch (err) {
      setErrorEntorno('Error de red. Intenta nuevamente.');
    }
  };

  const eliminarEntorno = async (id: number) => {
    try {
      const token = await (Platform.OS === 'web' ? localStorage.getItem('token') : SecureStore.getItemAsync('token'));
      const res = await fetch(`${baseUrl}/api/entornos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEntornos(entornos.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Error al eliminar entorno", err);
    }
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
        <Text style={styles.headerTitulo}>HOLA, {usuario ? usuario.nombre.toUpperCase() : 'USUARIO'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {/* Card usuario */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{usuario ? usuario.nombre.charAt(0).toUpperCase() : '?'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Cargando...'}</Text>
            <Text style={styles.userRut}>RUT: {usuario ? usuario.rut : 'Cargando...'}</Text>
            <Text style={styles.userEmail}>TEL: {usuario ? usuario.telefono : 'Cargando...'}</Text>
            <View style={styles.verificadoBadge}>
              <Text style={styles.verificadoTexto}>CUENTA VERIFICADA</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btnEditar} onPress={() => router.push('/editar-perfil')}>
            <Ionicons name="pencil" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Apariencia / Modo oscuro */}
        <View style={styles.seccionCard}>
          <View style={styles.seccionHeaderStatic}>
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="contrast-outline" size={20} color={colors.primary} />
              <Text style={styles.seccionTitulo}>APARIENCIA</Text>
            </View>
          </View>
          <View style={styles.temaRow}>
            {OPCIONES_TEMA.map((o) => {
              const activa = preferencia === o.val;
              return (
                <TouchableOpacity
                  key={o.val}
                  style={[styles.temaOpcion, activa && styles.temaOpcionActiva]}
                  onPress={() => setPreferencia(o.val)}
                >
                  <Ionicons name={o.icon} size={22} color={activa ? colors.primaryText : colors.textMuted} />
                  <Text style={[styles.temaTexto, activa && styles.temaTextoActivo]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.seccionCard}>
          <TouchableOpacity style={styles.seccionHeader} onPress={() => setNotificacionesExpandido(!notificacionesExpandido)}>
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              <Text style={styles.seccionTitulo}>NOTIFICACIONES</Text>
            </View>
            <Ionicons name={notificacionesExpandido ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
          </TouchableOpacity>

          {notificacionesExpandido && (
            <View style={styles.notificacionesBody}>
              {[
                { label: 'ALERTAS PUSH', sub: 'RECIBIR ALERTAS AHORA', val: alertasPush, set: setAlertasPush },
                { label: 'ALERTAS SMS', sub: 'ENVIAR SMS A CONTACTO', val: alertasSMS, set: setAlertasSMS },
                { label: 'COMPARTIR UBICACIÓN', sub: 'ENVIAR GPS AUTOMÁTICO', val: compartirUbicacion, set: setCompartirUbicacion },
                { label: 'VIBRACIÓN ALERTA', sub: 'VIBRAR CUANDO LLEGA CONFIRMACIÓN', val: vibracion, set: setVibracion },
              ].map((s, i) => (
                <View key={s.label}>
                  {i > 0 && <View style={styles.divisor} />}
                  <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                      <Text style={styles.switchLabel}>{s.label}</Text>
                      <Text style={styles.switchSubtexto}>{s.sub}</Text>
                    </View>
                    <Switch
                      value={s.val}
                      onValueChange={s.set}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Contactos de emergencia */}
        <View style={[styles.seccionCard, styles.contactosCard]}>
          <View style={styles.contactosHeader}>
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="call-outline" size={20} color={colors.danger} />
              <Text style={[styles.seccionTitulo, { color: colors.danger }]}>CONTACTOS EMERGENCIA</Text>
            </View>
            <TouchableOpacity style={styles.btnAgregar} onPress={() => setModalContacto(true)}>
              <Text style={styles.btnAgregarTexto}>+ AGREGAR</Text>
            </TouchableOpacity>
          </View>

          {contactos.length === 0 && <Text style={styles.sinContactos}>NO HAY CONTACTOS.</Text>}

          {contactos.map((contacto, index) => (
            <View key={contacto.id}>
              {index > 0 && <View style={styles.divisor} />}
              <View style={styles.contactoRow}>
                <View style={styles.contactoAvatar}>
                  <Text style={styles.contactoAvatarTexto}>{contacto.nombre.charAt(0)}</Text>
                </View>
                <View style={styles.contactoInfo}>
                  <Text style={styles.contactoNombre}>{contacto.nombre}</Text>
                  <Text style={styles.contactoDetalle}>{contacto.relacion} · {contacto.numero}</Text>
                </View>
                <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarContacto(contacto.id)}>
                  <Ionicons name="close" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Entorno Familiar */}
        <View style={[styles.seccionCard, styles.contactosCard, { borderColor: colors.primary }]}>
          <View style={styles.contactosHeader}>
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="home-outline" size={20} color={colors.primary} />
              <Text style={[styles.seccionTitulo, { color: colors.primary }]}>ENTORNO FAMILIAR</Text>
            </View>
            <TouchableOpacity style={[styles.btnAgregar, { backgroundColor: colors.primary }]} onPress={() => setModalEntorno(true)}>
              <Text style={styles.btnAgregarTexto}>+ AGREGAR</Text>
            </TouchableOpacity>
          </View>

          {entornos.length === 0 && <Text style={styles.sinContactos}>NO HAY FAMILIARES REGISTRADOS.</Text>}

          {entornos.map((entornoItem, index) => (
            <View key={entornoItem.id}>
              {index > 0 && <View style={styles.divisor} />}
              <View style={styles.contactoRow}>
                <View style={[styles.contactoAvatar, { backgroundColor: colors.surfaceAlt, borderColor: colors.primary }]}>
                  <Text style={[styles.contactoAvatarTexto, { color: colors.primary }]}>{entornoItem.nombre.charAt(0)}</Text>
                </View>
                <View style={styles.contactoInfo}>
                  <Text style={styles.contactoNombre}>{entornoItem.nombre}</Text>
                  <Text style={styles.contactoDetalle}>
                    {entornoItem.parentesco} · {entornoItem.viveConUsuario ? 'Vive conmigo' : 'No vive conmigo'}
                  </Text>
                </View>
                <TouchableOpacity style={[styles.btnEliminar, { backgroundColor: colors.surfaceAlt, borderColor: colors.primary }]} onPress={() => eliminarEntorno(entornoItem.id)}>
                  <Ionicons name="close" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Opciones */}
        <View style={styles.seccionCard}>
          <TouchableOpacity style={styles.opcionRow} onPress={() => router.push('/privacidad')}>
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.opcionTitulo}>PRIVACIDAD Y SEGURIDAD</Text>
                <Text style={styles.opcionSubtexto}>TUS DATOS + CLAVE ÚNICA</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divisor} />
          <TouchableOpacity style={styles.opcionRow} onPress={() => router.push('/ayuda')}>
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.opcionTitulo}>AYUDA Y SOPORTE</Text>
                <Text style={styles.opcionSubtexto}>PREGUNTAS, VIDEOS EN LSCh</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divisor} />
          <TouchableOpacity style={styles.opcionRow} onPress={() => router.push('/sobre')}>
            <View style={styles.seccionHeaderLeft}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.opcionTitulo}>SOBRE LA APP</Text>
                <Text style={styles.opcionSubtexto}>VERSIÓN 1.0.0 · SENADIS CHILE</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnCerrarSesion} onPress={cerrarSesion}>
          <Text style={styles.btnCerrarSesionTexto}>CERRAR SESIÓN</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          APP EMERGENCIA GENTE SORDA v1.0.0{'\n'}CON APOYO DE SENADIS CHILE
        </Text>
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/home')}>
          <Ionicons name="home-outline" size={22} color={colors.textMuted} />
          <Text style={styles.navTexto}>INICIO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={22} color={colors.primary} />
          <Text style={[styles.navTexto, styles.navTextoActivo]}>PERFIL</Text>
        </TouchableOpacity>
      </View>

      {/* Modal agregar contacto */}
      <Modal visible={modalContacto} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>AGREGAR CONTACTO EMERGENCIA</Text>

            <Text style={styles.fieldLabel}>NOMBRE COMPLETO</Text>
            <TextInput style={styles.fieldInput} placeholder="Ej: Ana Muñoz" placeholderTextColor={colors.textMuted} value={nuevoNombre} onChangeText={setNuevoNombre} />

            <Text style={styles.fieldLabel}>RELACIÓN</Text>
            <TextInput style={styles.fieldInput} placeholder="Ej: Madre, Hermano, Amigo" placeholderTextColor={colors.textMuted} value={nuevoRelacion} onChangeText={setNuevoRelacion} />

            <Text style={styles.fieldLabel}>TELÉFONO</Text>
            <TextInput style={styles.fieldInput} placeholder="+56 9 1234 5678" placeholderTextColor={colors.textMuted} value={nuevoTelefono} onChangeText={setNuevoTelefono} keyboardType="phone-pad" />

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
              <Text style={styles.btnCancelarModalTexto}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal agregar entorno */}
      <Modal visible={modalEntorno} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>AGREGAR FAMILIAR</Text>

            <Text style={styles.fieldLabel}>NOMBRE COMPLETO</Text>
            <TextInput style={styles.fieldInput} placeholder="Ej: Juan Pérez" placeholderTextColor={colors.textMuted} value={nuevoEntornoNombre} onChangeText={setNuevoEntornoNombre} />

            <Text style={styles.fieldLabel}>PARENTESCO</Text>
            <TextInput style={styles.fieldInput} placeholder="Ej: Hermano, Abuelo" placeholderTextColor={colors.textMuted} value={nuevoEntornoParentesco} onChangeText={setNuevoEntornoParentesco} />

            <View style={[styles.switchRow, { paddingHorizontal: 0, marginBottom: 16 }]}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>¿VIVE CONTIGO?</Text>
                <Text style={styles.switchSubtexto}>MARCAR SI VIVEN EN LA MISMA CASA</Text>
              </View>
              <Switch
                value={nuevoEntornoVive}
                onValueChange={setNuevoEntornoVive}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>

            {errorEntorno ? <Text style={styles.errorTexto}>{errorEntorno}</Text> : null}

            <TouchableOpacity style={styles.btnGuardar} onPress={agregarEntorno}>
              <Text style={styles.btnGuardarTexto}>GUARDAR FAMILIAR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnCancelarModal}
              onPress={() => {
                setModalEntorno(false);
                setErrorEntorno('');
                setNuevoEntornoNombre('');
                setNuevoEntornoParentesco('');
                setNuevoEntornoVive(false);
              }}
            >
              <Text style={styles.btnCancelarModalTexto}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: { backgroundColor: c.primary, paddingVertical: 16, paddingHorizontal: 24 },
    headerTitulo: { color: c.headerText, fontSize: 20, fontWeight: '900' },
    contenido: { padding: 16, paddingBottom: 32 },
    userCard: { backgroundColor: c.primary, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#047857', borderWidth: 3, borderColor: '#6ee7b7', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    avatarTexto: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
    userInfo: { flex: 1 },
    userName: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 2 },
    userRut: { color: '#d1fae5', fontSize: 12, marginBottom: 2 },
    userEmail: { color: '#d1fae5', fontSize: 12, marginBottom: 8 },
    verificadoBadge: { backgroundColor: '#047857', borderWidth: 1, borderColor: '#6ee7b7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
    verificadoTexto: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
    btnEditar: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#047857', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#6ee7b7' },
    seccionCard: { backgroundColor: c.surface, borderRadius: 12, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.border },
    seccionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    seccionHeaderStatic: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 },
    seccionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    seccionTitulo: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
    temaRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 16 },
    temaOpcion: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 16, borderRadius: 12, backgroundColor: c.surfaceAlt, borderWidth: 1.5, borderColor: c.border },
    temaOpcionActiva: { backgroundColor: c.primary, borderColor: c.primary },
    temaTexto: { fontSize: 12, fontWeight: '700', color: c.textSecondary },
    temaTextoActivo: { color: c.primaryText },
    notificacionesBody: { borderTopWidth: 1, borderTopColor: c.border },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    switchInfo: { flex: 1, marginRight: 12 },
    switchLabel: { fontSize: 14, fontWeight: '600', color: c.textPrimary, marginBottom: 2 },
    switchSubtexto: { fontSize: 11, color: c.textMuted },
    divisor: { height: 1, backgroundColor: c.borderSoft, marginHorizontal: 16 },
    contactosCard: { borderWidth: 2, borderColor: c.danger },
    contactosHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    btnAgregar: { backgroundColor: c.danger, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    btnAgregarTexto: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
    sinContactos: { textAlign: 'center', color: c.textMuted, fontSize: 13, paddingVertical: 16 },
    contactoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    contactoAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.dangerSoft, borderWidth: 2, borderColor: c.danger, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    contactoAvatarTexto: { color: c.danger, fontSize: 16, fontWeight: '800' },
    contactoInfo: { flex: 1 },
    contactoNombre: { fontSize: 14, fontWeight: '700', color: c.textPrimary, marginBottom: 2 },
    contactoDetalle: { fontSize: 12, color: c.textSecondary },
    btnEliminar: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.dangerSoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: c.danger },
    opcionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    opcionTitulo: { fontSize: 14, fontWeight: '700', color: c.textPrimary, marginBottom: 2 },
    opcionSubtexto: { fontSize: 11, color: c.textMuted },
    btnCerrarSesion: { height: 52, borderWidth: 2, borderColor: c.danger, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    btnCerrarSesionTexto: { color: c.danger, fontSize: 15, fontWeight: '900', letterSpacing: 1 },
    footer: { fontSize: 11, color: c.textMuted, textAlign: 'center', lineHeight: 18 },
    navBar: { flexDirection: 'row', backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.borderSoft, paddingVertical: 10, paddingHorizontal: 8 },
    navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, gap: 3 },
    navTexto: { fontSize: 10, color: c.textMuted, fontWeight: '600' },
    navTextoActivo: { color: c.primary, fontWeight: '800' },
    modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
    modalCard: { backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 32 },
    modalTitulo: { fontSize: 18, fontWeight: '900', color: c.textPrimary, marginBottom: 20, textAlign: 'center' },
    fieldLabel: { fontSize: 12, fontWeight: '700', color: c.primary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
    fieldInput: { height: 48, borderWidth: 1.5, borderColor: c.border, borderRadius: 8, paddingHorizontal: 14, fontSize: 15, color: c.textPrimary, backgroundColor: c.inputBg, marginBottom: 14 },
    errorTexto: { color: c.danger, fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
    btnGuardar: { height: 52, backgroundColor: c.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    btnGuardarTexto: { color: c.primaryText, fontSize: 15, fontWeight: '900', letterSpacing: 1 },
    btnCancelarModal: { height: 48, borderWidth: 1.5, borderColor: c.border, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    btnCancelarModalTexto: { color: c.textSecondary, fontSize: 14, fontWeight: '600' },
  });
