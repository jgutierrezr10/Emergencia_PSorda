import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Colors } from '@/theme/theme';

export default function RecuperarClaveScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [rut, setRut] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleRutChange = (text: string) => {
    let clean = text.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length <= 1) {
      setRut(clean);
      return;
    }
    setRut(clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + clean.slice(-1));
  };

  const handleEnviar = async () => {
    setError('');
    if (!rut) {
      setError('FALTA RUT. ESCRIBE TU RUT.');
      return;
    }
    setLoading(true);
    // TODO: Conectar con Spring Boot + PostgreSQL
    setTimeout(() => {
      setLoading(false);
      setEnviado(true);
    }, 1500);
  };

  if (enviado) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.exitoWrapper}>
          <View style={styles.exitoCircle}>
            <Ionicons name="mail-open-outline" size={44} color={colors.primary} />
          </View>
          <Text style={styles.exitoTitulo}>PASOS YA ENVIADOS</Text>
          <Text style={styles.exitoTexto}>SI RUT EXISTE, NOSOTROS ENVIAR PASOS A TU CORREO. CLAVE NUEVA.</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
            <Text style={styles.buttonText}>VOLVER A ENTRAR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
              <Ionicons name="key-outline" size={44} color={colors.primary} />
            </View>
            <Text style={styles.title}>RECUPERAR CLAVE</Text>
            <Text style={styles.subtitle}>NOSOTROS AYUDAR. TÚ ENTRAR OTRA VEZ.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.formText}>TÚ ESCRIBIR RUT. NOSOTROS ENVIAR PASOS. CLAVE NUEVA.</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>RUT</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="12.345.678-9" placeholderTextColor={colors.textMuted} value={rut} onChangeText={handleRutChange} autoCapitalize="none" />
            </View>

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleEnviar} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'ENVIANDO...' : 'ENVIAR PASOS'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/')}>
            <Text style={styles.loginLinkText}>¿CLAVE RECORDASTE? <Text style={styles.loginLinkBold}>ENTRAR</Text></Text>
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
    header: { alignItems: 'center', marginBottom: 32 },
    iconCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: c.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    title: { fontSize: 26, fontWeight: '800', color: c.textPrimary, letterSpacing: 0.5 },
    subtitle: { fontSize: 15, color: c.primary, fontWeight: '600', marginTop: 6, textAlign: 'center' },
    card: { backgroundColor: c.surface, borderRadius: 20, padding: 28, borderWidth: 1, borderColor: c.borderSoft },
    formText: { fontSize: 14, color: c.textSecondary, lineHeight: 20, marginBottom: 20 },
    errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.dangerSoft, padding: 12, borderRadius: 10, marginBottom: 20 },
    errorText: { color: c.danger, fontSize: 13, fontWeight: '500', marginLeft: 8, flex: 1 },
    label: { fontSize: 13, fontWeight: '700', color: c.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBg, borderWidth: 1.5, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, height: 54, marginBottom: 18 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: c.textPrimary, height: '100%' },
    button: { backgroundColor: c.primary, borderRadius: 12, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: c.primaryText, fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
    loginLink: { marginTop: 24, alignItems: 'center' },
    loginLinkText: { color: c.textMuted, fontSize: 14 },
    loginLinkBold: { color: c.primary, fontWeight: '700' },
    exitoWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    exitoCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: c.primarySoft, borderWidth: 3, borderColor: c.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    exitoTitulo: { fontSize: 24, fontWeight: '800', color: c.textPrimary, marginBottom: 12, textAlign: 'center' },
    exitoTexto: { fontSize: 15, color: c.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  });
