"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock3, Map as MapIcon, MapPin, Navigation, Package, PackageX, Satellite, UserRound, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Aside from "../components/aside";
import DeliveryBanner from "../components/DeliveryBanner";
import SeletorIdentificacao from "../components/SeletorIdentificacao";
import { chamarApi, useIdentificacao } from "../lib/identificacao";
import "../Dash/pageDash.css";
import "./mapa.css";
import "../MinhasEntregas/cancelamento.css";

const TrackingMap = dynamic(() => import("./TrackingMap"), {
  ssr: false,
  loading: () => <div className="tracking-map-loading">Carregando mapa...</div>,
});

const ROTULO_STATUS = { "A Caminho": "Entrega em Andamento", Pendente: "Entrega Pendente" };

export default function MapaFuncionarios() {
  const router = useRouter();
  const motorista = useIdentificacao("motorista");
  const [camada, setCamada] = useState("mapa");
  const [dados, setDados] = useState({ origem: null, entregas: [] });
  const [selecionadaId, setSelecionadaId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [entregaConcluida, setEntregaConcluida] = useState(null);
  const [avisoCancelamento, setAvisoCancelamento] = useState(null);
  const cancelamentosVistos = useRef({ motoristaId: null, codigos: new Set() });

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
    if (!motorista.pronto) return;
    if (!motorista.id) {
      setCarregando(false);
      if (motorista.erro) setErro(motorista.erro);
      return;
    }
    // "Ver rota" na tela Minhas Entregas manda ?codigo=... para abrir já nessa entrega
    const codigo = new URLSearchParams(window.location.search).get("codigo");
    setCarregando(true);
    carregar(motorista.id, codigo);
  }, [motorista.id, motorista.pronto, motorista.erro, carregar]);

  useEffect(() => {
    if (!motorista.id) return undefined;
    if (cancelamentosVistos.current.motoristaId !== motorista.id) {
      cancelamentosVistos.current = { motoristaId: motorista.id, codigos: new Set() };
    }
    let ativo = true;
    const verificar = async () => {
      try {
        const resultado = await chamarApi(`/portal/motorista/${motorista.id}/entregas?status=Cancelado&limite=50`);
        if (!ativo) return;
        const novas = resultado.itens.filter((item) => !cancelamentosVistos.current.codigos.has(item.codigo));
        for (const item of novas) cancelamentosVistos.current.codigos.add(item.codigo);
        if (novas.length) setAvisoCancelamento((atual) => atual ?? novas[0]);
      } catch { /* a tela do mapa continua disponível quando a consulta de avisos falha */ }
    };
    verificar();
    const intervalo = window.setInterval(verificar, 10000);
    return () => { ativo = false; window.clearInterval(intervalo); };
  }, [motorista.id]);

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
      router.push("/Funcionarios");
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
              motoristaId={motorista.id}
            />
          )}
          {!dados.origem && !carregando && (erro || motorista.erro) && (
            <div className="map-unavailable-state" role="status">
              <MapPin size={34} aria-hidden="true" />
              <strong>Mapa indisponível</strong>
              <span>Confira a conexão com o servidor e tente novamente.</span>
            </div>
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
                {selecionada.coleta && <div className="delivery-detail-row"><MapPin size={21} /><p><span>Ponto de coleta</span><strong>{selecionada.coleta}</strong></p></div>}
                {(selecionada.servico || selecionada.tamanho || selecionada.pesoKg != null) && <div className="delivery-detail-row"><Package size={21} /><p><span>Pacote</span><strong>{selecionada.servico || "Entrega"} · {selecionada.tamanho || "Tamanho não informado"}{selecionada.pesoKg != null ? ` · ${selecionada.pesoKg} kg` : ""}</strong></p></div>}
                {selecionada.valorFrete != null && <div className="delivery-detail-row"><Package size={21} /><p><span>Frete</span><strong>{Number(selecionada.valorFrete).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></p></div>}
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
              <h2>{carregando ? "Carregando..." : (erro || motorista.erro) ? "Não foi possível carregar o mapa" : "Sem entregas para mostrar"}</h2>
              {!carregando && (erro || motorista.erro)
                ? <p className="delivery-section-label">Verifique a conexão e tente novamente.</p>
                : !carregando && <p className="delivery-section-label">Você não tem entregas abertas no momento.</p>}
            </div>
          )}
        </aside>
      </section>
      </main>
      {avisoCancelamento && (
        <div className="driver-cancel-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setAvisoCancelamento(null); }}>
          <section className="driver-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="map-driver-cancel-title">
            <button type="button" className="driver-cancel-close" aria-label="Fechar aviso" onClick={() => setAvisoCancelamento(null)}><X size={19} /></button>
            <span className="driver-cancel-icon"><PackageX size={25} /></span>
            <h2 id="map-driver-cancel-title">Pedido cancelado pelo cliente</h2>
            <p><strong>{avisoCancelamento.codigo}</strong> · {avisoCancelamento.cliente}</p>
            {avisoCancelamento.precisaDevolucao ? (
              <div className="driver-return-instruction"><strong>Devolva o produto ao ponto de coleta.</strong><span>{avisoCancelamento.coleta || "Confira o endereço de coleta nos detalhes do pedido."}</span></div>
            ) : (
              <div className="driver-return-instruction"><strong>A entrega foi cancelada antes de iniciar.</strong><span>Nenhum produto foi registrado como retirado. Confira com a central caso já esteja com o pacote.</span></div>
            )}
            <p className="driver-cancel-destination">Destino do pedido: {avisoCancelamento.endereco}</p>
            <button type="button" className="driver-cancel-confirm" onClick={() => setAvisoCancelamento(null)}>Entendi</button>
          </section>
        </div>
      )}
    </div>
  );
}
