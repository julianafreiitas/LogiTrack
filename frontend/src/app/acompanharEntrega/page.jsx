"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Box, Check, CheckCircle2, Clock3, MapPin, Package, PackageX, Truck, UserRound, X } from "lucide-react";
import Header from "../components/Header-usuarios";
import { chamarApi } from "../lib/identificacao";
import "../Main-usuario/pagemain.css";
import "./acompanharEntrega.css";

const formatarData = (valor, opcoes = { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) => {
  if (!valor) return "Aguardando";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "Aguardando" : new Intl.DateTimeFormat("pt-BR", opcoes).format(data);
};

export default function AcompanharEntrega() {
  const [codigo, setCodigo] = useState("");
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalCancelamento, setModalCancelamento] = useState(false);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const carregarPedido = useCallback(async (codigoAtual) => {
    if (!codigoAtual) { setCarregando(false); return; }
    try {
      const dados = await chamarApi(`/portal/cliente/rastreio/${encodeURIComponent(codigoAtual)}`);
      setPedido(dados);
      setErro("");
    } catch (falha) {
      setErro(falha.message);
      setPedido(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const codigoUrl = new URLSearchParams(window.location.search).get("codigo")?.trim() ?? "";
    setCodigo(codigoUrl);
    carregarPedido(codigoUrl);
  }, [carregarPedido]);

  useEffect(() => {
    if (!codigo) return undefined;
    const timer = window.setInterval(() => carregarPedido(codigo), 5000);
    return () => window.clearInterval(timer);
  }, [codigo, carregarPedido]);

  async function confirmarCancelamento() {
    if (!pedido) return;
    setCancelando(true);
    setErro("");
    try {
      await chamarApi(`/portal/cliente/rastreio/${encodeURIComponent(pedido.codigo)}/cancelar`, { method: "PATCH" });
      await carregarPedido(pedido.codigo);
      setModalCancelamento(false);
      setModalSucessoAberto(true);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCancelando(false);
    }
  }

  const cancelado = pedido?.status === "Cancelado";
  const entregue = pedido?.status === "Entregue";
  const emRota = pedido?.status === "Em Rota";
  const saiuParaEntrega = ["Saiu para Entrega", "A Caminho"].includes(pedido?.status);
  const etapas = [
    { titulo: "Pedido\nSolicitado", data: formatarData(pedido?.solicitadoEm), icon: Check },
    { titulo: "Em Rota", data: emRota || saiuParaEntrega || entregue ? formatarData(pedido?.atualizadoEm) : "Aguardando", icon: Check },
    { titulo: "Saiu para\nEntrega", data: saiuParaEntrega || entregue ? formatarData(pedido?.atualizadoEm) : "Aguardando", icon: Truck },
    { titulo: "Entregue", data: entregue ? formatarData(pedido?.atualizadoEm) : "Aguardando", icon: Check },
  ];
  const indiceAtual = entregue ? 3 : saiuParaEntrega ? 2 : emRota ? 1 : 0;

  return (
    <div className="dash-container tracking-page-shell">
      <Header />
      <main className="tracking-page-content">
        <section className="tracking-hero-banner"><div>
          <span>ACOMPANHAR ENTREGA</span>
          <h1>Acompanhe sua entrega <em>em tempo real</em></h1>
          <p>Confira o status e as informações do seu pedido.</p><i />
        </div></section>

        {erro && <p className="aviso-erro" role="alert">{erro}</p>}
        {carregando && <p>Carregando pedido...</p>}
        {!carregando && !pedido && !erro && (
          <section className="tracking-empty-state" role="status" aria-labelledby="tracking-empty-title">
            <div className="tracking-empty-icon" aria-hidden="true"><Package size={28} /></div>
            <div className="tracking-empty-copy">
              <h2 id="tracking-empty-title">Selecione um pedido para acompanhar</h2>
              <p>Para ver o andamento da entrega, abra esta página pelo código de rastreamento ou escolha um pedido em <strong>Últimos pedidos</strong>.</p>
              <Link href="/Meus-Pedidos" className="tracking-empty-link">Abrir Últimos pedidos <ArrowRight size={17} /></Link>
            </div>
          </section>
        )}

        {pedido && <>
          <section className="tracking-overview">
            <article className="tracking-current-card">
              <div className="tracking-current-heading">
                <div className="tracking-section-icon">{cancelado ? <PackageX size={20} /> : <Package size={20} />}</div>
                <div><h2>Sua entrega</h2><p>{pedido.codigo}</p></div>
              </div>
              <div className="tracking-current-order">
                <div className="tracking-package-icon">{cancelado ? <PackageX size={23} /> : <Box size={23} />}</div>
                <div><strong>{cancelado ? "Entrega cancelada" : entregue ? "Entrega concluída" : saiuParaEntrega ? "Saiu para entrega" : emRota ? "Em rota" : "Pedido solicitado"}</strong><span>{pedido.cliente} · {pedido.tamanho || "Pacote"} · {pedido.pesoKg ?? "–"} kg</span></div>
                <span className={`tracking-live-dot ${cancelado ? "cancelado" : ""}`} aria-label={pedido.status} />
              </div>
              <div className="tracking-current-address"><MapPin size={17} /><span><b>Coleta:</b> {pedido.coleta || "Não informada"}<br /><b>Destino:</b> {pedido.destino}</span></div>
            </article>

            <article className="tracking-progress-card">
              {cancelado ? (
                <div className="tracking-canceled-state"><div><PackageX size={28} /></div><strong>Pedido cancelado</strong><span>O histórico e os dados do pedido continuam disponíveis abaixo.</span></div>
              ) : <>
                <div className="tracking-timeline" aria-label="Etapas da entrega">
                  {etapas.map(({ titulo, data, icon: Icon }, index) => {
                    const concluida = index < indiceAtual || (entregue && index === indiceAtual);
                    const atual = !entregue && index === indiceAtual;
                    return <div className="tracking-step-wrap" key={titulo}>
                      <div className={`tracking-step ${concluida ? "concluida" : atual ? "atual" : "futura"}`}><Icon size={atual ? 20 : 18} /></div>
                      {index < etapas.length - 1 && <div className={`tracking-step-line ${index < indiceAtual ? "done" : ""}`} />}
                      <strong>{titulo.split("\n").map((line) => <span key={line}>{line}</span>)}</strong><small>{data}</small>
                    </div>;
                  })}
                </div>
                <div className="tracking-vehicle-status">
                  <div className="tracking-vehicle-icon"><Truck size={34} /></div>
                  <div><strong>{entregue ? "Entrega concluída" : saiuParaEntrega ? "Seu veículo saiu para entrega!" : emRota ? "Entrega em rota" : "Aguardando início pelo motorista"}</strong><span>Previsão de chegada: <b>{formatarData(pedido.previsao)}</b></span></div>
                </div>
              </>}
            </article>
          </section>

          <section className="tracking-bottom-grid">
            <article className="tracking-details-card">
              <h2><span><CheckCircle2 size={17} /></span> Detalhes da Entrega</h2>
              <div className="tracking-detail-columns">
                <div className="tracking-detail-item"><small><Package size={13} /> Pedido</small><strong>{pedido.codigo}<br />{pedido.texto}</strong></div>
                <div className="tracking-detail-item"><small><UserRound size={13} /> Cliente</small><strong>{pedido.cliente}</strong></div>
                <div className="tracking-detail-item"><small><MapPin size={13} /> Endereço</small><strong>{pedido.destino}</strong></div>
                <div className="tracking-detail-item"><small><Box size={13} /> Pacote / serviço</small><strong>{pedido.tamanho || "–"} · {pedido.servico || "–"}<br />{pedido.pesoKg ?? "–"} kg · {pedido.urgencia || "–"}</strong></div>
                <div className="tracking-detail-item"><small><Clock3 size={13} /> Coleta solicitada</small><strong>{pedido.dataColeta ? formatarData(`${String(pedido.dataColeta).slice(0, 10)}T12:00:00`, { day: "2-digit", month: "2-digit", year: "numeric" }) : "A combinar"}</strong></div>
                <div className="tracking-detail-item"><small><Package size={13} /> Frete / pagamento</small><strong>{pedido.valorFrete == null ? "–" : Number(pedido.valorFrete).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · {pedido.pagamento || "–"}</strong></div>
              </div>
              {pedido.observacoes && <p className="tracking-observations"><strong>Observações:</strong> {pedido.observacoes}</p>}
            </article>
            <article className="tracking-arrival-card">
              <div className="tracking-arrival-copy"><h2><Clock3 size={18} /> Previsão de Chegada</h2>
                <strong>{pedido.previsao ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(pedido.previsao)) : "–"}</strong>
                <span>{pedido.previsao ? formatarData(pedido.previsao, { day: "2-digit", month: "long", year: "numeric" }) : "Calculando"}</span>
              </div><div className="tracking-arrival-illustration" aria-hidden="true"><Truck size={65} /></div>
            </article>
          </section>

          {!cancelado && !entregue && <div className="tracking-cancel-action"><button type="button" onClick={() => setModalCancelamento(true)}><PackageX size={17} /> Cancelar entrega</button></div>}
        </>}
      </main>

      {modalCancelamento && pedido && <div className="tracking-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalCancelamento(false); }}>
        <section className="tracking-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <button className="tracking-modal-close" type="button" aria-label="Fechar" onClick={() => setModalCancelamento(false)}><X size={20} /></button>
          <div className="tracking-modal-icon warning"><PackageX size={30} /></div>
          <h2 id="cancel-title">Cancelar entrega?</h2><p className="tracking-modal-subtitle">Tem certeza de que deseja cancelar este pedido?</p>
          <div className="tracking-cancel-info">
            <div className="tracking-cancel-info-row"><span>Pedido</span><strong>{pedido.codigo}</strong></div>
            <div className="tracking-cancel-info-row"><span>Status</span><strong className="tracking-cancel-status">{pedido.texto}</strong></div>
            <div className="tracking-cancel-warning"><strong><AlertCircle size={16} /> Atenção</strong><p>{pedido.motoristaAtribuido ? "O motorista já está associado à entrega. Poderá ser cobrada uma taxa de cancelamento e será necessário devolver o pacote ao endereço de origem." : "Se o motorista já tiver retirado a encomenda ou estiver a caminho para buscá-la, poderá ser cobrada uma taxa de cancelamento."}</p></div>
          </div>
          <div className="tracking-modal-actions">
            <button className="tracking-confirm-cancel" type="button" disabled={cancelando} onClick={confirmarCancelamento}>{cancelando ? "Cancelando..." : "Confirmar cancelamento"}</button>
            <button className="tracking-keep-delivery" type="button" onClick={() => setModalCancelamento(false)}>Continuar com a entrega</button>
          </div>
        </section>
      </div>}

      {modalSucessoAberto && <div className="tracking-modal-overlay">
        <section className="tracking-cancel-modal tracking-success-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-success-title">
          <div className="tracking-modal-icon success"><CheckCircle2 size={30} /></div><h2 id="cancel-success-title">Pedido cancelado!</h2>
          <p className="tracking-modal-subtitle">O cancelamento foi registrado com sucesso.</p>
          <div className="tracking-return-info"><strong><Truck size={19} /> Devolução / cancelamento</strong><p>{pedido?.motoristaAtribuido ? "O motorista deverá retornar com o pacote para o endereço de origem." : "O pedido foi cancelado antes da confirmação de retirada pelo motorista."}</p></div>
          <p className="tracking-return-notice">O status cancelado já aparece no histórico de pedidos.</p>
          <button className="tracking-keep-delivery" type="button" onClick={() => setModalSucessoAberto(false)}>Entendi</button>
        </section>
      </div>}
    </div>
  );
}
