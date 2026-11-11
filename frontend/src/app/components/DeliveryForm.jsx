'use client';

import { useState } from 'react';
import { API_URL } from '../lib/api';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #334155',
  background: '#0b1220',
  color: '#fff',
  fontSize: '14px',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: '#94a3b8',
  marginBottom: '6px',
};

export default function DeliveryForm({ onCreated }) {
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, address }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(data.error || 'Não foi possível registrar a entrega.');
        return;
      }

      setResult(data);
      setClientName('');
      setAddress('');

      if (onCreated) {
        onCreated(data.data?.id);
      }
    } catch (error) {
      console.error('Erro ao enviar entrega:', error);
      setErrorMessage('Não foi possível conectar ao backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '32px',
      }}
    >
      <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>Registrar nova entrega</h3>
      <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94a3b8' }}>
        O endereço é convertido em latitude e longitude e a rota aparece no mapa.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}
      >
        <div style={{ flex: '1 1 220px' }}>
          <label htmlFor="clientName" style={labelStyle}>Nome do cliente</label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ex.: Mercado Boa Compra"
            style={inputStyle}
            required
          />
        </div>

        <div style={{ flex: '2 1 320px' }}>
          <label htmlFor="address" style={labelStyle}>Endereço de entrega</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex.: Avenida Paulista, 1578, São Paulo"
            style={inputStyle}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            flex: '0 0 auto',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: loading ? '#9a5a2b' : '#f97316',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Geocodificando...' : 'Registrar entrega'}
        </button>
      </form>

      {errorMessage && (
        <p style={{ margin: '14px 0 0', fontSize: '13px', color: '#f87171' }}>{errorMessage}</p>
      )}

      {result && (
        <div
          style={{
            marginTop: '14px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #166534',
            background: 'rgba(74, 222, 128, 0.08)',
            fontSize: '13px',
            color: '#4ade80',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>{result.message}</p>
          <p style={{ margin: '6px 0 0' }}>
            {result.data?.codigoRastreio} · Lat {Number(result.data?.latitude).toFixed(5)} · Lng{' '}
            {Number(result.data?.longitude).toFixed(5)}
          </p>
          {result.data?.enderecoEncontrado && (
            <p style={{ margin: '6px 0 0', color: '#94a3b8' }}>{result.data.enderecoEncontrado}</p>
          )}
        </div>
      )}
    </div>
  );
}