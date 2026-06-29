import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image'; // Usamos expo-image para renderizado óptimo
import { useTheme, Colors } from '@/theme/theme';

// 1. IMPORTAR LA LIBRERÍA QUE INSTALASTE
import * as ImagePicker from 'expo-image-picker';

export default function EditarPerfilScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Estados del formulario original
  const [nombre, setNombre] = useState('Carlos Muñoz Rojas');
  const [email, setEmail] = useState('carlos.munoz@email.com');
  const [telefono, setTelefono] = useState('+56 9 1234 5678');
  const rut = '12.345.678-9'; // Lectura fija según tu diseño preliminar

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guardado, setGuardado] = useState(false);

  // 2. NUEVO ESTADO: Guarda la ruta local (URI) de la foto seleccionada
  const [imagenPerfil, setImagenPerfil] = useState<string | null>(null);

  // Generador de iniciales por defecto (comportamiento original)
  const iniciales = nombre.trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');

  // 3. FUNCIÓN PARA DISPARAR LA GALERÍA DIRECTAMENTE DESDE ESTA PANTALLA
  const handleSeleccionarFoto = async () => {
    // Solicitar permisos de la galería en tiempo de ejecución
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos', 
        'Necesitamos acceso a tus fotos para poder cambiar la imagen de perfil.'
      );
      return;
    }

    // Configuración profesional del selector de imágenes
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Abre el editor nativo de recorte
      aspect: [1, 1],      // Forza a que el recorte sea un cuadrado perfecto (Avatar)
      quality: 0.7,        // Compresión recomendada para rendimiento en móviles
    });

    // Si el usuario selecciona una foto y no cancela el menú
    if (!resultado.canceled) {
      // Guardamos la URI temporal de la foto en el estado local
      setImagenPerfil(resultado.assets[0].uri);
    }
  };

  const handleGuardar = async () => {
    setError('');
    if (!nombre || !email || !telefono) {
      setError('FALTAN DATOS. COMPLETA TODO.');
      return;
    }
    
    setLoading(true);
    try {
      // NOTA: Por ahora solo simulamos el éxito. En pasos futuros mandaremos el FormData a Spring Boot
      setGuardado(true);
    } catch (e) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DE LA PANTALLA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          
          {guardado && (
            <View style={styles.okBox}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.okText}>Cambios guardados de forma local exitosamente.</Text>
            </View>
          )}

          {error ? (
            <View style={{ backgroundColor: colors.dangerSoft, padding: 12, borderRadius: 10, marginBottom: 16 }}>
              <Text style={{ color: colors.danger, fontWeight: '600' }}>{error}</Text>
            </View>
          ) : null}

          {/* SECCIÓN DEL AVATAR (Hará todo en la misma pestaña) */}
          <View style={styles.avatarSeccion}>
            <TouchableOpacity 
              style={styles.avatarContenedor} 
              onPress={handleSeleccionarFoto} // Llama a la galería directamente
              activeOpacity={0.8}
            >
              {imagenPerfil ? (
                // Si ya seleccionó una foto, renderiza la imagen nativa
                <Image source={{ uri: imagenPerfil }} style={styles.avatarImagen} />
              ) : (
                // Si no hay foto, muestra el círculo con iniciales original
                <View style={[styles.avatarFallback, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.avatarTexto, { color: colors.primary }]}>{iniciales}</Text>
                </View>
              )}
              
              {/* Icono flotante del lápiz/cámara indicando que es editable */}
              <View style={[styles.camaraBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={16} color={colors.primaryText} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Presiona la foto para cambiarla</Text>
          </View>

          {/* FORMULARIO DE EDICIÓN */}
          <View style={styles.card}>
            {/* INPUT NOMBRE */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  value={nombre} 
                  onChangeText={setNombre} 
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* INPUT RUT (DESHABILITADO SEGÚN TU DISEÑO) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>RUT</Text>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <Ionicons name="card-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <Text style={styles.inputDisabledText}>{rut}</Text>
              </View>
              <Text style={styles.hint}>El RUT no se puede modificar por seguridad.</Text>
            </View>

            {/* INPUT CORREO */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  value={email} 
                  onChangeText={setEmail} 
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* INPUT TELEFONO */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono de Contacto</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  value={telefono} 
                  onChangeText={setTelefono} 
                  keyboardType="phone-pad"
                  placeholder="+56 9 ...."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* BOTÓN GUARDAR */}
            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              onPress={handleGuardar}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderColor: c.border },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: c.textPrimary },
  scroll: { padding: 16 },
  avatarSeccion: { alignItems: 'center', marginVertical: 20 },
  avatarContenedor: { position: 'relative', width: 110, height: 110 },
  avatarImagen: { width: 110, height: 110, borderRadius: 55 },
  avatarFallback: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center' },
  avatarTexto: { fontSize: 36, fontWeight: 'bold' },
  camaraBadge: { position: 'absolute', bottom: 2, right: 2, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#ffffff' },
  avatarHint: { marginTop: 10, fontSize: 13, color: c.textMuted, fontWeight: '500' },
  card: { backgroundColor: c.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: c.border, marginBottom: 20 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '700', color: c.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBg, borderWidth: 1.5, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, height: 54 },
  inputDisabled: { backgroundColor: c.surfaceAlt },
  inputDisabledText: { flex: 1, fontSize: 16, color: c.textSecondary },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: c.textPrimary, height: '100%' },
  hint: { fontSize: 11, color: c.textMuted, marginTop: 6 },
  button: { backgroundColor: c.primary, borderRadius: 12, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  buttonText: { color: c.primaryText, fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 },
  okBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primarySoft, padding: 12, borderRadius: 10, marginBottom: 16 },
  okText: { color: c.primary, fontSize: 13, fontWeight: '600', marginLeft: 8, flex: 1 }
});