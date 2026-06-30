// === SIMULACIÓN DE LA PATRULLA ===
// Calcula una posición simulada de la patrulla que parte a ~2.5 km del ciudadano
// y se acerca linealmente según el progreso (0 = recién despachada, 1 = en el lugar).
// PARA LA VERSIÓN REAL: reemplazar estas funciones por la posición GPS real de la
// patrulla que entregue el backend (solo cambiar la fuente de lat/lng; el dibujo es igual).

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

export function posicionPatrulla(inicio: LatLng, destino: LatLng, progreso: number): LatLng {
  const p = Math.max(0, Math.min(1, progreso));
  return {
    lat: inicio.lat + (destino.lat - inicio.lat) * p,
    lng: inicio.lng + (destino.lng - inicio.lng) * p,
  };
}
