import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, Colors } from '@/theme/theme';
import { baseUrl } from './_config';
import { TERMINOS_VERSION } from '@/constants/terminos';

const guardarDato = async (key: string, value: string) => {
  try {
    if (Platform.OS === 'web') localStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  } catch (e) {}
};

export default function RegistroScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [rut, setRut] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [documentoUri, setDocumentoUri] = useState<string | null>(null);

  const pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setDocumentoUri(result.assets[0].uri);
    }
  };

  const handleRutChange = (text: string) => {
    let clean = text.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length <= 1) {
      setRut(clean);
      return;
    }
    setRut(clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + clean.slice(-1));
  };

  const handleRegistro = async () => {
    setError('');
    if (!nombre || !apellido || !rut || !telefono || !password || !confirmar) {
      setError('FALTAN DATOS. COMPLETA TODO.');
      return;
    }
    if (!aceptaTerminos) {
      setError('DEBES ACEPTAR LOS TÉRMINOS Y CONDICIONES.');
      return;
    }
    if (!documentoUri) {
      setError('DEBES SUBIR TU CREDENCIAL DE DISCAPACIDAD.');
      return;
    }
    if (!/^\d{8,9}$/.test(telefono)) {
      setError('TELÉFONO DEBE TENER 8 O 9 NÚMEROS.');
      return;
    }
    if (password.length < 6) {
      setError('CLAVE CORTA. MÍNIMO 6 LETRAS.');
      return;
    }
    if (password !== confirmar) {
      setError('CLAVES DIFERENTES. DEBEN SER IGUAL.');
      return;
    }
    setLoading(true);
    
    try {
      const cleanRut = rut.replace(/\./g, '');
      if (cleanRut.length < 8) {
        setError('RUT MUY CORTO.');
        setLoading(false);
        return;
      }
      
      const resUsuario = await fetch(`${baseUrl}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          rut: cleanRut,
          telefono,
          clave: password,
          estado: 'Pendiente',
          rol: 'Sordo'
        })
      });

      if (!resUsuario.ok) {
        throw new Error('Error al crear cuenta. Quizás el RUT ya existe.');
      }

      const dataUsuario = await resUsuario.json();

      let validacionUrl = '';
      if (documentoUri) {
        let formData = new FormData();
        const filename = documentoUri.split('/').pop() || 'credencial.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        
        formData.append('file', { uri: documentoUri, name: filename, type } as any);
        const uploadRes = await fetch(`${baseUrl}/api/uploads`, {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          validacionUrl = uploadData.fileUrl;
        }
      }

      const resPersonaSorda = await fetch(`${baseUrl}/api/personas-sordas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direccion: 'No definida',
          infoMedica: '',
          documentoValidacionUrl: validacionUrl,
          usuario: { id: dataUsuario.id }
        })
      });

      if (!resPersonaSorda.ok) {
        throw new Error('Error al configurar cuenta inclusiva.');
      }

      await guardarDato('terminos_version', TERMINOS_VERSION);
      setExito(true);
    } catch (err: any) {
      setError(err.message || 'Error de conexión. Intenta de nuevo.');
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
          <Text style={styles.exitoTitulo}>¡SOLICITUD ENVIADA!</Text>
          <Text style={styles.exitoTexto}>CENCO REVISARÁ TUS DATOS.{'\n'}TE AVISAREMOS CUANDO ESTÉ LISTO.</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
            <Text style={styles.buttonText}>ENTENDIDO</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const campos = [
    { label: 'NOMBRE', icon: 'person-outline' as const, ph: 'Ej: Carlos', val: nombre, set: setNombre, kt: 'default' as const, sec: false },
    { label: 'APELLIDO', icon: 'person-outline' as const, ph: 'Ej: Muñoz', val: apellido, set: setApellido, kt: 'default' as const, sec: false },
    { label: 'RUT', icon: 'card-outline' as const, ph: '12.345.678-9', val: rut, set: handleRutChange, kt: 'default' as const, sec: false },
    { label: 'TELÉFONO', icon: 'call-outline' as const, ph: '987654321', val: telefono, set: setTelefono, kt: 'phone-pad' as const, sec: false },
    { label: 'CLAVE ÚNICA', icon: 'lock-closed-outline' as const, ph: '••••••••', val: password, set: setPassword, kt: 'default' as const, sec: true },
    { label: 'CONFIRMAR CLAVE', icon: 'lock-closed-outline' as const, ph: '••••••••', val: confirmar, set: setConfirmar, kt: 'default' as const, sec: true },
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
              <Ionicons name="person-add-outline" size={44} color={colors.primary} />
            </View>
            <Text style={styles.title}>CREAR CUENTA</Text>
            <Text style={styles.subtitle}>TÚ UNIR EMERGENCIA INCLUSIVA</Text>
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
                    secureTextEntry={f.sec}
                    autoCapitalize={f.label === 'RUT' ? 'none' : 'sentences'}
                  />
                </View>
              </View>
            ))}

            <View style={styles.uploadGroup}>
              <Text style={styles.label}>CREDENCIAL DE DISCAPACIDAD</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                <Ionicons name="camera-outline" size={24} color={colors.primary} />
                <Text style={styles.uploadButtonText}>{documentoUri ? 'FOTO SELECCIONADA' : 'TOMAR O SUBIR FOTO'}</Text>
              </TouchableOpacity>
            </View>

            {/* CHECKBOX DE TÉRMINOS Y CONDICIONES (Modificado) */}
            <View style={styles.checkboxContainer}>
              <Pressable onPress={() => setAceptaTerminos(!aceptaTerminos)} style={styles.checkbox}>
                <Ionicons 
                  name={aceptaTerminos ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={aceptaTerminos ? colors.primary : colors.textMuted} 
                />
              </Pressable>
              
              <View style={styles.textRow}>
                <Text style={styles.checkboxText}>Acepto los </Text>
                {/* Se añade "as any" para evitar el error de TypeScript temporalmente */}
                <TouchableOpacity onPress={() => router.push('/terminos' as any)}>
                  <Text style={styles.linkText}>Términos y Condiciones</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={[styles.button, (!aceptaTerminos || loading) && styles.buttonDisabled]} onPress={handleRegistro} disabled={loading || !aceptaTerminos}>
              <Text style={styles.buttonText}>{loading ? 'CREANDO...' : 'CREAR CUENTA'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/')}>
            <Text style={styles.loginLinkText}>¿YA TIENES CUENTA? <Text style={styles.loginLinkBold}>ENTRAR</Text></Text>
          </TouchableOpacity>
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
    subtitle: { fontSize: 15, color: c.primary, fontWeight: '600', marginTop: 6 },
    card: { backgroundColor: c.surface, borderRadius: 20, padding: 28, borderWidth: 1, borderColor: c.borderSoft },
    errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.dangerSoft, padding: 12, borderRadius: 10, marginBottom: 20 },
    errorText: { color: c.danger, fontSize: 13, fontWeight: '500', marginLeft: 8, flex: 1 },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '700', color: c.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBg, borderWidth: 1.5, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, height: 54 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: c.textPrimary, height: '100%' },
    
    uploadGroup: { marginBottom: 18 },
    uploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.primarySoft, borderWidth: 1.5, borderColor: c.primary, borderRadius: 12, height: 54, gap: 10 },
    uploadButtonText: { color: c.primary, fontWeight: '700', fontSize: 14 },

    // ESTILOS NUEVOS DEL CHECKBOX
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 4 },
    checkbox: { marginRight: 10 },
    textRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 },
    checkboxText: { fontSize: 14, color: c.textSecondary },
    linkText: { color: c.primary, fontWeight: '700', textDecorationLine: 'underline', fontSize: 14 },
    
    button: { backgroundColor: c.primary, borderRadius: 12, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: c.primaryText, fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
    loginLink: { marginTop: 24, alignItems: 'center' },
    loginLinkText: { color: c.textMuted, fontSize: 14 },
    loginLinkBold: { color: c.primary, fontWeight: '700' },
    exitoWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    exitoCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: c.primarySoft, borderWidth: 3, borderColor: c.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    exitoTitulo: { fontSize: 24, fontWeight: '800', color: c.textPrimary, marginBottom: 12 },
    exitoTexto: { fontSize: 15, color: c.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  });