'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CENTRO_PADRAO = [-23.55, -46.64];
const TILES = {
  mapa: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satelite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  },
};

function markerIcon(kind) {
  return L.divIcon({
    className: 'tracking-marker-wrap',
    html: `<span class="tracking-marker marker-${kind}"></span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 35],
    popupAnchor: [0, -34],
  });
}

const icons = {
  origin: markerIcon('location'),
  package: markerIcon('package'),
  pending: markerIcon('pin'),
  done: markerIcon('done'),
};

const ICONE_POR_STATUS = { 'A Caminho': icons.package, Pendente: icons.pending, Entregue: icons.done };
const LEGENDA_POR_STATUS = { 'A Caminho': 'Entrega em andamento', Pendente: 'Entrega pendente', Entregue: 'Entrega concluída' };

function AjustarMapa({ pontos, rota, selecionada }) {
  const map = useMap();

  useEffect(() => {
    const ajustar = (evento) => {
      if (evento?.detail?.entregaId && selecionada) {
        map.setView(selecionada, 15);
      } else {
        const enquadrar = rota.length > 1 ? rota : pontos;
        if (enquadrar.length > 1) map.fitBounds(enquadrar, { padding: [50, 50] });
        else if (enquadrar.length === 1) map.setView(enquadrar[0], 14);
      }
    };
    ajustar();
    window.addEventListener('tracking-map-focus', ajustar);
    return () => window.removeEventListener('tracking-map-focus', ajustar);
  }, [map, pontos, rota, selecionada]);

  return null;
}

export default function TrackingMap({ layer, origem, entregas, selecionadaId, onSelecionar }) {
  const [rotaViaria, setRotaViaria] = useState(null);
  const tiles = TILES[layer] || TILES.mapa;
  const posicaoOrigem = useMemo(() => origem ? [Number(origem.lat), Number(origem.lng)] : null, [origem?.lat, origem?.lng]);
  const paradas = useMemo(() => entregas.map((entrega) => [Number(entrega.lat), Number(entrega.lng)]), [entregas]);
  const pontosRota = useMemo(() => [...(posicaoOrigem ? [posicaoOrigem] : []), ...paradas], [posicaoOrigem, paradas]);
  const chaveRota = JSON.stringify(pontosRota);
  useEffect(() => {
    if (pontosRota.length < 2) { setRotaViaria(null); return undefined; }
    const controller = new AbortController();
    const coordenadas = pontosRota.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordenadas}?overview=full&geometries=geojson`;
    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`OSRM ${res.status}`))))
      .then((data) => {
        const coords = data?.routes?.[0]?.geometry?.coordinates;
        if (Array.isArray(coords) && coords.length > 1) setRotaViaria({ chave: chaveRota, pontos: coords.map(([lng, lat]) => [lat, lng]) });
      })
      .catch((falha) => { if (falha.name !== 'AbortError') console.warn('Rota viária indisponível; usando linha reta.', falha.message); });
    return () => controller.abort();
  }, [chaveRota, pontosRota]);
  const trajeto = rotaViaria?.chave === chaveRota ? rotaViaria.pontos : pontosRota;
  const posicaoSelecionada = entregas.find((entrega) => entrega.id === selecionadaId);
  const coordenadaSelecionada = posicaoSelecionada ? [posicaoSelecionada.lat, posicaoSelecionada.lng] : null;
  const todosOsPontos = [...(posicaoOrigem ? [posicaoOrigem] : []), ...entregas.map((entrega) => [entrega.lat, entrega.lng])];
  // referência estável para o efeito do AjustarMapa só rodar quando os pontos mudarem de verdade
  const chavePontos = JSON.stringify(todosOsPontos);

  return (
    <MapContainer center={posicaoOrigem ?? CENTRO_PADRAO} zoom={13} zoomControl className="tracking-leaflet-map">
      <TileLayer key={layer} attribution={tiles.attribution} url={tiles.url} />
      <AjustarMapa key={chavePontos} pontos={todosOsPontos} rota={trajeto} selecionada={coordenadaSelecionada} />

      {trajeto.length > 1 && <Polyline positions={trajeto} pathOptions={{ color: '#ff710f', weight: 4, opacity: 0.98 }} />}

      {posicaoOrigem && (
        <Marker position={posicaoOrigem} icon={icons.origin}><Popup>Sua localização</Popup></Marker>
      )}
      {entregas.map((entrega) => (
        <Marker
          key={entrega.id}
          position={[entrega.lat, entrega.lng]}
          icon={ICONE_POR_STATUS[entrega.status] ?? icons.pending}
          zIndexOffset={entrega.id === selecionadaId ? 1000 : 0}
          eventHandlers={{ click: () => onSelecionar(entrega.id) }}
        >
          <Popup>{entrega.codigo} · {LEGENDA_POR_STATUS[entrega.status]}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
