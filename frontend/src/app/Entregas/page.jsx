'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL } from '../lib/api';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const COLUNAS = '1.2fr 3fr 1.6fr 1.4fr 1.2fr';

const OPCOES_STATUS = ['Todos os status', 'Entregue', 'Em trânsito', 'Pendente', 'Atrasada', 'Cancelado'];

// Cores de cada status exibido
const ESTILO_STATUS = {
  Entregue: { cor: '#4ADE80', fundo: 'rgba(74, 222, 128, 0.14)' },
  'Em trânsito': { cor: '#60A5FA', fundo: 'rgba(96, 165, 250, 0.16)' },
  Pendente: { cor: '#FBBF24', fundo: 'rgba(251, 191, 36, 0.16)' },
  Atrasada: { cor: '#F87171', fundo: 'rgba(248, 113, 113, 0.16)' },
  Cancelado: { cor: '#94A3B8', fundo: 'rgba(148, 163, 184, 0.16)' },
};

// Remove acentos e maiúsculas para a busca
function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatarPrevisao(valor) {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '—';

  const dia = String(data.getDate()).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');

  return `${dia} ${MESES[data.getMonth()]} · ${hora}:${minuto}`;
}

// Converte o status do banco no rótulo mostrado na tela.
// "Atrasada" é calculada: a previsão já passou e a entrega ainda está em aberto.
function rotuloStatus(entrega) {
  const emAberto = entrega.status === 'Pendente' || entrega.status === 'A Caminho';
  const prazo = new Date(entrega.previsao);

  if (emAberto && !Number.isNaN(prazo.getTime()) && prazo < new Date()) {
    return 'Atrasada';
  }

  if (entrega.status === 'A Caminho') {
    return 'Em trânsito';
  }

  return entrega.status;
}

export default function Entregas() {
  const [entregas, setEntregas] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos os status');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);

    try {
      const res = await fetch(`${API_URL}/deliveries`);
      if (!res.ok) throw new Error(`Erro ${res.status} ao carregar entregas`);

      const data = await res.json();
      // Garante que só guarda um array no estado
      setEntregas(Array.isArray(data) ? data : []);
      setErro(null);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível carregar as entregas. Verifique se o backend está no ar.');
      setEntregas([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const linhas = useMemo(
    () =>
      entregas.map((entrega) => ({
        id: entrega.id,
        codigo: entrega.titulo,
        destino: entrega.endereco_destino,
        motorista: entrega.motorista,
        cliente: entrega.cliente ?? '',
        previsao: formatarPrevisao(entrega.previsao),
        status: rotuloStatus(entrega),
      })),
    [entregas]
  );

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());

    return linhas.filter((linha) => {
      if (filtroStatus !== 'Todos os status' && linha.status !== filtroStatus) return false;
      if (!termo) return true;

      return [linha.codigo, linha.destino, linha.motorista, linha.cliente].some((campo) =>
        normalizar(campo).includes(termo)
      );
    });
  }, [linhas, busca, filtroStatus]);

  const total = filtradas.length;

  const estiloMensagem = {
    margin: 0,
    padding: '32px 28px',
    fontSize: '16px',
    color: '#8DA2BF',
    borderTop: '1px solid #16283D',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        padding: '48px 56px',
        background: 'linear-gradient(160deg, #0B1B2E 0%, #050D18 100%)',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#7C93B3',
          }}
        >
          Operações / Pedidos
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '16px',
            margin: '8px 0 32px',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '48px' }}>Entregas</h1>
            <p style={{ margin: '6px 0 0', fontSize: '18px', color: '#7C93B3' }}>
              Acompanhe os pedidos e seus status.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.18)',
                color: '#7DB4F5',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              {total} {total === 1 ? 'entrega' : 'entregas'}
            </span>
            <button
              type="button"
              onClick={carregar}
              disabled={carregando}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: '1px solid #1B3047',
                background: '#0C1A2B',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: carregando ? 'wait' : 'pointer',
              }}
            >
              {carregando ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Busca e filtro de status */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar código, destino ou motorista..."
            aria-label="Buscar código, destino ou motorista"
            style={{
              flex: '1 1 420px',
              height: '54px',
              boxSizing: 'border-box',
              padding: '0 18px',
              borderRadius: '12px',
              border: '1px solid #1B3047',
              background: '#0C1A2B',
              color: '#fff',
              fontSize: '16px',
            }}
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            aria-label="Filtrar por status"
            style={{
              height: '54px',
              minWidth: '220px',
              boxSizing: 'border-box',
              padding: '0 16px',
              borderRadius: '12px',
              border: '1px solid #1B3047',
              background: '#0C1A2B',
              color: '#fff',
              fontSize: '16px',
              colorScheme: 'dark',
            }}
          >
            {OPCOES_STATUS.map((opcao) => (
              <option key={opcao}>{opcao}</option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        <div
          style={{
            overflowX: 'auto',
            border: '1px solid #1B3047',
            borderRadius: '16px',
            background: '#0C1A2B',
          }}
        >
          <div style={{ minWidth: '1000px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: COLUNAS,
                gap: '24px',
                padding: '18px 28px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#7C93B3',
              }}
            >
              <span>Código</span>
              <span>Destino</span>
              <span>Motorista</span>
              <span>Previsão</span>
              <span>Status</span>
            </div>

            {carregando && linhas.length === 0 && <p style={estiloMensagem}>Carregando entregas...</p>}

            {!carregando && erro && <p style={{ ...estiloMensagem, color: '#F87171' }}>{erro}</p>}

            {!carregando && !erro && filtradas.length === 0 && (
              <p style={estiloMensagem}>Nenhuma entrega encontrada.</p>
            )}

            {filtradas.map((linha) => {
              const estilo = ESTILO_STATUS[linha.status] || ESTILO_STATUS.Cancelado;
              const semMotorista = linha.motorista === 'Sem motorista';

              return (
                <div
                  key={linha.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: COLUNAS,
                    gap: '24px',
                    alignItems: 'center',
                    padding: '22px 28px',
                    borderTop: '1px solid #16283D',
                    fontSize: '16px',
                  }}
                >
                  <strong>{linha.codigo}</strong>
                  <span style={{ overflowWrap: 'anywhere' }}>{linha.destino}</span>
                  <span style={{ color: semMotorista ? '#8DA2BF' : '#fff' }}>{linha.motorista}</span>
                  <span>{linha.previsao}</span>
                  <span>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: estilo.cor,
                        background: estilo.fundo,
                        border: `1px solid ${estilo.cor}40`,
                      }}
                    >
                      {linha.status}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}