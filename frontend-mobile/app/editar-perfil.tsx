import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme, Colors } from '@/theme/theme';
import { baseUrl } from './_config';

export default function EditarPerfilScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [usuarioCompleto, setUsuarioCompleto] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [infoMedica, setInfoMedica] = useState('');
  const [latitudCasa, setLatitudCasa] = useState('');
  const [longitudCasa, setLongitudCasa] = useState('');
  const [nombreReferenciaCasa, setNombreReferenciaCasa] = useState('');
  const [personaSordaId, setPersonaSordaId] = useState<number | null>(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const rut = await (Platform.OS === 'web' ? localStorage.getItem('rut') : SecureStore.getItemAsync('rut'));
        const token = await (Platform.OS === 'web' ? localStorage.getItem('token') : SecureStore.getItemAsync('token'));
        if (rut) {
          const res = await fetch(`${baseUrl}/usuarios/rut/${rut}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUsuarioCompleto(data);
            setNombre(data.nombre || '');
            setApellido(data.apellido || '');
            setTelefono(data.telefono || '');
          }
          
          const resPS = await fetch(`${baseUrl}/api/personas-sordas/usuario/${rut}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resPS.ok) {
            const dataPS = await resPS.json();
            setPersonaSordaId(dataPS.id);
            setDireccion(dataPS.direccion || '');
            setInfoMedica(dataPS.infoMedica || '');
            setLatitudCasa(dataPS.latitudCasa || '');
            setLongitudCasa(dataPS.longitudCasa || '');
            setNombreReferenciaCasa(dataPS.nombreReferenciaCasa || '');
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del usuario", err);
      }
    };
    cargarDatos();
  }, []);

  const obtenerUbicacionGPS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLatitudCasa(pos.coords.latitude.toString());
      setLongitudCasa(pos.coords.longitude.toString());
    } catch (e) {
      setError('Error al obtener ubicación GPS.');
    }
  };

  const handleActualizar = async () => {
    setError('');
    if (!telefono || !direccion) {
      setError('FALTAN DATOS. COMPLETA TODO.');
      return;
    }
    setLoading(true);

    try {
      const token = await (Platform.OS === 'web' ? localStorage.getItem('token') : SecureStore.getItemAsync('token'));
      const body = {
        ...usuarioCompleto,
        nombre: nombre,
        apellido: apellido,
        telefono: telefono
      };

      const res = await fetch(`${baseUrl}/usuarios/${usuarioCompleto.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });

      if (personaSordaId) {
        await fetch(`${baseUrl}/api/personas-sordas/${personaSordaId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
             id: personaSordaId,
             direccion: direccion,
             infoMedica: infoMedica,
             latitudCasa: latitudCasa,
             longitudCasa: longitudCasa,
             nombreReferenciaCasa: nombreReferenciaCasa,
             usuario: usuarioCompleto
          })
        });
      }

      if (res.ok) {
        setExito(true);
      } else {
        setError('ERROR AL ACTUALIZAR DATOS.');
      }
    } catch (err) {
      setError('ERROR DE RED.');
    } finally {
      setLoading(false);
    }
  };

  if (exito) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.exitoWrapper}>
          <View style={styles.exitoCircle}>
            <Ionicons name="checkmark" size={48} color={colors.primary} />
          </View>
          <Text style={styles.exitoTitulo}>¡DATOS ACTUALIZADOS!</Text>
          <Text style={styles.exitoTexto}>TU PERFIL HA SIDO GUARDADO.</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>VOLVER AL PERFIL</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const campos = [
    { label: 'TELÉFONO', icon: 'call-outline' as const, ph: 'Ej: 987654321', val: telefono, set: setTelefono, kt: 'phone-pad' as const },
    { label: 'DIRECCIÓN', icon: 'home-outline' as const, ph: 'Ej: Calle Falsa 123', val: direccion, set: setDireccion, kt: 'default' as const },
    { label: 'INFO MÉDICA (OPCIONAL)', icon: 'medical-outline' as const, ph: 'Ej: Alergia a penicilina, diabetes...', val: infoMedica, set: setInfoMedica, kt: 'default' as const },
    { label: 'NOMBRE REF. CASA (OPCIONAL)', icon: 'bookmark-outline' as const, ph: 'Ej: Mi Casa, Trabajo', val: nombreReferenciaCasa, set: setNombreReferenciaCasa, kt: 'default' as const },
    { label: 'LATITUD (CASA)', icon: 'navigate-outline' as const, ph: 'Ej: -33.45', val: latitudCasa, set: setLatitudCasa, kt: 'default' as const },
    { label: 'LONGITUD (CASA)', icon: 'navigate-outline' as const, ph: 'Ej: -70.66', val: longitudCasa, set: setLongitudCasa, kt: 'default' as const },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
            <Text style={styles.backLinkText}>VOLVER</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="create-outline" size={44} color={colors.primary} />
            </View>
            <Text style={styles.title}>EDITAR PERFIL</Text>
            <Text style={styles.subtitle}>ACTUALIZA TUS DATOS PERSONALES</Text>
          </View>

          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {campos.map((f) => (
              <View key={f.label} style={styles.inputGroup}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name={f.icon} size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.ph}
                    placeholderTextColor={colors.textMuted}
                    value={f.val}
                    onChangeText={f.set}
                    keyboardType={f.kt}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.gpsButton} onPress={obtenerUbicacionGPS}>
              <Ionicons name="location" size={20} color="#ffffff" style={styles.inputIcon} />
              <Text style={styles.gpsButtonText}>USAR MI UBICACIÓN ACTUAL</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleActualizar} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    backLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 8 },
    backLinkText: { color: c.primary, fontSize: 15, fontWeight: '600', marginLeft: 4 },
    header: { alignItems: 'center', marginBottom: 28 },
    iconCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: c.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    title: { fontSize: 26, fontWeight: '800', color: c.textPrimary, letterSpacing: 0.5 },
    subtitle: { fontSize: 13, color: c.primary, fontWeight: '600', marginTop: 6, textTransform: 'uppercase' },
    card: { backgroundColor: c.surface, borderRadius: 20, padding: 28, borderWidth: 1, borderColor: c.borderSoft },
    errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.dangerSoft, padding: 12, borderRadius: 10, marginBottom: 20 },
    errorText: { color: c.danger, fontSize: 13, fontWeight: '500', marginLeft: 8, flex: 1 },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '700', color: c.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBg, borderWidth: 1.5, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, height: 54 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: c.textPrimary, height: '100%' },
    gpsButton: { flexDirection: 'row', backgroundColor: '#3b82f6', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 8 },
    gpsButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
    button: { backgroundColor: c.primary, borderRadius: 12, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: c.primaryText, fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
    exitoWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    exitoCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: c.primarySoft, borderWidth: 3, borderColor: c.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    exitoTitulo: { fontSize: 24, fontWeight: '800', color: c.textPrimary, marginBottom: 12 },
    exitoTexto: { fontSize: 15, color: c.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  });
