"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, Map as MapIcon, MapPin, Navigation, Package, Satellite, UserRound } from "lucide-react";
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

const ROTULO_STATUS = { "A Caminho": "Entrega em Andamento", Pendente: "Entrega Pendente" };

export default function MapaFuncionarios() {
  const motorista = useIdentificacao("motorista");
  const [camada, setCamada] = useState("mapa");
  const [dados, setDados] = useState({ origem: null, entregas: [] });
  const [selecionadaId, setSelecionadaId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [avisoDesfazer, setAvisoDesfazer] = useState(null);

  const carregar = useCallback(async (idMotorista, codigoPreferido) => {
    try {
      const sufixoCodigo = codigoPreferido ? `?codigo=${encodeURIComponent(codigoPreferido)}` : "";
      const resposta = await chamarApi(`/portal/motorista/${idMotorista}/mapa${sufixoCodigo}`);
      const entregasAbertas = (resposta.entregas ?? []).filter((entrega) => ["Pendente", "A Caminho"].includes(entrega.status));
      setDados({ ...resposta, entregas: entregasAbertas });
      setErro("");
      setSelecionadaId((atual) => {
        if (codigoPreferido) {
          const pedida = entregasAbertas.find((entrega) => entrega.codigo === codigoPreferido);
          if (pedida) return pedida.id;
        }
        if (entregasAbertas.some((entrega) => entrega.id === atual)) return atual;
        const primeira = entregasAbertas.find((entrega) => entrega.status === "A Caminho")
          ?? entregasAbertas.find((entrega) => entrega.status === "Pendente")
          ?? entregasAbertas[0];
        return primeira ? primeira.id : null;
      });
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!avisoDesfazer) return undefined;
    const timer = window.setTimeout(() => setAvisoDesfazer(null), 8000);
    return () => window.clearTimeout(timer);
  }, [avisoDesfazer]);

  useEffect(() => {
    if (!motorista.id) return;
    // "Ver rota" na tela Minhas Entregas manda ?codigo=... para abrir já nessa entrega
    const codigo = new URLSearchParams(window.location.search).get("codigo");
    setAvisoDesfazer(null);
    setCarregando(true);
    carregar(motorista.id, codigo);
  }, [motorista.id, carregar]);

  const entregasAbertas = dados.entregas.filter((entrega) => ["Pendente", "A Caminho"].includes(entrega.status));
  const selecionada = entregasAbertas.find((entrega) => entrega.id === selecionadaId) ?? null;

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

  async function confirmarEntrega() {
    if (!selecionada) return;
    const codigo = selecionada.codigo;
    setAvisoDesfazer(null);
    setSalvando(true);
    try {
      await chamarApi(`/portal/motorista/${motorista.id}/entregas/${encodeURIComponent(codigo)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Entregue" }),
      });
      setDados((atual) => ({
        ...atual,
        entregas: atual.entregas.filter((entrega) => entrega.id !== selecionada.id),
      }));
      setSelecionadaId(() => {
        const restantes = entregasAbertas.filter((entrega) => entrega.id !== selecionada.id);
        const proxima = restantes.find((entrega) => entrega.status === "A Caminho")
          ?? restantes.find((entrega) => entrega.status === "Pendente")
          ?? restantes[0];
        return proxima ? proxima.id : null;
      });
      setAvisoDesfazer({ codigo });
      await carregar(motorista.id);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  async function desfazerEntrega() {
    if (!avisoDesfazer) return;
    const { codigo } = avisoDesfazer;
    setSalvando(true);
    try {
      await chamarApi(`/portal/motorista/${motorista.id}/entregas/${encodeURIComponent(codigo)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "A Caminho" }),
      });
      setAvisoDesfazer(null);
      await carregar(motorista.id, codigo);
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
          <SeletorIdentificacao rotulo="Testando como" lista={motorista.lista} id={motorista.id} onChange={(novo) => { setAvisoDesfazer(null); motorista.escolher(novo); setSelecionadaId(null); }} />
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
      {avisoDesfazer && (
        <div className="aviso-erro delivery-undo-notice" role="status">
          <span>Entrega {avisoDesfazer.codigo} concluída.</span>
          <button type="button" disabled={salvando} onClick={desfazerEntrega}>Desfazer</button>
        </div>
      )}

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
              entregas={entregasAbertas}
              selecionadaId={selecionadaId}
              onSelecionar={setSelecionadaId}
            />
          )}
          <div className="map-legend">
            <span><i className="legend-location"><Navigation size={11} fill="currentColor" /></i>Sua localização</span>
            <span><i className="legend-progress"><Package size={11} /></i>Entrega em andamento</span>
            <span><i className="legend-pending"><MapPin size={11} fill="currentColor" /></i>Entrega pendente</span>          </div>
        </div>

        <aside className="delivery-detail-card" aria-label="Detalhes da entrega">
          {selecionada ? (
            <>
              <div className="delivery-card-heading">
                <div className="delivery-status-pill">
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
                <button type="button" className="detail-route-button" onClick={() => window.dispatchEvent(new CustomEvent("tracking-map-focus", { detail: { entregaId: selecionada.id } }))}>
                  <Navigation size={14} fill="currentColor" /> Ver rota
                </button>
                {selecionada.status === "A Caminho" ? (
                  <button type="button" className="detail-confirm-button" disabled={salvando} onClick={confirmarEntrega}>
                    <Check size={15} /> Confirmar entrega
                  </button>
                ) : (
                  <button type="button" className="detail-confirm-button" disabled={salvando} onClick={() => mudarStatus("A Caminho")}>
                    <Navigation size={15} /> Iniciar entrega
                  </button>
                )}
              </div>

              {entregasAbertas.length > 1 && (
                <div className="delivery-stops">
                  <p className="delivery-section-label">Suas paradas de hoje</p>
                  {entregasAbertas.map((entrega) => (
                    <button
                      key={entrega.id}
                      type="button"
                      className={`delivery-stop ${entrega.id === selecionadaId ? "active" : ""}`}
                      onClick={() => setSelecionadaId(entrega.id)}
                    >
                      <strong>{entrega.codigo}</strong>
                      <span>{entrega.previsaoHora} · {entrega.status === "A Caminho" ? "Em andamento" : "Pendente"}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="delivery-card-heading">
              <h2>{carregando ? "Carregando..." : "Sem entregas para mostrar"}</h2>
              {!carregando && <p className="delivery-section-label">Você não tem entregas abertas no momento.</p>}
            </div>
          )}
        </aside>
      </section>
      </main>
    </div>
  );
}
