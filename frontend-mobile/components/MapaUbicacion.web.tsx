import { osmEmbedUrl } from './mapa-utils';

interface Props {
  lat: number;
  lng: number;
  patrolLat?: number | null;
  patrolLng?: number | null;
}

export default function MapaUbicacion({ lat, lng }: Props) {
  return (
    <iframe
      title="Mapa de tu ubicación"
      src={osmEmbedUrl(lat, lng)}
      style={{ border: 0, width: '100%', height: '100%' }}
      loading="lazy"
    />
  );
}
