"use client";

import { useEffect, useState } from "react";
import { Search, Package, Check, Clock3, CircleAlert, MapPin, CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Aside from "../components/aside";
import DeliveryBanner from "../components/DeliveryBanner";
import SeletorIdentificacao from "../components/SeletorIdentificacao";
import { chamarApi, useIdentificacao } from "../lib/identificacao";
import "../Dash/pageDash.css";
import "./pageFuncionarios.css";

const PERIODOS = [
  { rotulo: "Últimos 7 dias", dias: 7 },
  { rotulo: "Últimos 30 dias", dias: 30 },
  { rotulo: "Últimos 90 dias", dias: 90 },
];
const POR_PAGINA = 5;

export default function Funcionarios() {
  const motorista = useIdentificacao("motorista");
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [pagina, setPagina] = useState(1);
  const [periodo, setPeriodo] = useState(PERIODOS[1]);
  const [periodoAberto, setPeriodoAberto] = useState(false);
  const [resumo, setResumo] = useState(null);
  const [tabela, setTabela] = useState({ itens: [], total: 0, totalPaginas: 1 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // espera o motorista parar de digitar antes de buscar
  useEffect(() => {
    const espera = setTimeout(() => {
      setBuscaAplicada(busca.trim());
      setPagina(1);
    }, 300);
    return () => clearTimeout(espera);
  }, [busca]);

  useEffect(() => {
    if (!motorista.id) return;
    let cancelado = false;
    chamarApi(`/portal/motorista/${motorista.id}/resumo`)
      .then((dados) => { if (!cancelado) setResumo(dados); })
      .catch((falha) => { if (!cancelado) setErro(falha.message); });
    return () => { cancelado = true; };
  }, [motorista.id]);

  useEffect(() => {
    if (!motorista.id) return;
    let cancelado = false;
    const parametros = new URLSearchParams({
      status: "Entregue",
      dias: String(periodo.dias),
      pagina: String(pagina),
      limite: String(POR_PAGINA),
      busca: buscaAplicada,
    });
    setCarregando(true);
    chamarApi(`/portal/motorista/${motorista.id}/entregas?${parametros}`)
      .then((dados) => { if (!cancelado) { setTabela(dados); setErro(""); } })
      .catch((falha) => { if (!cancelado) setErro(falha.message); })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
  }, [motorista.id, periodo, pagina, buscaAplicada]);

  const nome = motorista.atual?.nome ?? "Motorista";
  const iniciais = motorista.atual?.iniciais ?? "--";
  const linhas = tabela.itens;
  const paginaAtual = Math.min(pagina, tabela.totalPaginas);
  const inicio = linhas.length ? (paginaAtual - 1) * POR_PAGINA + 1 : 0;
  const fim = (paginaAtual - 1) * POR_PAGINA + linhas.length;
  const numero = (valor) => (resumo ? valor : "–");

  return (
    <div className="ft-page home-employee-page">
      <Aside variant="employee" />
      <main className="ft-main">
        <header className="ft-topbar">
          <label className="ft-search">
            <Search size={20} />
            <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar entrega..." aria-label="Buscar entrega" />
          </label>
          <SeletorIdentificacao rotulo="Testando como" lista={motorista.lista} id={motorista.id} onChange={(novo) => { motorista.escolher(novo); setResumo(null); setPagina(1); }} />
          <div className="ft-profile" aria-label={`Perfil de ${nome}`}>
            <span className="ft-profile-avatar">{iniciais}</span>
            <span className="ft-profile-name">{nome}</span>
          </div>
        </header>
        <DeliveryBanner title="Início" subtitle="Acompanhe suas entregas e gerencie seu dia." />
        {(erro || motorista.erro) && <p className="aviso-erro" role="alert">{erro || motorista.erro}</p>}
        <section className="ft-stats" aria-label="Resumo das entregas">
          <article><span className="ft-stat-icon all"><Package size={34} /></span><div><p>Total de Entregas</p><strong>{numero(resumo?.total)}</strong></div></article>
          <article><span className="ft-stat-icon done"><Check size={36} /></span><div><p>Entregues</p><strong>{numero(resumo?.entregues)}</strong></div></article>
          <article><span className="ft-stat-icon progress"><Clock3 size={36} /></span><div><p>Em Andamento</p><strong>{numero(resumo?.emAndamento)}</strong></div></article>
          <article><span className="ft-stat-icon pending"><CircleAlert size={36} /></span><div><p>Pendentes</p><strong>{numero(resumo?.pendentes)}</strong></div></article>
        </section>
        <section className="ft-table-panel">
          <div className="ft-panel-heading">
            <div className="ft-heading-icon"><Check size={27} /></div>
            <div><h2>Entregas Concluídas</h2><p>Histórico das suas entregas finalizadas.</p></div>
            <div className="ft-period-wrap">
              <button className="ft-period" type="button" onClick={() => setPeriodoAberto(!periodoAberto)}><CalendarDays size={18} />{periodo.rotulo}<ChevronDown size={17} /></button>
              {periodoAberto && (
                <div className="ft-period-menu">
                  {PERIODOS.map((item) => (
                    <button key={item.dias} onClick={() => { setPeriodo(item); setPagina(1); setPeriodoAberto(false); }}>{item.rotulo}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="ft-table-scroll">
            <table className="ft-table">
              <thead><tr><th>Nº da Entrega</th><th>Cliente</th><th>Endereço</th><th>Data da Entrega</th><th>Status</th><th aria-label="Detalhes" /></tr></thead>
              <tbody>
                {linhas.map((entrega) => (
                  <tr key={entrega.id}>
                    <td className="ft-code">{entrega.codigo}</td>
                    <td>{entrega.cliente}</td>
                    <td className="ft-address"><MapPin size={17} /><span>{entrega.endereco}</span></td>
                    <td className="ft-date"><CalendarDays size={17} />{entrega.dataEntrega}</td>
                    <td><span className="ft-done-badge"><Check size={14} />Concluída</span></td>
                    <td className="ft-chevron">›</td>
                  </tr>
                ))}
                {!carregando && linhas.length === 0 && <tr><td colSpan="6" className="ft-empty">Nenhuma entrega encontrada.</td></tr>}
                {carregando && linhas.length === 0 && <tr><td colSpan="6" className="ft-empty">Carregando entregas...</td></tr>}
              </tbody>
            </table>
          </div>
          <footer className="ft-pagination">
            <span>Mostrando {inicio}–{fim} de {tabela.total} entregas</span>
            <div>
              <button aria-label="Página anterior" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)}><ChevronLeft size={19} /></button>
              {Array.from({ length: tabela.totalPaginas }, (_, index) => index + 1).map((numeroPagina) => (
                <button key={numeroPagina} className={paginaAtual === numeroPagina ? "current" : ""} onClick={() => setPagina(numeroPagina)}>{numeroPagina}</button>
              ))}
              <button aria-label="Próxima página" disabled={paginaAtual === tabela.totalPaginas} onClick={() => setPagina(paginaAtual + 1)}><ChevronRight size={19} /></button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
