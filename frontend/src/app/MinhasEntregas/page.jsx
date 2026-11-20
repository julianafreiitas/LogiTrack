"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Package,
  Search,
  Send,
  Truck,
} from "lucide-react";
import Aside from "../components/aside";
import DeliveryBanner from "../components/DeliveryBanner";
import "../Dash/pageDash.css";
import "../Funcionarios/pageFuncionarios.css";

const ENTREGAS_INICIAIS = [
  { codigo: "#LT78452", cliente: "Mercado Souza", endereco: "Rua das Flores, 123 – São Caetano do Sul, SP", previsao: "14:30", volumes: 2, status: "andamento" },
  { codigo: "#LT78453", cliente: "Tech Solutions", endereco: "Av. Goiás, 456 – Santo André, SP", previsao: "15:15", volumes: 1, status: "andamento" },
  { codigo: "#LT78454", cliente: "Bella Moda", endereco: "Av. Presidente Kennedy, 789 – São Caetano do Sul, SP", previsao: "16:00", volumes: 2, status: "pendente" },
  { codigo: "#LT78449", cliente: "Farmácia Alfa", endereco: "Rua Manuel Coelho, 654 – Santo André, SP", previsao: "13:40", volumes: 1, status: "concluida" },
  { codigo: "#LT78445", cliente: "Casa & Cia", endereco: "Rua XV de Novembro, 321 – São Caetano do Sul, SP", previsao: "12:20", volumes: 3, status: "concluida" },
  { codigo: "#LT78440", cliente: "Papelaria Horizonte", endereco: "Rua das Palmeiras, 51 – Santo André, SP", previsao: "11:10", volumes: 1, status: "concluida" },
];

const ABAS = [
  { id: "andamento", label: "Em Andamento", icon: Truck },
  { id: "pendente", label: "Pendentes", icon: Clock3 },
  { id: "concluida", label: "Concluídas", icon: Check },
];

function nomeStatus(status) {
  return status === "andamento" ? "Em andamento" : status === "concluida" ? "Concluída" : "Pendente";
}

export default function Funcionarios() {
  const [entregas, setEntregas] = useState(ENTREGAS_INICIAIS);
  const [aba, setAba] = useState("andamento");
  const [busca, setBusca] = useState("");
  const [selecionadaId, setSelecionadaId] = useState(ENTREGAS_INICIAIS[0].codigo);

  const daAba = useMemo(() => {
    const query = busca.trim().toLocaleLowerCase("pt-BR");
    return entregas.filter((entrega) => {
      const correspondeAba = entrega.status === aba;
      const correspondeBusca = `${entrega.codigo} ${entrega.cliente} ${entrega.endereco}`
        .toLocaleLowerCase("pt-BR")
        .includes(query);
      return correspondeAba && correspondeBusca;
    });
  }, [entregas, aba, busca]);

  const selecionada = daAba.find((entrega) => entrega.codigo === selecionadaId) || daAba[0] || null;
  const contagens = useMemo(() => ({
    andamento: entregas.filter((item) => item.status === "andamento").length,
    pendente: entregas.filter((item) => item.status === "pendente").length,
    concluida: entregas.filter((item) => item.status === "concluida").length,
  }), [entregas]);

  function iniciarEntrega(entrega) {
    setEntregas((atuais) => atuais.map((item) => item.codigo === entrega.codigo ? { ...item, status: "andamento" } : item));
    setAba("andamento");
    setSelecionadaId(entrega.codigo);
  }

  return (
    <div className="ft-page">
      <Aside variant="employee" />
      <main className="ft-main">
        <header className="ft-topbar">
          <label className="ft-search">
            <Search size={20} />
            <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar entrega..." aria-label="Buscar entrega" />
          </label>
          <div className="ft-profile" aria-label="Perfil de João Silva">
            <span className="ft-profile-avatar">JD</span>
            <span className="ft-profile-name">João Silva</span>
          </div>
        </header>

        <DeliveryBanner title="Minhas Entregas" subtitle="Acompanhe suas entregas e gerencie seu dia." />

        <section className="md-stats" aria-label="Resumo das entregas">
          <article className="md-stat-card">
            <span className="md-stat-icon today"><Package size={34} /></span>
            <div><p>Entregas Hoje</p><strong>5</strong></div>
          </article>
          <article className="md-stat-card">
            <span className="md-stat-icon completed"><Check size={36} /></span>
            <div><p>Entregas Concluídas</p><strong>3</strong></div>
          </article>
          <article className="md-stat-card">
            <span className="md-stat-icon pending"><Clock3 size={34} /></span>
            <div><p>Entregas Pendentes</p><strong>2</strong></div>
          </article>
        </section>

        <section className="md-deliveries-layout" aria-label="Lista de entregas e detalhes">
          <div className="md-list-panel">
            <div className="md-tabs" role="tablist" aria-label="Filtrar entregas por status">
              {ABAS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={aba === id}
                  className={aba === id ? "active" : ""}
                  onClick={() => {
                    setAba(id);
                    const first = entregas.find((item) => item.status === id);
                    if (first) setSelecionadaId(first.codigo);
                  }}
                >
                  <Icon size={18} /> {label} ({contagens[id]})
                </button>
              ))}
            </div>

            <div className="md-delivery-list">
              {daAba.map((entrega) => (
                <article key={entrega.codigo} className={`md-delivery-item ${selecionada?.codigo === entrega.codigo ? "selected" : ""} ${entrega.status}`}>
                  <button className="md-delivery-summary" type="button" onClick={() => setSelecionadaId(entrega.codigo)}>
                    <span className="md-item-status"><Clock3 size={14} /> {nomeStatus(entrega.status)}</span>
                    <strong className="md-item-code">{entrega.codigo}</strong>
                    <span className="md-item-address"><MapPin size={16} />{entrega.endereco}</span>
                    <span className="md-item-client"><Package size={15} />Cliente: {entrega.cliente}</span>
                  </button>
                  <div className="md-item-eta">
                    <span><Clock3 size={15} />Previsão de entrega</span>
                    <strong><Clock3 size={20} />{entrega.previsao}</strong>
                    {entrega.status === "pendente" ? (
                      <button type="button" className="md-start-button" onClick={() => iniciarEntrega(entrega)}>
                        <Truck size={15} /> Iniciar entrega
                      </button>
                    ) : entrega.status === "andamento" ? (
                      <Link className="md-route-button" href="/MapaFuncionarios">
                        <NavigationIcon /> Ver rota
                      </Link>
                    ) : (
                      <span className="md-complete-label"><Check size={15} /> Concluída</span>
                    )}
                  </div>
                </article>
              ))}
              {daAba.length === 0 && <p className="md-empty">Nenhuma entrega encontrada nesta categoria.</p>}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}

function NavigationIcon() {
  return <Send size={15} />;
}
