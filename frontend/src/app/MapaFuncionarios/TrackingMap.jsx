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

function coordenadasValidas(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    ? [latitude, longitude]
    : null;
}

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
};

const ICONE_POR_STATUS = { 'A Caminho': icons.package, Pendente: icons.pending };
const LEGENDA_POR_STATUS = { 'A Caminho': 'Entrega em andamento', Pendente: 'Entrega pendente' };

function AjustarMapa({ origem, selecionada, rota, chaveSelecao }) {
  const map = useMap();

  useEffect(() => {
    if (!selecionada) {
      if (origem) map.setView(origem, 13);
      return;
    }
    if (!origem) {
      map.setView(selecionada.coordenada ?? origem ?? CENTRO_PADRAO, 15);
      return;
    }
    const pontos = rota?.chave === chaveSelecao && rota.pontos.length > 1
      ? rota.pontos
      : [origem, selecionada.coordenada];
    map.fitBounds(pontos, { padding: [50, 50], maxZoom: 15 });
  }, [map, origem, selecionada, rota, chaveSelecao]);

  useEffect(() => {
    const reenquadrar = () => {
      if (!selecionada) return;
      if (!origem) {
        map.setView(selecionada.coordenada ?? origem ?? CENTRO_PADRAO, 15);
        return;
      }
      const pontos = rota?.chave === chaveSelecao && rota.pontos.length > 1
        ? rota.pontos
        : [origem, selecionada.coordenada];
      map.fitBounds(pontos, { padding: [50, 50], maxZoom: 15 });
    };
    window.addEventListener('tracking-map-focus', reenquadrar);
    return () => window.removeEventListener('tracking-map-focus', reenquadrar);
  }, [map, origem, selecionada, rota, chaveSelecao]);

  return null;
}

export default function TrackingMap({ layer, origem, entrega }) {
  const [rota, setRota] = useState(null);
  const tiles = TILES[layer] || TILES.mapa;
  const posicaoOrigem = useMemo(() => origem ? coordenadasValidas(origem.lat, origem.lng) : null, [origem?.lat, origem?.lng]);
  const selecao = useMemo(() => {
    if (!entrega) return null;
    const coordenada = coordenadasValidas(entrega.lat, entrega.lng);
    return coordenada
      ? { id: entrega.id, status: entrega.status, coordenada }
      : null;
  }, [entrega?.id, entrega?.status, entrega?.lat, entrega?.lng]);
  const chaveSelecao = selecao ? JSON.stringify([selecao.id, selecao.status, selecao.coordenada]) : '';

  useEffect(() => {
    if (!posicaoOrigem || !selecao) {
      setRota(null);
      return undefined;
    }

    const controller = new AbortController();
    const pontosRetos = [posicaoOrigem, selecao.coordenada];
    let finalizada = false;
    const usarLinhaReta = () => {
      if (finalizada) return;
      finalizada = true;
      setRota({ chave: chaveSelecao, pontos: pontosRetos, contingencia: true });
    };
    const timeout = window.setTimeout(() => {
      controller.abort();
      usarLinhaReta();
    }, 8000);
    const coordenadas = pontosRetos.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordenadas}?overview=full&geometries=geojson`;

    setRota(null);
    fetch(url, { signal: controller.signal })
      .then((resposta) => (resposta.ok ? resposta.json() : Promise.reject(new Error(`OSRM ${resposta.status}`))))
      .then((dados) => {
        const coordenadasRota = dados?.routes?.[0]?.geometry?.coordinates;
        if (!Array.isArray(coordenadasRota) || coordenadasRota.length < 2) throw new Error('Rota indisponível');
        const pontosRota = coordenadasRota.map(([lng, lat]) => coordenadasValidas(lat, lng));
        if (pontosRota.some((ponto) => !ponto)) throw new Error('Coordenadas da rota inválidas');
        if (!finalizada) {
          finalizada = true;
          window.clearTimeout(timeout);
          setRota({ chave: chaveSelecao, pontos: pontosRota, contingencia: false });
        }
      })
      .catch((falha) => {
        if (falha.name !== 'AbortError') console.warn('Rota viária indisponível; usando linha reta.', falha.message);
        usarLinhaReta();
      });

    return () => {
      finalizada = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [posicaoOrigem, selecao, chaveSelecao]);

  const rotaAtual = rota?.chave === chaveSelecao ? rota : null;

  return (
    <MapContainer center={posicaoOrigem ?? CENTRO_PADRAO} zoom={13} zoomControl className="tracking-leaflet-map">
      <TileLayer key={layer} attribution={tiles.attribution} url={tiles.url} />
      <AjustarMapa origem={posicaoOrigem} selecionada={selecao} rota={rotaAtual} chaveSelecao={chaveSelecao} />

      {rotaAtual?.pontos.length > 1 && (
        <Polyline
          positions={rotaAtual.pontos}
          pathOptions={{ color: '#ff710f', weight: 4, opacity: 0.98, dashArray: rotaAtual.contingencia ? '8 8' : undefined }}
        />
      )}

      {posicaoOrigem && (
        <Marker position={posicaoOrigem} icon={icons.origin}><Popup>Sua localização</Popup></Marker>
      )}
      {selecao && entrega && (
        <Marker
          position={selecao.coordenada}
          icon={ICONE_POR_STATUS[entrega.status] ?? icons.pending}
          zIndexOffset={1000}
        >
          <Popup>{entrega.codigo} · {LEGENDA_POR_STATUS[entrega.status]}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
