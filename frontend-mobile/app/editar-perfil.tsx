import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditarPerfilScreen() {
  // Datos precargados (simulados). Más adelante vendrán del backend.
  const [nombre, setNombre] = useState('Carlos Muñoz Rojas');
  const [email, setEmail] = useState('carlos.munoz@email.com');
  const [telefono, setTelefono] = useState('+56 9 1234 5678');
  const rut = '12.345.678-9'; // No editable: dato de identidad

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const iniciales = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

  const handleGuardar = async () => {
    setError('');

    if (!nombre || !email || !telefono) {
      setError('Por favor complete todos los campos.');
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
      setError('Ingrese un correo electrónico válido.');
      return;
    }

    setLoading(true);

    // TODO: Guardar en Spring Boot + PostgreSQL
    // await fetch('http://IP:8080/api/perfil', { method: 'PUT', ... });

    // Simulación de guardado
    setTimeout(() => {
      setLoading(false);
      setGuardado(true);
      setTimeout(() => router.back(), 1200);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Editar Perfil</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{iniciales || '—'}</Text>
            </View>
            <TouchableOpacity style={styles.avatarBtn}>
              <Ionicons name="camera-outline" size={16} color="#059669" />
              <Text style={styles.avatarBtnTexto}>Cambiar foto</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {guardado ? (
            <View style={styles.okBox}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <Text style={styles.okText}>Cambios guardados correctamente.</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre y apellidos"
                  placeholderTextColor="#9ca3af"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>RUT</Text>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <Ionicons name="card-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <Text style={styles.inputDisabledText}>{rut}</Text>
                <Ionicons name="lock-closed" size={16} color="#9ca3af" />
              </View>
              <Text style={styles.hint}>El RUT no se puede modificar.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="correo@email.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+56 9 1234 5678"
                  placeholderTextColor="#9ca3af"
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleGuardar}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
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
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitulo: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#047857',
    borderWidth: 3,
    borderColor: '#6ee7b7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarTexto: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
  },
  avatarBtnTexto: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  okBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  okText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
  },
  inputDisabledText: {
    flex: 1,
    fontSize: 16,
    color: '#6b7280',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: '100%',
  },
  hint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#6ee7b7',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cancelBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
