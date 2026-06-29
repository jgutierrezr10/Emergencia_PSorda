import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Colors } from '@/theme/theme';

export default function EditarPerfilScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [nombre, setNombre] = useState('Carlos Muñoz Rojas');
  const [email, setEmail] = useState('carlos.munoz@email.com');
  const [telefono, setTelefono] = useState('+56 9 1234 5678');
  const rut = '12.345.678-9';

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const iniciales = nombre.trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');

  const handleGuardar = async () => {
    setError('');
    if (!nombre || !email || !telefono) {
      setError('FALTAN DATOS. COMPLETA TODO.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('CORREO MAL. ESCRIBE BIEN.');
      return;
    }
    setLoading(true);
    // TODO: Guardar en Spring Boot + PostgreSQL
    setTimeout(() => {
      setLoading(false);
      setGuardado(true);
      setTimeout(() => router.back(), 1200);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>EDITAR PERFIL</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{iniciales || '—'}</Text>
            </View>
            <TouchableOpacity style={styles.avatarBtn}>
              <Ionicons name="camera-outline" size={16} color={colors.primary} />
              <Text style={styles.avatarBtnTexto}>CAMBIAR FOTO</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {guardado ? (
            <View style={styles.okBox}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.okText}>CAMBIOS YA GUARDADOS.</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOMBRE COMPLETO</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Nombre y apellidos" placeholderTextColor={colors.textMuted} value={nombre} onChangeText={setNombre} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>RUT</Text>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <Ionicons name="card-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <Text style={styles.inputDisabledText}>{rut}</Text>
                <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
              </View>
              <Text style={styles.hint}>RUT NO SE PUEDE CAMBIAR.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CORREO</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="correo@email.com" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>TELÉFONO</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="+56 9 1234 5678" placeholderTextColor={colors.textMuted} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleGuardar} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'GUARDANDO...' : 'GUARDAR'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>CANCELAR</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    header: { backgroundColor: c.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
    backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitulo: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
    contenido: { padding: 20, paddingBottom: 40 },
    avatarWrapper: { alignItems: 'center', marginBottom: 24 },
    avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#047857', borderWidth: 3, borderColor: '#6ee7b7', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    avatarTexto: { color: '#ffffff', fontSize: 30, fontWeight: '900' },
    avatarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: c.primarySoft },
    avatarBtnTexto: { color: c.primary, fontSize: 13, fontWeight: '700' },
    errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.dangerSoft, padding: 12, borderRadius: 10, marginBottom: 16 },
    errorText: { color: c.danger, fontSize: 13, fontWeight: '500', marginLeft: 8, flex: 1 },
    okBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primarySoft, padding: 12, borderRadius: 10, marginBottom: 16 },
    okText: { color: c.primary, fontSize: 13, fontWeight: '600', marginLeft: 8, flex: 1 },
    card: { backgroundColor: c.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: c.border, marginBottom: 20 },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '700', color: c.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBg, borderWidth: 1.5, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, height: 54 },
    inputDisabled: { backgroundColor: c.surfaceAlt },
    inputDisabledText: { flex: 1, fontSize: 16, color: c.textSecondary },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: c.textPrimary, height: '100%' },
    hint: { fontSize: 11, color: c.textMuted, marginTop: 6 },
    button: { backgroundColor: c.primary, borderRadius: 12, height: 54, justifyContent: 'center', alignItems: 'center' },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: c.primaryText, fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
    cancelBtn: { height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    cancelBtnText: { color: c.textMuted, fontSize: 14, fontWeight: '600' },
  });
