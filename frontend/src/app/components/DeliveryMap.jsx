'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CENTRO_PADRAO = [-23.55052, -46.633308];

function criarIcone(cor) {
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${cor};border:3px solid #ffffff;box-shadow:0 0 0 2px rgba(0,0,0,0.35);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

const iconeOrigem = criarIcone('#0ea5e9');
const iconeDestino = criarIcone('#f97316');

// Reenquadra o mapa sempre que a rota muda
function AjustarMapa({ pontos }) {
  const map = useMap();

  useEffect(() => {
    if (!pontos || pontos.length === 0) return;

    if (pontos.length === 1) {
      map.setView(pontos[0], 13);
      return;
    }

    map.fitBounds(pontos, { padding: [40, 40] });
  }, [map, pontos]);

  return null;
}

export default function DeliveryMap({
  origin,
  destination,
  originLabel = 'Ponto de retirada',
  destinationLabel = 'Ponto de entrega',
}) {
  const [origemLat, origemLng] = origin || [];
  const [destinoLat, destinoLng] = destination || [];

  const temOrigem = Number.isFinite(origemLat) && Number.isFinite(origemLng);
  const temDestino = Number.isFinite(destinoLat) && Number.isFinite(destinoLng);

  const chave = `${origemLat},${origemLng}|${destinoLat},${destinoLng}`;

  const [rotaViaria, setRotaViaria] = useState(null);

  // Busca o trajeto por vias reais. Se falhar, a linha reta continua valendo.
  useEffect(() => {
    if (!temOrigem || !temDestino) return undefined;

    const controller = new AbortController();
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origemLng},${origemLat};${destinoLng},${destinoLat}?overview=full&geometries=geojson`;

    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`OSRM ${res.status}`))))
      .then((data) => {
        const rota = data?.routes?.[0];
        const coords = rota?.geometry?.coordinates;

        if (Array.isArray(coords) && coords.length > 1) {
          setRotaViaria({
            chave,
            pontos: coords.map(([lng, lat]) => [lat, lng]),
            km: rota.distance / 1000,
          });
        }
      })
      .catch((erro) => {
        if (erro.name !== 'AbortError') {
          console.warn('Trajeto viário indisponível, usando linha reta:', erro.message);
        }
      });

    return () => controller.abort();
  }, [chave, temOrigem, temDestino, origemLat, origemLng, destinoLat, destinoLng]);

  const origemPos = useMemo(
    () => (temOrigem ? [origemLat, origemLng] : null),
    [temOrigem, origemLat, origemLng]
  );
  const destinoPos = useMemo(
    () => (temDestino ? [destinoLat, destinoLng] : null),
    [temDestino, destinoLat, destinoLng]
  );

  const viaria = rotaViaria && rotaViaria.chave === chave ? rotaViaria : null;

  const pontos = useMemo(() => {
    if (viaria) return viaria.pontos;
    if (origemPos && destinoPos) return [origemPos, destinoPos];
    if (origemPos) return [origemPos];
    return [];
  }, [viaria, origemPos, destinoPos]);

  let legenda = '';
  if (viaria) {
    legenda = `Trajeto por vias reais (OSRM) · ${viaria.km.toFixed(1)} km`;
  } else if (origemPos && destinoPos) {
    legenda = 'Trajeto em linha reta para visualização; não representa navegação viária.';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <MapContainer
          center={origemPos || CENTRO_PADRAO}
          zoom={13}
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <AjustarMapa pontos={pontos} />

          {origemPos && destinoPos && pontos.length >= 2 && (
            <Polyline positions={pontos} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.9 }} />
          )}

          {origemPos && (
            <Marker position={origemPos} icon={iconeOrigem}>
              <Popup>
                <strong>{originLabel}</strong>
              </Popup>
            </Marker>
          )}

          {destinoPos && (
            <Marker position={destinoPos} icon={iconeDestino}>
              <Popup>
                <strong>{destinationLabel}</strong>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {legenda && <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{legenda}</p>}
    </div>
  );
}