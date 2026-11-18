"use client";

import { useMemo, useState } from "react";
import { Bell, Search, House, Package, Map, LogOut, Check, Clock3, CircleAlert, MapPin, CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import "./pageFuncionarios.css";

const entregas = [
  { codigo: "#LT78452", cliente: "Mercado Souza", endereco: "Rua das Flores, 123 – São Caetano do Sul, SP", data: "14/11/2026" },
  { codigo: "#LT78449", cliente: "Tech Solutions", endereco: "Av. Goiás, 456 – Santo André, SP", data: "13/11/2026" },
  { codigo: "#LT78445", cliente: "Bella Moda", endereco: "Rua XV de Novembro, 321 – São Caetano do Sul, SP", data: "12/11/2026" },
  { codigo: "#LT78440", cliente: "Supermercado Central", endereco: "Av. Presidente Kennedy, 789 – São Paulo, SP", data: "10/11/2026" },
  { codigo: "#LT78438", cliente: "Farmácia Alfa", endereco: "Rua Manuel Coelho, 654 – Santo André, SP", data: "08/11/2026" },
  { codigo: "#LT78431", cliente: "Casa & Cia", endereco: "Rua das Acácias, 90 – São Bernardo do Campo, SP", data: "06/11/2026" },
  { codigo: "#LT78427", cliente: "Clínica Vida", endereco: "Av. Kennedy, 1020 – São Caetano do Sul, SP", data: "04/11/2026" },
  { codigo: "#LT78420", cliente: "Papelaria Horizonte", endereco: "Rua das Palmeiras, 51 – Santo André, SP", data: "02/11/2026" },
];

export default function Funcionarios() {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [periodoAberto, setPeriodoAberto] = useState(false);
  const filtradas = useMemo(() => entregas.filter((entrega) => `${entrega.codigo} ${entrega.cliente} ${entrega.endereco}`.toLocaleLowerCase("pt-BR").includes(busca.trim().toLocaleLowerCase("pt-BR"))), [busca]);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / 5));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const linhas = filtradas.slice((paginaAtual - 1) * 5, paginaAtual * 5);

  return <div className="ft-page">
    <aside className="ft-sidebar">
      <Link href="/Dash" className="ft-brand"><img src="/imagens/logo_2.png" alt="LogiTrack" /></Link>
      <nav className="ft-nav" aria-label="Navegação principal">
        <Link href="/Dash"><House size={22}/><span>Início</span></Link>
        <Link className="active" href="/Funcionarios"><Package size={22}/><span>Minhas Entregas</span></Link>
        <Link href="/Rotas"><Map size={22}/><span>Mapa</span></Link>
        <Link href="/login"><LogOut size={22}/><span>Sair</span></Link>
      </nav>
      <div className="ft-online"><i/> <div><strong>Online</strong><small>Última atualização: 10:24</small></div></div>
    </aside>
    <main className="ft-main">
      <header className="ft-topbar"><label className="ft-search"><Search size={20}/><input value={busca} onChange={(event) => { setBusca(event.target.value); setPagina(1); }} placeholder="Buscar entrega..." aria-label="Buscar entrega"/></label><button className="ft-bell" type="button" aria-label="Notificações"><Bell size={29}/><span>2</span></button></header>
      <section className="ft-hero"><div><h1>Minhas <em>Entregas</em></h1><p>Acompanhe o status das suas entregas em tempo real.</p><i/></div><div className="ft-truck" aria-hidden="true">🚚</div></section>
      <section className="ft-stats" aria-label="Resumo das entregas">
        <article><span className="ft-stat-icon all"><Package size={34}/></span><div><p>Total de Entregas</p><strong>12</strong></div></article>
        <article><span className="ft-stat-icon done"><Check size={36}/></span><div><p>Entregues</p><strong>8</strong></div></article>
        <article><span className="ft-stat-icon progress"><Clock3 size={36}/></span><div><p>Em Andamento</p><strong>2</strong></div></article>
        <article><span className="ft-stat-icon pending"><CircleAlert size={36}/></span><div><p>Pendentes</p><strong>2</strong></div></article>
      </section>
      <section className="ft-table-panel">
        <div className="ft-panel-heading"><div className="ft-heading-icon"><Check size={27}/></div><div><h2>Entregas Concluídas</h2><p>Histórico das suas entregas finalizadas.</p></div>
          <div className="ft-period-wrap"><button className="ft-period" type="button" onClick={() => setPeriodoAberto(!periodoAberto)}><CalendarDays size={18}/>{periodo}<ChevronDown size={17}/></button>{periodoAberto && <div className="ft-period-menu">{["Últimos 7 dias", "Últimos 30 dias", "Últimos 90 dias"].map((item) => <button key={item} onClick={() => { setPeriodo(item); setPeriodoAberto(false); }}>{item}</button>)}</div>}</div>
        </div>
        <div className="ft-table-scroll"><table className="ft-table"><thead><tr><th>Nº da Entrega</th><th>Cliente</th><th>Endereço</th><th>Data da Entrega</th><th>Status</th><th aria-label="Detalhes"/></tr></thead><tbody>
          {linhas.map((entrega) => <tr key={entrega.codigo}><td className="ft-code">{entrega.codigo}</td><td>{entrega.cliente}</td><td className="ft-address"><MapPin size={17}/><span>{entrega.endereco}</span></td><td className="ft-date"><CalendarDays size={17}/>{entrega.data}</td><td><span className="ft-done-badge"><Check size={14}/>Concluída</span></td><td className="ft-chevron">›</td></tr>)}
          {linhas.length === 0 && <tr><td colSpan="6" className="ft-empty">Nenhuma entrega encontrada.</td></tr>}
        </tbody></table></div>
        <footer className="ft-pagination"><span>Mostrando {linhas.length ? (paginaAtual - 1) * 5 + 1 : 0}–{Math.min(paginaAtual * 5, filtradas.length)} de {filtradas.length} entregas</span><div><button aria-label="Página anterior" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)}><ChevronLeft size={19}/></button>{Array.from({ length: totalPaginas }, (_, index) => index + 1).map((numero) => <button key={numero} className={paginaAtual === numero ? "current" : ""} onClick={() => setPagina(numero)}>{numero}</button>)}<button aria-label="Próxima página" disabled={paginaAtual === totalPaginas} onClick={() => setPagina(paginaAtual + 1)}><ChevronRight size={19}/></button></div></footer>
      </section>
    </main>
  </div>;
}
