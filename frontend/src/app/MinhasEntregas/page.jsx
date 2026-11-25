"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock3, MapPin, Package, Search, Send, Truck } from "lucide-react";
import Aside from "../components/aside";
import DeliveryBanner from "../components/DeliveryBanner";
import SeletorIdentificacao from "../components/SeletorIdentificacao";
import { chamarApi, useIdentificacao } from "../lib/identificacao";
import "../Dash/pageDash.css";
import "../Funcionarios/pageFuncionarios.css";

// aba da tela -> o que pedir para a API e como mostrar
const ABAS = [
  { id: "andamento", label: "Em Andamento", icon: Truck, status: "A Caminho", contagem: "emAndamento" },
  { id: "pendente", label: "Pendentes", icon: Clock3, status: "Pendente", contagem: "pendentes" },
  // concluídas: só as de hoje (dias=1), como no card "Entregas Concluídas"
  { id: "concluida", label: "Concluídas", icon: Check, status: "Entregue", dias: 1, contagem: "concluidasHoje" },
];

function nomeStatus(status) {
  return status === "A Caminho" ? "Em andamento" : status === "Entregue" ? "Concluída" : "Pendente";
}

export default function MinhasEntregas() {
  const motorista = useIdentificacao("motorista");
  const [resumo, setResumo] = useState(null);
  const [aba, setAba] = useState("andamento");
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [entregas, setEntregas] = useState([]);
  const [selecionadaId, setSelecionadaId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0); // aumenta para recarregar resumo e lista após uma mudança

  useEffect(() => {
    const espera = setTimeout(() => setBuscaAplicada(busca.trim()), 300);
    return () => clearTimeout(espera);
  }, [busca]);

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
      .then((dados) => { if (!cancelado) { setEntregas(dados.itens); setErro(""); } })
      .catch((falha) => { if (!cancelado) setErro(falha.message); })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
  }, [motorista.id, aba, buscaAplicada, versao]);

  const selecionada = entregas.find((entrega) => entrega.id === selecionadaId) ?? entregas[0] ?? null;
  const contagens = {
    andamento: resumo?.emAndamento,
    pendente: resumo?.pendentes,
    concluida: resumo?.hoje.concluidas,
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
                      <span className="md-item-status"><Clock3 size={14} /> {nomeStatus(entrega.status)}{entrega.atrasada ? " · atrasada" : ""}</span>
                      <strong className="md-item-code">{entrega.codigo}</strong>
                      <span className="md-item-address"><MapPin size={16} />{entrega.endereco}</span>
                      <span className="md-item-client"><Package size={15} />Cliente: {entrega.cliente}</span>
                    </button>
                    <div className="md-item-eta">
                      <span><Clock3 size={15} />Previsão de entrega</span>
                      <strong><Clock3 size={20} />{entrega.previsaoHora}</strong>
                      {entrega.status === "Pendente" ? (
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
    </div>
  );
}
