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
              <div><strong>{cancelamentoConcluido ? "Pedido cancelado" : "Entrega em andamento"}</strong><span>Mercado Souza · 1 pacote</span></div>
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
              <div className="tracking-detail-item"><small><Package size={13} /> Pedido</small><strong>{cancelamentoConcluido ? "Cancelado" : "Em andamento"}</strong></div>
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

        {!cancelamentoConcluido && (
          <div className="tracking-cancel-action">
            <button type="button" onClick={() => setModalCancelamento(true)}>Cancelar entrega</button>
          </div>
        )}
      </main>

      {modalCancelamento && (
        <div className="tracking-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalCancelamento(false); }}>
          <section className="tracking-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="tracking-cancel-title">
            <button className="tracking-modal-close" type="button" aria-label="Fechar" onClick={() => setModalCancelamento(false)}><X size={20} /></button>
            <div className="tracking-modal-icon warning"><PackageX size={30} /></div>
            <h2 id="tracking-cancel-title">Cancelar entrega?</h2>
            <p className="tracking-modal-subtitle">Tem certeza de que deseja cancelar este pedido?</p>

            <div className="tracking-cancel-info">
              <div className="tracking-cancel-info-row"><span>Pedido</span><strong>#10245</strong></div>
              <div className="tracking-cancel-info-row"><span>Status</span><strong className="tracking-cancel-status">Em andamento</strong></div>
              <div className="tracking-cancel-warning">
                <strong><AlertCircle size={15} /> Atenção</strong>
                <p>Seu pacote já está com o motorista. Será necessário realizar a devolução ao endereço de origem.</p>
              </div>
            </div>

            <div className="tracking-modal-actions">
              <button className="tracking-confirm-cancel" type="button" onClick={confirmarCancelamento}>Confirmar cancelamento</button>
              <button className="tracking-keep-delivery" type="button" onClick={() => setModalCancelamento(false)}>Continuar com a entrega</button>
            </div>
            <p className="tracking-cancel-note">A devolução poderá gerar uma cobrança adicional, conforme as regras do serviço.</p>
          </section>
        </div>
      )}

      {modalSucessoAberto && (
        <div className="tracking-modal-overlay">
          <section className="tracking-cancel-modal tracking-success-modal" role="dialog" aria-modal="true" aria-labelledby="tracking-success-title">
            <div className="tracking-modal-icon success"><CheckCircle2 size={30} /></div>
            <h2 id="tracking-success-title">Pedido cancelado!</h2>
            <p className="tracking-modal-subtitle">O cancelamento foi realizado com sucesso.</p>
            <div className="tracking-return-info">
              <strong><Truck size={19} /> Devolução em andamento</strong>
              <p>O motorista está retornando com seu pacote para o endereço de origem.</p>
            </div>
            <p className="tracking-return-notice">Você será avisado quando o pacote for devolvido.</p>
            <button className="tracking-keep-delivery" type="button" onClick={() => setModalSucessoAberto(false)}>Entendi</button>
          </section>
        </div>
      )}
    </div>
  );
}
