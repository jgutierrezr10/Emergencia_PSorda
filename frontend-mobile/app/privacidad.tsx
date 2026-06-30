import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Colors } from '@/theme/theme';

export default function PrivacidadScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.title}>PRIVACIDAD Y SEGURIDAD</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>TUS DATOS SEGUROS</Text>
          </View>
          <Text style={styles.cardText}>
            Toda la información personal y médica que registras en esta aplicación está encriptada y es enviada de forma segura a Carabineros de Chile y los servicios de emergencia (CENCO). Nunca compartiremos tus datos con terceros.
          </Text>
        </View>

        <View style={[styles.card, styles.cardDanger]}>
          <View style={styles.cardHeader}>
            <Ionicons name="key" size={28} color={colors.danger} />
            <Text style={[styles.cardTitle, { color: colors.danger }]}>SOBRE TU CLAVE ÚNICA</Text>
          </View>
          <Text style={styles.cardText}>
            Por motivos de máxima seguridad estatal, <Text style={styles.textBold}>ESTA APLICACIÓN NO PERMITE CAMBIAR NI RECUPERAR TU CLAVE ÚNICA.</Text>
            {'\n\n'}
            Si olvidaste o necesitas cambiar tu Clave Única, es un trámite personal y exclusivo que se realiza directamente con el <Text style={styles.textBold}>Servicio de Registro Civil e Identificación de Chile</Text>.
            {'\n\n'}
            Dirígete a la página web claveunica.gob.cl o acude a una oficina del Registro Civil presencialmente.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>USO DE UBICACIÓN (GPS)</Text>
          </View>
          <Text style={styles.cardText}>
            Tu ubicación GPS en tiempo real solo es recopilada y enviada a los servidores de emergencia en el momento exacto en el que tú decides presionar el botón de "Emergencia Sordo" o cuando aceptas compartirla durante una incidencia activa. No te rastreamos en segundo plano cuando la app está cerrada.
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
    cardDanger: { borderColor: c.danger, borderWidth: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: c.primary, letterSpacing: 0.5 },
    cardText: { fontSize: 14, color: c.textSecondary, lineHeight: 22 },
    textBold: { fontWeight: '800', color: c.textPrimary },
  });
