'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Ajuste para corrigir o ícone padrão do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function DeliveryMap({ origin, destination }) {
    // Coordenadas padrão se nada for passado (ex: São Paulo)
    const center = origin || [-23.550520, -46.633308];

    return (
        <MapContainer 
            center={center} 
            zoom={14} 
            style={{ height: '400px', width: '100%', borderRadius: '8px' }}
        >
            {/* Mapa gratuito do OpenStreetMap */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Marcador da Origem (Ex: Loja/Restaurante) */}
            {origin && (
                <Marker position={origin}>
                    <Popup>
                        <strong>Ponto de Retirada</strong>
                    </Popup>
                </Marker>
            )}

            {/* Marcador do Destino (Ex: Cliente) */}
            {destination && (
                <Marker position={destination}>
                    <Popup>
                        <strong>Ponto de Entrega</strong>
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}