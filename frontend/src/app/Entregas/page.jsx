"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Aside from "../components/aside";
import Header from "../components/header";
import "../Dash/pageDash.css";
import "./pageEntregas.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const formatarPrevisao = (valor) =>
  new Date(valor).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function Entregas() {
  const [deliveries, setDeliveries] = useState([]);
  const [erro, setErro] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos os status");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${apiUrl}/entregas`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        setDeliveries(await res.json());
      })
      .catch(() => setErro("Não foi possível carregar as entregas."));
  }, []);

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
            <span className="result-count">{filteredDeliveries.length} entregas na amostra</span>
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
                    <td>{formatarPrevisao(delivery.eta)}</td>
                    <td><span className={`status-badge ${delivery.status.toLowerCase().replace(" ", "-")}`}>{delivery.status}</span></td>
                  </tr>
                ))}
                {filteredDeliveries.length === 0 && <tr><td className="empty-state" colSpan="5">{erro || "Nenhuma entrega encontrada."}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
