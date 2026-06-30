import React, { useMemo } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTheme, Colors } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { TERMINOS_TEXTO } from '@/constants/terminos';

interface TerminosModalProps {
  visible: boolean;
  onAceptar: () => void;
  onRechazar: () => void;
}

export default function TerminosModal({ visible, onAceptar, onRechazar }: TerminosModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Ionicons name="document-text" size={32} color={colors.primary} />
            <Text style={styles.title}>NUEVOS TÉRMINOS</Text>
          </View>
          
          <Text style={styles.subtitle}>
            Hemos actualizado nuestros Términos y Condiciones. Debes aceptarlos para continuar usando la aplicación.
          </Text>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.text}>{TERMINOS_TEXTO}</Text>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.buttonOutline]} onPress={onRechazar}>
              <Text style={styles.buttonOutlineText}>SALIR</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={onAceptar}>
              <Text style={styles.buttonText}>ACEPTAR</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: c.surface, width: '100%', maxHeight: '85%', borderRadius: 24, padding: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  header: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: c.textPrimary, marginTop: 12 },
  subtitle: { fontSize: 14, color: c.textSecondary, textAlign: 'center', marginBottom: 20 },
  scroll: { backgroundColor: c.surfaceAlt, borderRadius: 12, padding: 16, marginBottom: 20 },
  text: { fontSize: 14, color: c.textSecondary, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, height: 50, backgroundColor: c.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: c.primaryText, fontSize: 14, fontWeight: 'bold' },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: c.border },
  buttonOutlineText: { color: c.textSecondary, fontSize: 14, fontWeight: 'bold' }
});