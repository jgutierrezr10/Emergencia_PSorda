import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';
import {
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
  Lexend_900Black,
} from '@expo-google-fonts/lexend';

// Mapa de pesos que se cargan con useFonts en el layout raíz.
export const FUENTES = {
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
  Lexend_900Black,
};

// Factor para agrandar un poco el texto y mejorar la legibilidad.
const ESCALA = 1.1;

const familiaPorPeso = (w?: string | number): string => {
  switch (String(w ?? '400')) {
    case '100':
    case '200':
    case '300':
    case 'light':
      return 'Lexend_300Light';
    case '500':
      return 'Lexend_500Medium';
    case '600':
      return 'Lexend_600SemiBold';
    case '700':
    case 'bold':
      return 'Lexend_700Bold';
    case '800':
      return 'Lexend_800ExtraBold';
    case '900':
      return 'Lexend_900Black';
    default:
      return 'Lexend_400Regular';
  }
};

// Parchea Text y TextInput para usar Lexend (según el peso) y escalar el tamaño.
function parchar(Comp: any) {
  if (!Comp || Comp.__lexend) return;
  const render = Comp.render;
  if (typeof render !== 'function') return;
  Comp.render = function (props: any, ref: any) {
    const flat = StyleSheet.flatten(props?.style) || {};
    const fontFamily = flat.fontFamily ?? familiaPorPeso(flat.fontWeight);
    const extra: any = { fontFamily };
    if (typeof flat.fontSize === 'number') {
      extra.fontSize = Math.round(flat.fontSize * ESCALA);
    }
    return render.call(this, { ...props, style: [extra, props?.style, extra.fontSize ? { fontSize: extra.fontSize } : null] }, ref);
  };
  Comp.__lexend = true;
}

parchar(RNText);
parchar(RNTextInput);
