'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import DeliveryForm from './components/DeliveryForm';
import { API_URL } from './lib/api';

const DeliveryMap = dynamic(() => import('./components/DeliveryMap'), {
  ssr: false,
  loading: () => (
    <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Carregando mapa...</p>
  ),
});

const COR_STATUS = {
  'A Caminho': '#f97316',
  Entregue: '#4ade80',
  Pendente: '#facc15',
  Cancelado: '#f87171',
};

function paraPonto(lat, lng) {
  if (lat == null || lng == null) return null;
  const a = Number(lat);
  const b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b) ? [a, b] : null;
}

function distanciaKm([aLat, aLng], [bLat, bLng]) {
  const rad = (g) => (g * Math.PI) / 180;
  const raioTerra = 6371;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * raioTerra * Math.asin(Math.sqrt(h));
}

export default function Home() {
  const [rotas, setRotas] = useState([]);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregarRotas = useCallback(async (selecionarId) => {
    try {
      const res = await fetch(`${API_URL}/deliveries`);
      if (!res.ok) throw new Error('Erro ao carregar rotas da API');

      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];

      setRotas(lista);
      setErro(null);

      if (selecionarId) {
        setRotaSelecionada(lista.find((rota) => rota.id === selecionarId) || null);
      }
    } catch (err) {
      console.error(err);
      setErro('Não foi possível conectar ao backend ou carregar as rotas.');
      setRotas([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarRotas();
  }, [carregarRotas]);

  const origem = useMemo(
    () => paraPonto(rotaSelecionada?.origem_lat, rotaSelecionada?.origem_lng),
    [rotaSelecionada]
  );
  const destino = useMemo(
    () => paraPonto(rotaSelecionada?.destino_lat, rotaSelecionada?.destino_lng),
    [rotaSelecionada]
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        padding: '40px',
        background: '#0b1220',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#94a3b8',
          }}
        >
          LogiTrack · Operações / Deslocamento
        </p>
        <h1 style={{ fontSize: '40px', margin: '6px 0 4px' }}>Rotas</h1>
     

        {erro && <p style={{ color: '#f87171', marginBottom: '20px' }}>{erro}</p>}

        <DeliveryForm onCreated={carregarRotas} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
          {/* Coluna esquerda: lista de rotas */}
          <div style={{ flex: '0 0 420px', maxWidth: '100%' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '20px' }}>Rotas em destaque</h3>
            

            {carregando && <p style={{ color: '#94a3b8' }}>Carregando rotas...</p>}

            {!carregando && !erro && rotas.length === 0 && (
              <p style={{ color: '#94a3b8' }}>Nenhuma entrega cadastrada ainda.</p>
            )}

            <div style={{ maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
              {Array.isArray(rotas) &&
                rotas.map((rota) => {
                  const estaSelecionada = rotaSelecionada?.id === rota.id;
                  const o = paraPonto(rota.origem_lat, rota.origem_lng);
                  const d = paraPonto(rota.destino_lat, rota.destino_lng);
                  const km = o && d ? Math.round(distanciaKm(o, d)) : null;

                  return (
                    <button
                      key={rota.id}
                      type="button"
                      onClick={() => setRotaSelecionada(rota)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        font: 'inherit',
                        padding: '16px',
                        margin: '0 0 12px',
                        borderRadius: '10px',
                        background: estaSelecionada ? '#1e293b' : '#0f172a',
                        border: estaSelecionada ? '2px solid #f97316' : '1px solid #334155',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: '0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <strong style={{ fontSize: '15px' }}>{rota.titulo}</strong>
                        <span style={{ fontSize: '12px', color: COR_STATUS[rota.status] || '#94a3b8' }}>
                          ● {rota.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '6px 0 0' }}>
                        {rota.cliente ? `${rota.cliente} · ` : ''}
                        {rota.motorista}
                        {km !== null ? ` · ~${km} km` : ''}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                        {rota.endereco_destino}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Coluna direita: mapa da rota selecionada */}
          <div style={{ flex: '1 1 360px', minWidth: 0 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '20px' }}>Mapa de rotas</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94a3b8' }}>
              Origem no centro de São Paulo até o destino da entrega
            </p>

            <div style={{ height: '560px', width: '100%' }}>
              {rotaSelecionada && origem && destino ? (
                <DeliveryMap
                  origin={origem}
                  destination={destino}
                  destinationLabel={rotaSelecionada.endereco_destino}
                />
              ) : (
                <p style={{ color: '#94a3b8' }}>Selecione uma rota para ver o mapa.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}