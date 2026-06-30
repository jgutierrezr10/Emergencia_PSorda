import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  const productionUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  if (productionUrl) {
    return productionUrl;
  }

  if (Platform.OS === 'web') return 'http://localhost:8080';

  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    const ipAutomatica = debuggerHost.split(':').shift();
    return `http://${ipAutomatica}:8080`;
  }

  const ipRespaldo = process.env.EXPO_PUBLIC_BACKEND_IP || 'localhost';

  return `http://${ipRespaldo}:8080`;
};

export const baseUrl = getBaseUrl();

console.log("Servidor detectado en:", baseUrl);

export default function ConfigDummy() { return null; }
