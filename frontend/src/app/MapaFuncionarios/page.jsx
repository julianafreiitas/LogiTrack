"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, Map as MapIcon, MapPin, Navigation, Package, Satellite, UserRound } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
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
  const [entregaConcluida, setEntregaConcluida] = useState(null);

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
    if (!motorista.id) return;
    // "Ver rota" na tela Minhas Entregas manda ?codigo=... para abrir já nessa entrega
    const codigo = new URLSearchParams(window.location.search).get("codigo");
    setCarregando(true);
    carregar(motorista.id, codigo);
  }, [motorista.id, carregar]);

  const entregasAbertas = dados.entregas.filter((entrega) => ["Pendente", "A Caminho"].includes(entrega.status));
  const selecionada = entregasAbertas.find((entrega) => entrega.id === selecionadaId) ?? null;

  function removerCodigoDaUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("codigo");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

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
      setSelecionadaId(null);
      setEntregaConcluida({ codigo });
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  async function desfazerEntrega() {
    if (!entregaConcluida) return;
    const { codigo } = entregaConcluida;
    setSalvando(true);
    try {
      await chamarApi(`/portal/motorista/${motorista.id}/entregas/${encodeURIComponent(codigo)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "A Caminho" }),
      });
      setEntregaConcluida(null);
      setCarregando(true);
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
          <SeletorIdentificacao rotulo="Testando como" lista={motorista.lista} id={motorista.id} onChange={(novo) => {
            removerCodigoDaUrl();
            setEntregaConcluida(null);
            setDados({ origem: null, entregas: [] });
            setSelecionadaId(null);
            setCarregando(true);
            motorista.escolher(novo);
          }} />
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
              entrega={entregaConcluida ? null : selecionada}
            />
          )}
          <div className="map-legend">
            <span><i className="legend-location"><Navigation size={11} fill="currentColor" /></i>Sua localização</span>
            {!entregaConcluida && selecionada && (
              <span>
                <i className={selecionada.status === "A Caminho" ? "legend-progress" : "legend-pending"}>
                  {selecionada.status === "A Caminho" ? <Package size={11} /> : <MapPin size={11} fill="currentColor" />}
                </i>
                {selecionada.status === "A Caminho" ? "Entrega em andamento" : "Entrega pendente"}
              </span>
            )}
          </div>
        </div>

        <aside className="delivery-detail-card" aria-label="Detalhes da entrega">
          {entregaConcluida ? (
            <div className="delivery-completed-state" role="status">
              <h2>Entrega {entregaConcluida.codigo} concluída.</h2>
              <div className="delivery-completion-actions">
                <button type="button" className="detail-confirm-button" disabled={salvando} onClick={desfazerEntrega}>Desfazer</button>
                <Link className="detail-route-button" href="/MinhasEntregas">Voltar para Minhas Entregas</Link>
              </div>
            </div>
          ) : selecionada ? (
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
