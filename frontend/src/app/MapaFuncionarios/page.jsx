"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, Map as MapIcon, MapPin, Navigation, Package, RotateCcw, Satellite, UserRound } from "lucide-react";
import dynamic from "next/dynamic";
import Aside from "../components/aside";
import DeliveryBanner from "../components/DeliveryBanner";
import SeletorIdentificacao from "../components/SeletorIdentificacao";
import { chamarApi, useIdentificacao } from "../lib/identificacao";
import "../Dash/pageDash.css";
import "./mapa.css";

const TrackingMap = dynamic(() => import("./TrackingMap"), {
  ssr: false,
  loading: () => <div className="tracking-map-loading">Carregando mapa...</div>,
});

const ROTULO_STATUS = { "A Caminho": "Entrega em Andamento", Pendente: "Entrega Pendente", Entregue: "Entrega Concluída" };

export default function MapaFuncionarios() {
  const motorista = useIdentificacao("motorista");
  const [camada, setCamada] = useState("mapa");
  const [dados, setDados] = useState({ origem: null, entregas: [] });
  const [selecionadaId, setSelecionadaId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async (idMotorista, codigoPreferido) => {
    try {
      const resposta = await chamarApi(`/portal/motorista/${idMotorista}/mapa`);
      setDados(resposta);
      setErro("");
      setSelecionadaId((atual) => {
        if (codigoPreferido) {
          const pedida = resposta.entregas.find((entrega) => entrega.codigo === codigoPreferido);
          if (pedida) return pedida.id;
        }
        if (resposta.entregas.some((entrega) => entrega.id === atual)) return atual;
        const primeira = resposta.entregas.find((entrega) => entrega.status === "A Caminho")
          ?? resposta.entregas.find((entrega) => entrega.status === "Pendente")
          ?? resposta.entregas[0];
        return primeira ? primeira.id : null;
      });
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!motorista.id) return;
    // "Ver rota" na tela Minhas Entregas manda ?codigo=... para abrir já nessa entrega
    const codigo = new URLSearchParams(window.location.search).get("codigo");
    setCarregando(true);
    carregar(motorista.id, codigo);
  }, [motorista.id, carregar]);

  const selecionada = dados.entregas.find((entrega) => entrega.id === selecionadaId) ?? null;

  async function mudarStatus(novoStatus) {
    if (!selecionada) return;
    setSalvando(true);
    try {
      await chamarApi(`/portal/motorista/${motorista.id}/entregas/${encodeURIComponent(selecionada.codigo)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: novoStatus }),
      });
      await carregar(motorista.id, selecionada.codigo);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  const nome = motorista.atual?.nome ?? "Motorista";

  return (
    <div className="dash-container container_mapa">
      <Aside variant="employee" />
      <main className="delivery-map-page">
      <header className="map-topbar">
        <div className="map-topbar-actions">
          <SeletorIdentificacao rotulo="Testando como" lista={motorista.lista} id={motorista.id} onChange={(novo) => { motorista.escolher(novo); setSelecionadaId(null); }} />
          <div className="map-user-profile">
            <div className="map-user-avatar">{motorista.atual?.iniciais ?? "--"}</div>
            <div className="map-profile-name"><strong>{nome}</strong></div>
          </div>
        </div>
      </header>

      <DeliveryBanner
        title="Mapa de Entregas"
        subtitle="Visualize suas entregas e acompanhe sua rota em tempo real."
        icon={MapPin}
      />
      {(erro || motorista.erro) && <p className="aviso-erro" role="alert">{erro || motorista.erro}</p>}

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
          {dados.origem && (
            <TrackingMap
              layer={camada}
              origem={dados.origem}
              entregas={dados.entregas}
              selecionadaId={selecionadaId}
              onSelecionar={setSelecionadaId}
            />
          )}
          <div className="map-legend">
            <span><i className="legend-location"><Navigation size={11} fill="currentColor" /></i>Sua localização</span>
            <span><i className="legend-progress"><Package size={11} /></i>Entrega em andamento</span>
            <span><i className="legend-pending"><MapPin size={11} fill="currentColor" /></i>Entrega pendente</span>
            <span><i className="legend-done"><Check size={11} /></i>Entrega concluída</span>
          </div>
        </div>

        <aside className="delivery-detail-card" aria-label="Detalhes da entrega">
          {selecionada ? (
            <>
              <div className="delivery-card-heading">
                <div className={`delivery-status-pill ${selecionada.status === "Entregue" ? "is-done" : ""}`}>
                  <Package size={18} /> {ROTULO_STATUS[selecionada.status]}
                </div>
                <h2>{selecionada.codigo}</h2>
              </div>

              <div className="delivery-card-information">
                <p className="delivery-section-label">Informações da entrega</p>
                <div className="delivery-detail-row">
                  <MapPin size={21} fill="currentColor" />
                  <p><strong>{selecionada.ruaNumero}</strong><span>{selecionada.localidade}</span></p>
                </div>
                <div className="delivery-detail-row">
                  <UserRound size={21} />
                  <p><span>Cliente</span><strong>{selecionada.cliente}</strong></p>
                </div>
              </div>

              <div className="delivery-eta-section">
                <p className="delivery-section-label">Previsão de entrega</p>
                <div className="delivery-eta">
                  <Clock3 size={25} />
                  <p><strong>{selecionada.previsaoHora}</strong></p>
                </div>
              </div>

              <div className="delivery-detail-actions">
                <button type="button" className="detail-route-button" onClick={() => window.dispatchEvent(new Event("tracking-map-focus"))}>
                  <Navigation size={14} fill="currentColor" /> Ver rota
                </button>
                {selecionada.status === "Entregue" ? (
                  <button type="button" className="detail-cancel-button" disabled={salvando} onClick={() => mudarStatus("A Caminho")}>
                    <RotateCcw size={15} /> Cancelar entrega
                  </button>
                ) : selecionada.status === "A Caminho" ? (
                  <button type="button" className="detail-confirm-button" disabled={salvando} onClick={() => mudarStatus("Entregue")}>
                    <Check size={15} /> Confirmar entrega
                  </button>
                ) : (
                  <button type="button" className="detail-confirm-button" disabled={salvando} onClick={() => mudarStatus("A Caminho")}>
                    <Navigation size={15} /> Iniciar entrega
                  </button>
                )}
              </div>

              {dados.entregas.length > 1 && (
                <div className="delivery-stops">
                  <p className="delivery-section-label">Suas paradas de hoje</p>
                  {dados.entregas.map((entrega) => (
                    <button
                      key={entrega.id}
                      type="button"
                      className={`delivery-stop ${entrega.id === selecionadaId ? "active" : ""}`}
                      onClick={() => setSelecionadaId(entrega.id)}
                    >
                      <strong>{entrega.codigo}</strong>
                      <span>{entrega.previsaoHora} · {entrega.status === "A Caminho" ? "Em andamento" : entrega.status === "Entregue" ? "Concluída" : "Pendente"}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="delivery-card-heading">
              <h2>{carregando ? "Carregando..." : "Sem entregas para mostrar"}</h2>
              {!carregando && <p className="delivery-section-label">Você não tem entregas abertas nem concluídas hoje.</p>}
            </div>
          )}
        </aside>
      </section>
      </main>
    </div>
  );
}
