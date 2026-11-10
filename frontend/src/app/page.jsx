'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DeliveryForm from './components/DeliveryForm';
import styles from './page.module.css';

const DeliveryMap = dynamic(() => import('./components/DeliveryMap'), {
  ssr: false,
  loading: () => <p style={{ textAlign: 'center', padding: '20px' }}>A carregar o mapa...</p>
});

export default function Home() {
  const [rotas, setRotas] = useState([]);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [erro, setErro] = useState(null);

  // Busca as rotas na API do backend assim que a página carrega
 // Busca as rotas na API do backend assim que a página carrega
useEffect(() => {
    fetch('http://localhost:8080/api/deliveries')
        .then((res) => {
            if (!res.ok) throw new Error('Erro ao carregar rotas da API');
            return res.json();
        })
        .then((data) => {
            // Garante que só guarda um array no estado (evita o erro do .map)
            setRotas(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
            console.error(err);
            setErro('Não foi possível conectar ao backend ou carregar as rotas.');
            setRotas([]); // Garante array vazio em caso de erro
        });
}, []);

  return (
    <div style={{ padding: '40px', width: '100%', minHeight: '100vh', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
      <h1 style={{ marginBottom: '5px' }}>LogiTrack - Gestão de Entregas</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Sistema unificado com formulário de geocodificação e visualização de rotas no mapa.
      </p>

      {erro && <p style={{ color: 'red', marginBottom: '20px' }}>{erro}</p>}

      {/* Secção superior: Formulário de nova entrega com geocodificação */}
      <div style={{ marginBottom: '40px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ marginBottom: '15px' }}>Registar Nova Entrega</h3>
        <DeliveryForm />
      </div>

      {/* Secção inferior: Listagem de rotas e Mapa interativo */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', width: '100%' }}>
        {/* Coluna da Esquerda: Lista dinâmica de Rotas */}
        <div style={{ width: '400px', flexShrink: 0 }}>
          <h3>Rotas em destaque</h3>
          {rotas.length === 0 && !erro && <p>A carregar rotas...</p>}

          {Array.isArray(rotas) && rotas.map((rota) => {
            const estaSelecionada = rotaSelecionada?.id === rota.id;
            return (
              <div
                key={rota.id}
                onClick={() => setRotaSelecionada(rota)}
                style={{
                  padding: '18px',
                  margin: '15px 0',
                  borderRadius: '8px',
                  background: estaSelecionada ? '#1e293b' : '#0f172a',
                  border: estaSelecionada ? '2px solid #f97316' : '1px solid #334155',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                <strong style={{ fontSize: '15px' }}>{rota.titulo}</strong>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '6px 0' }}>{rota.motorista}</p>
                <span style={{ fontSize: '12px', color: '#4ade80' }}>{rota.status}</span>
              </div>
            );
          })}
        </div>

        {/* Coluna da Direita: O Mapa atualizado com base na rota selecionada */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3>Mapa de rotas</h3>
          <div style={{ marginTop: '15px', width: '100%', height: '500px' }}>
            {rotaSelecionada ? (
              <DeliveryMap
                origin={[Number(rotaSelecionada.origem_lat), Number(rotaSelecionada.origem_lng)]}
                destination={[Number(rotaSelecionada.destino_lat), Number(rotaSelecionada.destino_lng)]}
              />
            ) : (
              <p>Selecione uma rota para ver o mapa.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}