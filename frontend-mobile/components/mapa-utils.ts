// Construye la URL de OpenStreetMap (embed) centrada en una coordenada,
// con un marcador. No requiere API key.
export function osmEmbedUrl(lat: number, lng: number, delta = 0.004): string {
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;
  const bbox = `${left}%2C${bottom}%2C${right}%2C${top}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}
