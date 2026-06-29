import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  // Si están probando en entorno Web, usa localhost directamente
  if (Platform.OS === 'web') return 'http://localhost:8080';

  // 1. Intenta obtener la IP automática que genera Expo (funciona la mayoría de las veces)
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  
  if (debuggerHost) {
    const ipAutomatica = debuggerHost.split(':').shift();
    return `http://${ipAutomatica}:8080`;
  }
  
  // 2. RESPALDO PARA EQUIPOS: Si Expo falla en detectarla, usa la IP del archivo .env de cada uno.
  // Si tampoco existe el .env, usa 'localhost' (útil para emuladores en la PC).
  const ipRespaldo = process.env.EXPO_PUBLIC_BACKEND_IP || 'localhost';
  
  return `http://${ipRespaldo}:8080`;
};

export const baseUrl = getBaseUrl();

console.log("🔌 Servidor detectado en:", baseUrl);

export default function ConfigDummy() { return null; }