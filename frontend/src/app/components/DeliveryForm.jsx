'use client';
import { useState } from 'react';

export default function DeliveryForm() {
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientName, address }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro ao enviar entrega:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Nova Entrega</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Endereço</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? 'A processar e geocodificar...' : 'Registar Entrega'}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
          <p className="font-semibold">{result.message}</p>
          <p><strong>Latitude:</strong> {result.data?.latitude}</p>
          <p><strong>Longitude:</strong> {result.data?.longitude}</p>
        </div>
      )}
    </div>
  );
}