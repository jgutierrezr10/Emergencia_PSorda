import { WebView } from 'react-native-webview';
import { osmEmbedUrl } from './mapa-utils';

interface Props {
  lat: number;
  lng: number;
}

export default function MapaUbicacion({ lat, lng }: Props) {
  return (
    <WebView
      source={{ uri: osmEmbedUrl(lat, lng) }}
      style={{ flex: 1, backgroundColor: 'transparent' }}
      originWhitelist={['*']}
      scrollEnabled={false}
    />
  );
}
