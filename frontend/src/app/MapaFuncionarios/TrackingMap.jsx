'use client';

import { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CENTRO_PADRAO = [-23.55, -46.64];
const TILES = {
  mapa: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  satelite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
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

const ICONE_POR_STATUS = { 'Em Rota': icons.package, 'Saiu para Entrega': icons.package, 'A Caminho': icons.package, Pendente: icons.pending, Entregue: icons.done };
const LEGENDA_POR_STATUS = { 'Em Rota': 'Em rota', 'Saiu para Entrega': 'Saiu para entrega', 'A Caminho': 'Saiu para entrega', Pendente: 'Entrega pendente', Entregue: 'Entrega concluída' };

function AjustarMapa({ pontos }) {
  const map = useMap();

  useEffect(() => {
    const ajustar = () => {
      if (pontos.length > 1) map.fitBounds(pontos, { padding: [50, 50] });
      else if (pontos.length === 1) map.setView(pontos[0], 14);
    };
    ajustar();
    window.addEventListener('tracking-map-focus', ajustar);
    return () => window.removeEventListener('tracking-map-focus', ajustar);
  }, [map, pontos]);

  return null;
}

export default function TrackingMap({ layer, origem, entregas, selecionadaId, onSelecionar }) {
  const [rota, setRota] = useState([]);
  const tiles = TILES[layer] || TILES.mapa;
  const posicaoOrigem = origem ? [origem.lat, origem.lng] : null;
  const abertas = entregas.filter((entrega) => entrega.status !== 'Entregue');
  const destinoSelecionado = entregas.find((entrega) => entrega.id === selecionadaId) || abertas[0];
  const destino = destinoSelecionado ? [destinoSelecionado.lat, destinoSelecionado.lng] : null;

  useEffect(() => {
    if (!posicaoOrigem || !destino) {
      setRota([]);
      return undefined;
    }
    const controlador = new AbortController();
    const coordenadas = `${posicaoOrigem[1]},${posicaoOrigem[0]};${destino[1]},${destino[0]}`;
    fetch(`https://router.project-osrm.org/route/v1/driving/${coordenadas}?overview=full&geometries=geojson`, { signal: controlador.signal })
      .then((resposta) => resposta.ok ? resposta.json() : Promise.reject(new Error(`OSRM ${resposta.status}`)))
      .then((dados) => {
        const pontos = dados.routes?.[0]?.geometry?.coordinates;
        setRota(Array.isArray(pontos) ? pontos.map(([lng, lat]) => [lat, lng]) : [posicaoOrigem, destino]);
      })
      .catch(() => {
        if (!controlador.signal.aborted) setRota([posicaoOrigem, destino]);
      });
    return () => controlador.abort();
  }, [origem?.lat, origem?.lng, destinoSelecionado?.id, destinoSelecionado?.lat, destinoSelecionado?.lng]);
  // trajeto: posição do motorista -> entregas abertas na ordem da previsão (linhas retas, sem serviço de rotas)
  const trajeto = rota.length > 1 ? rota : [...(posicaoOrigem ? [posicaoOrigem] : []), ...(destino ? [destino] : [])];
  const todosOsPontos = [...(posicaoOrigem ? [posicaoOrigem] : []), ...entregas.map((entrega) => [entrega.lat, entrega.lng])];
  // referência estável para o efeito do AjustarMapa só rodar quando os pontos mudarem de verdade
  const chavePontos = JSON.stringify(todosOsPontos);

  return (
    <MapContainer center={posicaoOrigem ?? CENTRO_PADRAO} zoom={13} zoomControl className="tracking-leaflet-map">
      <TileLayer key={layer} attribution={tiles.attribution} url={tiles.url} />
      <AjustarMapa key={chavePontos} pontos={todosOsPontos} />

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
