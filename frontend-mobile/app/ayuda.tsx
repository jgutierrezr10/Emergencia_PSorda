import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Colors } from '@/theme/theme';

export default function AyudaScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.title}>AYUDA Y SOPORTE</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="help-buoy" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>¿CÓMO USAR LA APP?</Text>
          </View>
          <Text style={styles.cardText}>
            1. En caso de emergencia, presiona el botón <Text style={styles.textBold}>"EMERGENCIA SORDO"</Text> en la pantalla principal.{'\n'}
            2. La app buscará tu ubicación GPS automáticamente.{'\n'}
            3. Responde a las preguntas de Triage (Sí/No) para ayudar a la patrulla a saber qué está pasando.{'\n'}
            4. Cuando la alerta llegue a CENCO, podrás usar el Chat o Videollamada (con intérprete) para comunicarte con Carabineros.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubbles" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>CONTACTO DE SOPORTE TÉCNICO</Text>
          </View>
          <Text style={styles.cardText}>
            Si tienes problemas técnicos con la aplicación (no puedes iniciar sesión, errores al guardar contactos, etc.), puedes escribirnos a:
            {'\n\n'}
            <Text style={styles.textBold}>soporte.app@senadis.cl</Text>
            {'\n\n'}
            O envíanos un mensaje de WhatsApp (Solo texto o video en LSCh) al número de soporte técnico (horario hábil).
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingVertical: 16, paddingHorizontal: 20 },
    backLink: { paddingRight: 16 },
    title: { fontSize: 18, fontWeight: '800', color: c.primaryText, letterSpacing: 0.5 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    card: { backgroundColor: c.surface, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: c.borderSoft },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: c.primary, letterSpacing: 0.5 },
    cardText: { fontSize: 14, color: c.textSecondary, lineHeight: 22 },
    textBold: { fontWeight: '800', color: c.textPrimary },
  });
