import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Colors } from '@/theme/theme';

export default function SobreScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.title}>SOBRE LA APP</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.logoContainer}>
          <Ionicons name="shield" size={80} color={colors.primary} />
          <Text style={styles.appName}>Emergencia PSorda</Text>
          <Text style={styles.appVersion}>Versión 1.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>
            Esta aplicación ha sido diseñada y desarrollada para brindar acceso inclusivo y directo a los servicios de emergencia (Carabineros de Chile) para la comunidad de Personas Sordas del país.
            {'\n\n'}
            El objetivo principal es reducir los tiempos de respuesta y entregar herramientas visuales (Lengua de Señas Chilena - LSCh) y de chat adaptadas a las necesidades de la comunidad, sin depender exclusivamente de llamadas de voz.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>APOYO INSTITUCIONAL</Text>
          </View>
          <Text style={styles.cardText}>
            Desarrollado con el apoyo y directrices del <Text style={styles.textBold}>Servicio Nacional de la Discapacidad (SENADIS Chile)</Text> y Carabineros de Chile.
          </Text>
        </View>

        <Text style={styles.footerText}>
          © 2024 Gobierno de Chile.{'\n'}Todos los derechos reservados.
        </Text>

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
    logoContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    appName: { fontSize: 24, fontWeight: '900', color: c.textPrimary, marginTop: 12 },
    appVersion: { fontSize: 14, color: c.textSecondary, marginTop: 4 },
    card: { backgroundColor: c.surface, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: c.borderSoft },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: c.primary, letterSpacing: 0.5 },
    cardText: { fontSize: 14, color: c.textSecondary, lineHeight: 22 },
    textBold: { fontWeight: '800', color: c.textPrimary },
    footerText: { textAlign: 'center', fontSize: 12, color: c.textMuted, marginTop: 20, lineHeight: 18 },
  });
