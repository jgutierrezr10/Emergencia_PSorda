import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type Esquema = 'light' | 'dark';
export type Preferencia = 'auto' | 'light' | 'dark';

export interface Colors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderSoft: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  primarySoft: string;
  primaryBorder: string;
  danger: string;
  dangerSoft: string;
  headerText: string;
  overlay: string;
  inputBg: string;
}

const light: Colors = {
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceAlt: '#f1f5f9',
  border: '#e2e8f0',
  borderSoft: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  primary: '#059669',
  primaryText: '#ffffff',
  primarySoft: '#ecfdf5',
  primaryBorder: '#d1fae5',
  danger: '#dc2626',
  dangerSoft: '#fef2f2',
  headerText: '#ffffff',
  overlay: 'rgba(15,23,42,0.55)',
  inputBg: '#f8fafc',
};

const dark: Colors = {
  bg: '#0b1220',
  surface: '#16223a',
  surfaceAlt: '#1e293b',
  border: '#334155',
  borderSoft: '#1e293b',
  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  primary: '#10b981',
  primaryText: '#04130d',
  primarySoft: 'rgba(16,185,129,0.14)',
  primaryBorder: '#065f46',
  danger: '#ef4444',
  dangerSoft: 'rgba(239,68,68,0.14)',
  headerText: '#ffffff',
  overlay: 'rgba(0,0,0,0.7)',
  inputBg: '#0f1a2e',
};

const CLAVE = 'tema_preferencia';

const guardarPref = async (v: string) => {
  try {
    if (Platform.OS === 'web') localStorage.setItem(CLAVE, v);
    else await SecureStore.setItemAsync(CLAVE, v);
  } catch {
    /* ignorar */
  }
};

const leerPref = async (): Promise<Preferencia> => {
  try {
    const v = Platform.OS === 'web' ? localStorage.getItem(CLAVE) : await SecureStore.getItemAsync(CLAVE);
    if (v === 'light' || v === 'dark' || v === 'auto') return v;
  } catch {
    /* ignorar */
  }
  return 'auto';
};

interface Ctx {
  colors: Colors;
  esquema: Esquema;
  preferencia: Preferencia;
  setPreferencia: (p: Preferencia) => void;
}

const ThemeContext = createContext<Ctx>({
  colors: light,
  esquema: 'light',
  preferencia: 'auto',
  setPreferencia: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const sistema = useColorScheme() ?? 'light';
  const [preferencia, setPref] = useState<Preferencia>('auto');

  useEffect(() => {
    leerPref().then(setPref);
  }, []);

  const setPreferencia = (p: Preferencia) => {
    setPref(p);
    guardarPref(p);
  };

  const esquema: Esquema = preferencia === 'auto' ? (sistema === 'dark' ? 'dark' : 'light') : preferencia;
  const colors = esquema === 'dark' ? dark : light;

  return (
    <ThemeContext.Provider value={{ colors, esquema, preferencia, setPreferencia }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
