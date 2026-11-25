"use client";

import { useState } from "react";
import {
  AlertCircle,
  Box,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  PackageX,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import Header from "../components/Header-usuarios";
import "../Main-usuario/pagemain.css";
import "./acompanharEntrega.css";

const etapas = [
  { titulo: "Pedido\nSolicitado", data: "14/11 às 09:15", status: "concluida", icon: Check },
  { titulo: "Em Rota", data: "14/11 às 10:30", status: "concluida", icon: Check },
  { titulo: "Saiu para\nEntrega", data: "14/11 às 13:20", status: "atual", icon: Truck },
  { titulo: "Entregue", data: "Aguardando", status: "futura", icon: Check },
];

export default function AcompanharEntrega() {
  const [modalCancelamento, setModalCancelamento] = useState(false);
  const [cancelamentoConcluido, setCancelamentoConcluido] = useState(false);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);

  function confirmarCancelamento() {
    setModalCancelamento(false);
    setCancelamentoConcluido(true);
    setModalSucessoAberto(true);
  }

  return (
    <div className="dash-container tracking-page-shell">
      <Header />

      <main className="tracking-page-content">
        <section className="tracking-hero-banner">
          <div>
            <span>ACOMPANHAR ENTREGA</span>
            <h1>Acompanhe sua entrega <em>em tempo real</em></h1>
            <p>Confira o status da sua entrega e saiba exatamente onde ela está.</p>
            <i />
          </div>
        </section>

        <section className="tracking-overview">
          <article className="tracking-current-card">
            <div className="tracking-current-heading">
              <div className="tracking-section-icon"><Package size={20} /></div>
              <div><h2>Sua entrega</h2><p>Acompanhamento atualizado</p></div>
            </div>
            <div className="tracking-current-order">
              <div className="tracking-package-icon"><Box size={23} /></div>
              <div><strong>Entrega em andamento</strong><span>Mercado Souza · 1 pacote</span></div>
              <span className="tracking-live-dot" aria-label="Em andamento" />
            </div>
            <div className="tracking-current-address"><MapPin size={17} /><span>Rua das Flores, 123<br />São Caetano do Sul, SP</span></div>
          </article>

          <article className="tracking-progress-card">
            <div className="tracking-timeline" aria-label="Etapas da entrega">
              {etapas.map(({ titulo, data, status, icon: Icon }, index) => (
                <div className="tracking-step-wrap" key={titulo}>
                  <div className={`tracking-step ${status}`}><Icon size={index === 2 ? 20 : 18} /></div>
                  {index < etapas.length - 1 && <div className={`tracking-step-line ${index < 2 ? "done" : ""}`} />}
                  <strong>{titulo.split("\n").map((line) => <span key={line}>{line}</span>)}</strong>
                  <small>{data}</small>
                </div>
              ))}
            </div>

            <div className="tracking-vehicle-status">
              <div className="tracking-vehicle-icon"><Truck size={34} /></div>
              <div><strong>Seu veículo está a caminho!</strong><span>Previsão de chegada: <b>14/11 às 14:30</b></span></div>
            </div>
          </article>
        </section>

        <section className="tracking-bottom-grid">
          <article className="tracking-details-card">
            <h2><span><CheckCircle2 size={17} /></span> Detalhes da Entrega</h2>
            <div className="tracking-detail-columns">
              <div className="tracking-detail-item"><small><Package size={13} /> Pedido</small><strong>Em andamento</strong></div>
              <div className="tracking-detail-item"><small><UserRound size={13} /> Cliente</small><strong>Mercado Souza</strong></div>
              <div className="tracking-detail-item"><small><MapPin size={13} /> Endereço</small><strong>Rua das Flores, 123<br />São Caetano do Sul, SP</strong></div>
              <div className="tracking-detail-item"><small><Box size={13} /> Volumes</small><strong>1 pacote</strong></div>
            </div>
          </article>

          <article className="tracking-arrival-card">
            <div className="tracking-arrival-copy">
              <h2><Clock3 size={18} /> Previsão de Chegada</h2>
              <strong>14:30</strong>
              <span>Hoje, 14 de Novembro</span>
            </div>
            <div className="tracking-arrival-illustration" aria-hidden="true"><Truck size={65} /></div>
          </article>
        </section>
      </main>
    </div>
  );
}
