
"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Aside from "../components/aside";
import Header from "../components/header";
import "../Dash/pageDash.css";
import "./pageEntregas.css";

const deliveries = [
  { code: "LT-2048", destination: "São Paulo, SP", driver: "João Pereira", eta: "30 out · 10:30", status: "Entregue" },
  { code: "LT-2049", destination: "Campinas, SP", driver: "Ana Costa", eta: "30 out · 15:00", status: "Em trânsito" },
  { code: "LT-2050", destination: "Santos, SP", driver: "Pedro Alves", eta: "31 out · 11:00", status: "Pendente" },
  { code: "LT-2051", destination: "São Bernardo, SP", driver: "Marina Lima", eta: "30 out · 09:00", status: "Entregue" },
  { code: "LT-2052", destination: "Sorocaba, SP", driver: "Diego Ramos", eta: "29 out · 17:00", status: "Atrasada" },
  { code: "LT-2053", destination: "Jundiaí, SP", driver: "Carla Nunes", eta: "30 out · 18:00", status: "Em trânsito" },
];

export default function Entregas() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos os status");

  const filteredDeliveries = useMemo(() => deliveries.filter((delivery) => {
    const matchesStatus = status === "Todos os status" || delivery.status === status;
    const searchable = `${delivery.code} ${delivery.destination} ${delivery.driver}`.toLocaleLowerCase("pt-BR");
    return matchesStatus && searchable.includes(query.trim().toLocaleLowerCase("pt-BR"));
  }), [query, status]);

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
            <span className="result-count">{filteredDeliveries.length} entregas na amostra</span>
          </div>

          <div className="delivery-filters">
            <label className="delivery-search">
              <Search size={14} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Buscar código, destino ou motorista..." aria-label="Buscar código, destino ou motorista" />
            </label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por status">
              {["Todos os status", "Entregue", "Em trânsito", "Pendente", "Atrasada"].map((option) => <option key={option}>{option}</option>)}
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
                    <td><span className={`status-badge ${delivery.status.toLowerCase().replace(" ", "-")}`}>{delivery.status}</span></td>
                  </tr>
                ))}
                {filteredDeliveries.length === 0 && <tr><td className="empty-state" colSpan="5">Nenhuma entrega encontrada.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
