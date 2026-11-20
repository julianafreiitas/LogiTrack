"use client";

import { useState } from "react";
import { Check, Clock3, Map as MapIcon, MapPin, Navigation, Package, RotateCcw, Satellite, UserRound } from "lucide-react";
import dynamic from "next/dynamic";
import Aside from "../components/aside";
import DeliveryBanner from "../components/DeliveryBanner";
import "../Dash/pageDash.css";
import "./mapa.css";

const TrackingMap = dynamic(() => import("./TrackingMap"), {
  ssr: false,
  loading: () => <div className="tracking-map-loading">Carregando mapa...</div>,
});

export default function MapaFuncionarios() {
  const [camada, setCamada] = useState("mapa");
  const [confirmada, setConfirmada] = useState(false);

  return (
    <div className="dash-container container_mapa">
      <Aside variant="employee" />
      <main className="delivery-map-page">
      <header className="map-topbar">
        <div className="map-topbar-actions">
          <div className="map-user-profile">
            <div className="map-user-avatar">JD</div>
            <div className="map-profile-name"><strong>João Silva</strong></div>
          </div>
        </div>
      </header>

      <DeliveryBanner
        title="Mapa de Entregas"
        subtitle="Visualize suas entregas e acompanhe sua rota em tempo real."
        icon={MapPin}
      />

      <section className="delivery-map-layout" aria-label="Acompanhamento de entrega">
        <div className="delivery-map-canvas">
          <div className="map-layer-switch" role="group" aria-label="Camada do mapa">
            <button className={camada === "mapa" ? "active" : ""} onClick={() => setCamada("mapa")}>
              <MapIcon size={15} /> Mapa
            </button>
            <button className={camada === "satelite" ? "active" : ""} onClick={() => setCamada("satelite")}>
              <Satellite size={15} /> Satélite
            </button>
          </div>
          <div className="map-compass" aria-label="Norte">N<span>▲</span></div>
          <TrackingMap layer={camada} />
          <div className="map-legend">
            <span><i className="legend-location"><Navigation size={11} fill="currentColor" /></i>Sua localização</span>
            <span><i className="legend-progress"><Package size={11} /></i>Entrega em andamento</span>
            <span><i className="legend-pending"><MapPin size={11} fill="currentColor" /></i>Entrega pendente</span>
            <span><i className="legend-done"><Check size={11} /></i>Entrega concluída</span>
          </div>
        </div>

        <aside className="delivery-detail-card" aria-label="Detalhes da entrega">
          <div className="delivery-card-heading">
            <div className={`delivery-status-pill ${confirmada ? "is-done" : ""}`}>
              <Package size={18} /> {confirmada ? "Entrega Concluída" : "Entrega em Andamento"}
            </div>
            <h2>#LT78452</h2>
          </div>

          <div className="delivery-card-information">
            <p className="delivery-section-label">Informações da entrega</p>
            <div className="delivery-detail-row">
              <MapPin size={21} fill="currentColor" />
              <p><strong>Rua das Flores, 123</strong><span>São Caetano do Sul, SP</span></p>
            </div>
            <div className="delivery-detail-row">
              <UserRound size={21} />
              <p><span>Cliente</span><strong>Mercado Souza</strong></p>
            </div>
            <div className="delivery-detail-row">
              <Package size={21} />
              <p><span>Volumes</span><strong>1 pacote</strong></p>
            </div>
          </div>

          <div className="delivery-eta-section">
            <p className="delivery-section-label">Previsão de entrega</p>
            <div className="delivery-eta">
              <Clock3 size={25} />
              <p><strong>14:30</strong></p>
            </div>
          </div>

          <div className="delivery-detail-actions">
            <button type="button" className="detail-route-button" onClick={() => window.dispatchEvent(new Event("tracking-map-focus"))}>
              <Navigation size={14} fill="currentColor" /> Ver rota
            </button>
            {confirmada ? (
              <button type="button" className="detail-cancel-button" onClick={() => setConfirmada(false)}>
                <RotateCcw size={15} /> Cancelar entrega
              </button>
            ) : (
              <button type="button" className="detail-confirm-button" onClick={() => setConfirmada(true)}>
                <Check size={15} /> Confirmar entrega
              </button>
            )}
          </div>
        </aside>
      </section>
      </main>
    </div>
  );
}
