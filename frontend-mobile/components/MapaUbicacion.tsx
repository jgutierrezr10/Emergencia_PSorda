import { WebView } from 'react-native-webview';
import { useRef, useState, useEffect, useMemo } from 'react';

interface Props {
  lat: number;
  lng: number;
  patrolLat?: number | null;
  patrolLng?: number | null;
  routeCoords?: [number, number][] | null; // ruta por calles [lat, lng][]
}

// Mapa Leaflet dentro de un WebView: muestra al usuario y, cuando hay patrulla
// despachada, su marcador avanzando POR LAS CALLES con la ruta dibujada.
const buildHtml = (lat: number, lng: number) => `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;padding:0;background:#e5e7eb}</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

  var userIcon = L.divIcon({ className: '', iconSize: [20,20], iconAnchor: [10,10],
    html: '<div style="width:14px;height:14px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 0 0 2px rgba(239,68,68,.5)"></div>' });
  var userM = L.marker([${lat}, ${lng}], { icon: userIcon }).addTo(map);

  var patrolIcon = L.divIcon({ className: '', iconSize: [34,34], iconAnchor: [17,17],
    html: '<div style="width:34px;height:34px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11h1a1 1 0 011 1v4a1 1 0 01-1 1h-1a2 2 0 11-4 0H9a2 2 0 11-4 0H4a1 1 0 01-1-1v-4a1 1 0 011-1h1zm2.2 0h9.6l-1-3H8.2l-1 3z"/></svg></div>' });

  var patrolM = null, line = null;

  window.updateUser = function(uLat, uLng){ userM.setLatLng([uLat, uLng]); };

  // Dibuja la ruta por calles una sola vez y encuadra el mapa.
  window.setRoute = function(routeJson, uLat, uLng){
    var pts; try { pts = JSON.parse(routeJson); } catch(e){ pts = null; }
    if (!pts || pts.length < 2) return;
    if (line) { map.removeLayer(line); }
    line = L.polyline(pts, { color: '#2563eb', weight: 5, opacity: 0.8, lineJoin: 'round', lineCap: 'round' }).addTo(map);
    try { map.fitBounds(line.getBounds(), { padding: [55,55], maxZoom: 16 }); } catch(e){}
  };

  // Mueve (o crea) el marcador de la patrulla. Se llama en cada tick.
  window.movePatrol = function(pLat, pLng){
    if (!patrolM) { patrolM = L.marker([pLat, pLng], { icon: patrolIcon, zIndexOffset: 1000 }).addTo(map); }
    else { patrolM.setLatLng([pLat, pLng]); }
  };

  window.clearPatrol = function(uLat, uLng){
    if (patrolM) { map.removeLayer(patrolM); patrolM = null; }
    if (line) { map.removeLayer(line); line = null; }
    map.setView([uLat, uLng], 14);
  };
</script>
</body>
</html>`;

export default function MapaUbicacion({ lat, lng, patrolLat, patrolLng, routeCoords }: Props) {
  const ref = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const inicial = useRef({ lat, lng });
  const html = useMemo(() => buildHtml(inicial.current.lat, inicial.current.lng), []);

  // Mantener la posición del usuario actualizada sin recargar el mapa.
  useEffect(() => {
    if (ready) ref.current?.injectJavaScript(`window.updateUser && window.updateUser(${lat}, ${lng});true;`);
  }, [ready, lat, lng]);

  // Dibujar la ruta por calles cuando llega (una vez).
  useEffect(() => {
    if (!ready || !routeCoords || routeCoords.length < 2) return;
    const routeJson = JSON.stringify(routeCoords);
    ref.current?.injectJavaScript(`window.setRoute && window.setRoute(${JSON.stringify(routeJson)}, ${lat}, ${lng});true;`);
  }, [ready, routeCoords, lat, lng]);

  // Mover / quitar la patrulla en cada tick.
  useEffect(() => {
    if (!ready) return;
    if (patrolLat != null && patrolLng != null) {
      ref.current?.injectJavaScript(`window.movePatrol && window.movePatrol(${patrolLat}, ${patrolLng});true;`);
    } else {
      ref.current?.injectJavaScript(`window.clearPatrol && window.clearPatrol(${lat}, ${lng});true;`);
    }
  }, [ready, patrolLat, patrolLng, lat, lng]);

  return (
    <WebView
      ref={ref}
      source={{ html }}
      style={{ flex: 1, backgroundColor: 'transparent' }}
      originWhitelist={['*']}
      scrollEnabled={false}
      onLoadEnd={() => setReady(true)}
    />
  );
}
