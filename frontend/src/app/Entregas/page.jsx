"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Aside from "../components/aside";
import Header from "../components/header";
import { API_URL } from "../lib/api";
import "../Dash/pageDash.css";
import "./pageEntregas.css";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// Converte "2026-11-13T10:30:00" em "13 nov · 10:30" sem mexer em fuso horário
function formatarPrevisao(valor) {
  if (!valor) return "—";
  const [data, hora = "00:00"] = String(valor).split("T");
  const [, mes, dia] = data.split("-");
  const nomeMes = MESES[Number(mes) - 1];
  if (!nomeMes || !dia) return String(valor);
  return `${Number(dia)} ${nomeMes} · ${hora.slice(0, 5)}`;
}

// Traduz o status do banco para o texto da interface
function traduzirStatus(entrega) {
  const statusBanco = entrega.status;

  if (statusBanco === "Entregue") return "Entregue";
  if (statusBanco === "Cancelado") return "Cancelado";

  const previsao = entrega.previsao ? new Date(entrega.previsao) : null;
  const atrasada = previsao && !Number.isNaN(previsao.getTime()) && previsao < new Date();
  if (atrasada) return "Atrasada";

  if (statusBanco === "A Caminho") return "Em trânsito";
  return "Pendente";
}

const estiloCancelado = {
  background: "rgba(148, 163, 184, 0.15)",
  color: "#94a3b8",
};

export default function Entregas() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos os status");
  const [deliveries, setDeliveries] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch(`${API_URL}/deliveries`);
      if (!res.ok) throw new Error(`Erro ${res.status} ao carregar entregas`);
      const dados = await res.json();

      const lista = (Array.isArray(dados) ? dados : []).map((item) => ({
        code: item.titulo,
        destination: item.endereco_destino,
        driver: item.motorista,
        eta: formatarPrevisao(item.previsao),
        status: traduzirStatus(item),
      }));

      setDeliveries(lista);
      setErro(null);
    } catch (e) {
      setErro(e.message || "Não foi possível carregar as entregas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filteredDeliveries = useMemo(() => deliveries.filter((delivery) => {
    const matchesStatus = status === "Todos os status" || delivery.status === status;
    const searchable = `${delivery.code} ${delivery.destination} ${delivery.driver}`.toLocaleLowerCase("pt-BR");
    return matchesStatus && searchable.includes(query.trim().toLocaleLowerCase("pt-BR"));
  }), [deliveries, query, status]);

  return (
    <div className="dash-container">
      <Aside />
      <main className="dash">
       <Header/>

        <section className="delivery-content" aria-label="Pedidos e entregas">
          <div className="delivery-title-row">
            <div>
              <p className="eyebrow">OPERAÇÕES / PEDIDOS</p>
              <h1>Entregas</h1>
              <p className="subtitle">Acompanhe os pedidos e seus status.</p>
            </div>
            <span className="result-count">{filteredDeliveries.length} entregas</span>
          </div>

          <div className="delivery-filters">
            <label className="delivery-search">
              <Search size={14} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Buscar código, destino ou motorista..." aria-label="Buscar código, destino ou motorista" />
            </label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por status">
              {["Todos os status", "Entregue", "Em trânsito", "Pendente", "Atrasada", "Cancelado"].map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>

          <div className="delivery-table-wrap">
            <table className="delivery-table">
              <thead><tr><th>Código</th><th>Destino</th><th>Motorista</th><th>Previsão</th><th>Status</th></tr></thead>
              <tbody>
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery.code}>
                    <td className="delivery-code">{delivery.code}</td>
                    <td>{delivery.destination}</td>
                    <td>{delivery.driver}</td>
                    <td>{delivery.eta}</td>
                    <td>
                      <span
                        className={`status-badge ${delivery.status.toLowerCase().replace(" ", "-")}`}
                        style={delivery.status === "Cancelado" ? estiloCancelado : undefined}
                      >
                        {delivery.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {carregando && <tr><td className="empty-state" colSpan="5">Carregando entregas...</td></tr>}
                {!carregando && erro && <tr><td className="empty-state" colSpan="5">{erro}</td></tr>}
                {!carregando && !erro && filteredDeliveries.length === 0 && <tr><td className="empty-state" colSpan="5">Nenhuma entrega encontrada.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}