'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ROUTE = [
  [-23.6274, -46.5795],
  [-23.6234, -46.5751],
  [-23.6202, -46.5701],
  [-23.6227, -46.5651],
  [-23.6174, -46.5605],
];
const CENTER = [-23.622, -46.570];
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

function AjustarMapa() {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(ROUTE, { padding: [50, 50] });
    const focus = () => map.fitBounds(ROUTE, { padding: [50, 50] });
    window.addEventListener('tracking-map-focus', focus);
    return () => window.removeEventListener('tracking-map-focus', focus);
  }, [map]);

  return null;
}

export default function TrackingMap({ layer }) {
  const tiles = TILES[layer] || TILES.mapa;

  return (
    <MapContainer center={CENTER} zoom={14} zoomControl className="tracking-leaflet-map">
      <TileLayer key={layer} attribution={tiles.attribution} url={tiles.url} />
      <AjustarMapa />

      <Polyline positions={ROUTE} pathOptions={{ color: '#ff710f', weight: 4, opacity: .98 }} />

      <Marker position={ROUTE[0]} icon={icons.origin}><Popup>Sua localização</Popup></Marker>
      <Marker position={ROUTE[1]} icon={icons.package}><Popup>Entrega em andamento</Popup></Marker>
      <Marker position={ROUTE[2]} icon={icons.done}><Popup>Entrega concluída</Popup></Marker>
      <Marker position={ROUTE[3]} icon={icons.package}><Popup>Entrega em andamento</Popup></Marker>
      <Marker position={ROUTE[4]} icon={icons.pending}><Popup>Rua das Flores, 123 · Entrega pendente</Popup></Marker>
    </MapContainer>
  );
}
