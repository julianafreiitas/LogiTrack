"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Clock3, MapPin, Package, PackageX, Search, Send, Truck, X } from "lucide-react";
import Aside from "../components/aside";
import DeliveryBanner from "../components/DeliveryBanner";
import SeletorIdentificacao from "../components/SeletorIdentificacao";
import { chamarApi, useIdentificacao } from "../lib/identificacao";
import "../Dash/pageDash.css";
import "../Funcionarios/pageFuncionarios.css";
import "./cancelamento.css";

// aba da tela -> o que pedir para a API e como mostrar
const ABAS = [
  { id: "andamento", label: "Em Andamento", icon: Truck, status: "A Caminho", contagem: "emAndamento" },
  { id: "pendente", label: "Pendentes", icon: Clock3, status: "Pendente", contagem: "pendentes" },
  { id: "cancelada", label: "Canceladas", icon: PackageX, status: "Cancelado", contagem: "canceladas" },
  // concluídas: só as de hoje (dias=1), como no card "Entregas Concluídas"
  { id: "concluida", label: "Concluídas", icon: Check, status: "Entregue", dias: 1, contagem: "concluidasHoje" },
];

function nomeStatus(status) {
  return status === "A Caminho" ? "Em andamento" : status === "Entregue" ? "Concluída" : "Pendente";
}

export default function MinhasEntregas() {
  const motorista = useIdentificacao("motorista");
  const [resumo, setResumo] = useState(null);
  const [aba, setAba] = useState("pendente");
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [entregas, setEntregas] = useState([]);
  const [selecionadaId, setSelecionadaId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [avisoCancelamento, setAvisoCancelamento] = useState(null);
  const cancelamentosVistos = useRef({ motoristaId: null, codigos: new Set() });
  const rotaInicialAplicada = useRef(false);
  const pedidoInicialAplicado = useRef(false);
  const [versao, setVersao] = useState(0); // aumenta para recarregar resumo e lista após uma mudança

  useEffect(() => {
    const espera = setTimeout(() => setBuscaAplicada(busca.trim()), 300);
    return () => clearTimeout(espera);
  }, [busca]);

  useEffect(() => {
    if (!motorista.pronto || rotaInicialAplicada.current) return;
    const parametros = new URLSearchParams(window.location.search);
    const motoristaDoPedido = Number(parametros.get("motorista"));
    if (motorista.lista.some((item) => item.id === motoristaDoPedido)) motorista.escolher(motoristaDoPedido);
    if (parametros.has("pedido")) setAba("pendente");
    rotaInicialAplicada.current = true;
  }, [motorista.pronto, motorista.lista, motorista.escolher]);

  useEffect(() => {
    if (!motorista.id) return;
    let cancelado = false;
    chamarApi(`/portal/motorista/${motorista.id}/resumo`)
      .then((dados) => { if (!cancelado) setResumo(dados); })
      .catch((falha) => { if (!cancelado) setErro(falha.message); });
    return () => { cancelado = true; };
  }, [motorista.id, versao]);

  useEffect(() => {
    if (!motorista.id) return;
    const definicao = ABAS.find((item) => item.id === aba);
    let cancelado = false;
    const parametros = new URLSearchParams({ status: definicao.status, limite: "50", busca: buscaAplicada });
    if (definicao.dias) parametros.set("dias", String(definicao.dias));
    setCarregando(true);
    chamarApi(`/portal/motorista/${motorista.id}/entregas?${parametros}`)
      .then((dados) => {
        if (cancelado) return;
        setEntregas(dados.itens);
        setErro("");
        if (!pedidoInicialAplicado.current) {
          const codigoPedido = new URLSearchParams(window.location.search).get("pedido");
          const pedidoInicial = dados.itens.find((item) => item.codigo === codigoPedido);
          if (pedidoInicial) {
            setSelecionadaId(pedidoInicial.id);
            pedidoInicialAplicado.current = true;
          }
        }
      })
      .catch((falha) => { if (!cancelado) setErro(falha.message); })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
  }, [motorista.id, aba, buscaAplicada, versao]);

  const selecionada = entregas.find((entrega) => entrega.id === selecionadaId) ?? entregas[0] ?? null;
  const contagens = {
    andamento: resumo?.emAndamento,
    pendente: resumo?.pendentes,
    concluida: resumo?.hoje.concluidas,
    cancelada: resumo?.canceladas,
  };
  const numero = (valor) => (resumo ? valor : "–");

  const iniciarEntrega = useCallback(async (entrega) => {
    try {
      await chamarApi(`/portal/motorista/${motorista.id}/entregas/${encodeURIComponent(entrega.codigo)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "A Caminho" }),
      });
      setAba("andamento");
      setSelecionadaId(entrega.id);
      setVersao((atual) => atual + 1);
    } catch (falha) {
      setErro(falha.message);
    }
  }, [motorista.id]);

  const verificarCancelamentos = useCallback(async () => {
    if (!motorista.id) return;
    if (cancelamentosVistos.current.motoristaId !== motorista.id) {
      cancelamentosVistos.current = { motoristaId: motorista.id, codigos: new Set() };
    }
    const dados = await chamarApi(`/portal/motorista/${motorista.id}/entregas?status=Cancelado&limite=50`);
    const novas = dados.itens.filter((item) => !cancelamentosVistos.current.codigos.has(item.codigo));
    for (const item of novas) cancelamentosVistos.current.codigos.add(item.codigo);
    if (novas.length) setAvisoCancelamento((atual) => atual ?? novas[0]);
  }, [motorista.id]);

  useEffect(() => {
    if (!motorista.id) return undefined;
    let ativo = true;
    const atualizar = () => verificarCancelamentos().catch(() => {});
    atualizar();
    const intervalo = window.setInterval(() => { if (ativo) atualizar(); }, 10000);
    return () => { ativo = false; window.clearInterval(intervalo); };
  }, [motorista.id, verificarCancelamentos]);

  const nome = motorista.atual?.nome ?? "Motorista";

  return (
    <div className="ft-page">
      <Aside variant="employee" />
      <main className="ft-main">
        <header className="ft-topbar">
          <label className="ft-search">
            <Search size={20} />
            <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar entrega..." aria-label="Buscar entrega" />
          </label>
          <SeletorIdentificacao rotulo="Testando como" lista={motorista.lista} id={motorista.id} onChange={(novo) => { motorista.escolher(novo); setResumo(null); setSelecionadaId(null); }} />
          <div className="ft-profile" aria-label={`Perfil de ${nome}`}>
            <span className="ft-profile-avatar">{motorista.atual?.iniciais ?? "--"}</span>
            <span className="ft-profile-name">{nome}</span>
          </div>
        </header>

        <DeliveryBanner title="Minhas Entregas" subtitle="Acompanhe suas entregas e gerencie seu dia." />
        {(erro || motorista.erro) && <p className="aviso-erro" role="alert">{erro || motorista.erro}</p>}

        <section className="md-stats" aria-label="Resumo das entregas">
          <article className="md-stat-card">
            <span className="md-stat-icon today"><Package size={34} /></span>
            <div><p>Entregas Hoje</p><strong>{numero(resumo?.hoje.total)}</strong></div>
          </article>
          <article className="md-stat-card">
            <span className="md-stat-icon completed"><Check size={36} /></span>
            <div><p>Entregas Concluídas</p><strong>{numero(resumo?.hoje.concluidas)}</strong></div>
          </article>
          <article className="md-stat-card">
            <span className="md-stat-icon pending"><Clock3 size={34} /></span>
            <div><p>Entregas Pendentes</p><strong>{numero(resumo?.hoje.abertas)}</strong></div>
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
                  onClick={() => { setAba(id); setSelecionadaId(null); }}
                >
                  <Icon size={18} /> {label} ({contagens[id] ?? "–"})
                </button>
              ))}
            </div>

            <div className="md-delivery-list">
              {entregas.map((entrega) => {
                const classe = entrega.status === "A Caminho" ? "andamento" : entrega.status === "Entregue" ? "concluida" : "pendente";
                return (
                  <article key={entrega.id} className={`md-delivery-item ${selecionada?.id === entrega.id ? "selected" : ""} ${classe}`}>
                    <button className="md-delivery-summary" type="button" onClick={() => setSelecionadaId(entrega.id)}>
                      <span className="md-item-status"><Clock3 size={14} /> {(entrega.status === "Cancelado" ? "Cancelada pelo cliente" : nomeStatus(entrega.status))}{entrega.atrasada ? " · atrasada" : ""}</span>
                      <strong className="md-item-code">{entrega.codigo}</strong>
                      <span className="md-item-address"><MapPin size={16} />{entrega.endereco}</span>
                      <span className="md-item-client"><Package size={15} />Cliente: {entrega.cliente}</span>
                    </button>
                    <div className="md-item-eta">
                      <span><Clock3 size={15} />Previsão de entrega</span>
                      <strong><Clock3 size={20} />{entrega.previsaoHora}</strong>
                      {entrega.status === "Cancelado" ? (
                        <button type="button" className="md-route-button" onClick={() => setAvisoCancelamento(entrega)}>
                          <PackageX size={15} /> Ver aviso
                        </button>
                      ) : entrega.status === "Pendente" ? (
                        <button type="button" className="md-start-button" onClick={() => iniciarEntrega(entrega)}>
                          <Truck size={15} /> Iniciar entrega
                        </button>
                      ) : entrega.status === "A Caminho" ? (
                        <Link className="md-route-button" href={`/MapaFuncionarios?codigo=${encodeURIComponent(entrega.codigo)}`}>
                          <Send size={15} /> Ver rota
                        </Link>
                      ) : (
                        <span className="md-complete-label"><Check size={15} /> Concluída</span>
                      )}
                    </div>
                  </article>
                );
              })}
              {carregando && entregas.length === 0 && <p className="md-empty">Carregando entregas...</p>}
              {!carregando && entregas.length === 0 && <p className="md-empty">Nenhuma entrega encontrada nesta categoria.</p>}
            </div>
          </div>
        </section>
      </main>
      {avisoCancelamento && (
        <div className="driver-cancel-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setAvisoCancelamento(null); }}>
          <section className="driver-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="driver-cancel-title">
            <button type="button" className="driver-cancel-close" aria-label="Fechar aviso" onClick={() => setAvisoCancelamento(null)}><X size={19} /></button>
            <span className="driver-cancel-icon"><PackageX size={25} /></span>
            <h2 id="driver-cancel-title">Pedido cancelado pelo cliente</h2>
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
