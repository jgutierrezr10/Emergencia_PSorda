// === SIMULACIÓN DE LA PATRULLA ===
// Calcula una posición simulada de la patrulla que parte a ~2.5 km del ciudadano
// y se acerca según el progreso (0 = recién despachada, 1 = en el lugar).
// Con ruteo OSRM, la patrulla avanza por las CALLES (estilo Uber), no en línea recta.
// PARA LA VERSIÓN REAL: reemplazar la posición simulada por el GPS real de la patrulla;
// el ruteo (obtenerRutaCalles) y el dibujo quedan igual.

export interface LatLng { lat: number; lng: number; }

// Punto de partida determinista: misma "semilla" (id de alerta) + mismo destino => mismo inicio
// en CENCO y en el móvil, para que ambos vean el mismo recorrido.
export function inicioPatrulla(destino: LatLng, semilla: number): LatLng {
  const ang = (((semilla * 47) % 360) * Math.PI) / 180;
  const distKm = 2.5;
  const dLat = (distKm / 111) * Math.cos(ang);
  const cosLat = Math.cos((destino.lat * Math.PI) / 180) || 1;
  const dLng = (distKm / (111 * cosLat)) * Math.sin(ang);
  return { lat: destino.lat + dLat, lng: destino.lng + dLng };
}

// Interpolación recta (fallback si OSRM no responde).
export function posicionPatrulla(inicio: LatLng, destino: LatLng, progreso: number): LatLng {
  const p = Math.max(0, Math.min(1, progreso));
  return {
    lat: inicio.lat + (destino.lat - inicio.lat) * p,
    lng: inicio.lng + (destino.lng - inicio.lng) * p,
  };
}

// Trae la ruta por calles desde OSRM (servidor público, gratis, sin API key).
// Devuelve la lista de puntos de la ruta; si falla, devuelve [inicio, destino] (recta).
export async function obtenerRutaCalles(inicio: LatLng, destino: LatLng): Promise<LatLng[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${inicio.lng},${inicio.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    const coords: number[][] | undefined = data?.routes?.[0]?.geometry?.coordinates;
    if (!coords || coords.length < 2) return [inicio, destino];
    return coords.map((c) => ({ lat: c[1], lng: c[0] }));
  } catch {
    return [inicio, destino];
  }
}

// Posición a lo largo de la ruta según el progreso (0..1), medido por distancia recorrida.
export function puntoEnRuta(ruta: LatLng[], progreso: number): LatLng {
  const p = Math.max(0, Math.min(1, progreso));
  if (ruta.length === 0) return { lat: 0, lng: 0 };
  if (ruta.length === 1) return ruta[0];
  const dist = (a: LatLng, b: LatLng) =>
    Math.hypot(a.lat - b.lat, (a.lng - b.lng) * Math.cos((a.lat * Math.PI) / 180));
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < ruta.length; i++) {
    const d = dist(ruta[i - 1], ruta[i]);
    seg.push(d);
    total += d;
  }
  if (total === 0) return ruta[ruta.length - 1];
  let target = p * total;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i]) {
      const f = seg[i] === 0 ? 0 : target / seg[i];
      return {
        lat: ruta[i].lat + (ruta[i + 1].lat - ruta[i].lat) * f,
        lng: ruta[i].lng + (ruta[i + 1].lng - ruta[i].lng) * f,
      };
    }
    target -= seg[i];
  }
  return ruta[ruta.length - 1];
}
