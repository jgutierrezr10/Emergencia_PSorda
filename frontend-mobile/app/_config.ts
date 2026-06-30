import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  return 'https://emergenciapsorda-production.up.railway.app';
};

export const baseUrl = getBaseUrl();

console.log("Servidor detectado en:", baseUrl);

export default function ConfigDummy() { return null; }
