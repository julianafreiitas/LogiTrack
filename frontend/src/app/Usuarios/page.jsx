"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, FileText, MapPin, Package, Plus, Search, ShieldCheck, Users, X } from "lucide-react";
import Aside from "../components/aside";
import Header from "../components/header";
import "../Dash/pageDash.css";
import "../sharedDashboard.css";
import "./pageUsuarios.css";

const clientes = [
  { nome: "Marcos Oliveira", email: "marcos@email.com", telefone: "(11) 99999-9999", origem: "São Paulo, SP", destino: "Santo André, SP", servico: "Entrega expressa", motorista: "Carlos Henrique", veiculo: "LT-2048", solicitacao: "14/11/2026", status: "Em andamento", detalhe: "Solicitação de entrega criada em 14/11/2026. Acompanhamento ativo." },
  { nome: "Ana Carolina", email: "ana@email.com", solicitacao: "10/11/2026", status: "Concluída", detalhe: "Entrega concluída em 10/11/2026." },
  { nome: "Pedro Santos", email: "pedro@email.com", solicitacao: "09/11/2026", status: "Sem solicitação", detalhe: "Este cliente ainda não possui solicitações de entrega." },
  { nome: "Juliana Lima", email: "juliana@email.com", solicitacao: "05/11/2026", status: "Concluída", detalhe: "Entrega concluída em 05/11/2026." },
  { nome: "Rafael Costa", email: "rafael@email.com", solicitacao: "01/11/2026", status: "Em andamento", detalhe: "Solicitação de entrega criada em 01/11/2026. Acompanhamento ativo." },
  { nome: "Beatriz Souza", email: "beatriz@email.com", solicitacao: "30/10/2026", status: "Concluída", detalhe: "Entrega concluída em 30/10/2026." },
  { nome: "Lucas Ferreira", email: "lucas@email.com", solicitacao: "28/10/2026", status: "Sem solicitação", detalhe: "Este cliente ainda não possui solicitações de entrega." },
  { nome: "Camila Rocha", email: "camila@email.com", solicitacao: "24/10/2026", status: "Em andamento", detalhe: "Solicitação de entrega criada em 24/10/2026. Acompanhamento ativo." },
];

const administradores = [
  { nome: "Equipe de operações", email: "operacoes@logitrack.com", solicitacao: "14/11/2026" },
  { nome: "Mariana Almeida", email: "mariana@logitrack.com", solicitacao: "12/11/2026" },
  { nome: "Gabriel Martins", email: "gabriel@logitrack.com", solicitacao: "08/11/2026" },
  { nome: "Fernanda Dias", email: "fernanda@logitrack.com", solicitacao: "02/11/2026" },
];

function iniciais(nome) {
  return nome.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
}

export default function Usuarios() {
  const [aba, setAba] = useState("Clientes");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [selecionado, setSelecionado] = useState(null);
  const [listaAdministradores, setListaAdministradores] = useState(administradores);
  const [formAberto, setFormAberto] = useState(false);
  const [novoAdmin, setNovoAdmin] = useState({ nome: "", email: "" });
  const [erroAdmin, setErroAdmin] = useState("");
  const dados = aba === "Clientes" ? clientes : listaAdministradores;
  const filtrados = useMemo(() => dados.filter((usuario) => `${usuario.nome} ${usuario.email}`.toLocaleLowerCase("pt-BR").includes(busca.trim().toLocaleLowerCase("pt-BR"))), [dados, busca]);
  const porPagina = 5;
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  function trocarAba(novaAba) { setAba(novaAba); setPagina(1); setBusca(""); }

  function adicionarAdministrador(event) {
    event.preventDefault();
    const nome = novoAdmin.nome.trim();
    const email = novoAdmin.email.trim().toLocaleLowerCase("pt-BR");
    if (listaAdministradores.some((admin) => admin.email.toLocaleLowerCase("pt-BR") === email)) {
      setErroAdmin("Já existe um administrador cadastrado com este e-mail.");
      return;
    }
    setListaAdministradores((atuais) => [{ nome, email, solicitacao: new Date().toLocaleDateString("pt-BR") }, ...atuais]);
    setNovoAdmin({ nome: "", email: "" });
    setErroAdmin("");
    setFormAberto(false);
    setBusca("");
    setPagina(1);
  }

  return (
    <div className="dash-container"><Aside /><main className="dash"><Header />
      <section className="usuarios-content" aria-label="Gerenciamento de usuários">
        <div className="usuarios-heading"><p className="eyebrow">VISÃO GERAL / USUÁRIOS</p><h1>Gerenciamento de Usuários</h1><p className="subtitle">Gerencie os clientes cadastrados e acompanhe suas solicitações de entrega.</p></div>

        <section className="usuarios-metrics" aria-label="Resumo de usuários">
          <article className="usuarios-metric"><Users className="usuarios-metric-icon orange" size={25} fill="currentColor" /><div><strong>248</strong><span>Total de usuários</span></div></article>
          <article className="usuarios-metric"><ShieldCheck className="usuarios-metric-icon blue" size={26} /><div><strong>{18 + listaAdministradores.length - administradores.length}</strong><span>Administradores cadastrados</span></div></article>
        </section>

        <div className="usuarios-tabs" role="tablist" aria-label="Tipo de usuário">
          {["Clientes", "Administradores"].map((item) => <button key={item} type="button" role="tab" aria-selected={aba === item} className={aba === item ? "active" : ""} onClick={() => trocarAba(item)}>{item === "Clientes" ? <Users size={14} fill="currentColor" /> : <ShieldCheck size={14} />}{item}</button>)}
        </div>

        <section className="usuarios-panel" aria-labelledby="usuarios-panel-title">
          <div className="usuarios-toolbar"><h2 id="usuarios-panel-title">{aba} cadastrados</h2>{aba === "Administradores" && <button className="usuarios-add-admin" type="button" onClick={() => { setFormAberto((aberto) => !aberto); setErroAdmin(""); }}><Plus size={17} />Adicionar administrador</button>}</div>
          <label className="usuarios-search"><Search size={14} aria-hidden="true" /><input type="search" value={busca} onChange={(event) => { setBusca(event.target.value); setPagina(1); }} placeholder={aba === "Clientes" ? "Buscar cliente por nome, e-mail ou CPF..." : "Buscar administrador por nome ou e-mail..."} aria-label="Buscar usuário por nome ou e-mail" /></label>
          {aba === "Administradores" && formAberto && <form className="usuarios-admin-form" onSubmit={adicionarAdministrador}><label><span>Nome completo</span><input autoFocus required value={novoAdmin.nome} onChange={(event) => setNovoAdmin((atual) => ({ ...atual, nome: event.target.value }))} placeholder="Nome do administrador" /></label><label><span>E-mail</span><input required type="email" value={novoAdmin.email} onChange={(event) => setNovoAdmin((atual) => ({ ...atual, email: event.target.value }))} placeholder="nome@empresa.com" /></label>{erroAdmin && <p role="alert">{erroAdmin}</p>}<button type="submit">Cadastrar</button></form>}
          <div className="usuarios-table-wrap"><table className="usuarios-table"><thead><tr><th>{aba === "Clientes" ? "Cliente" : "Administrador"}</th><th>E-mail</th><th>{aba === "Clientes" ? "Última solicitação" : "Último acesso"}</th>{aba === "Clientes" && <><th>Status</th><th>Ações</th></>}</tr></thead>
            <tbody>{visiveis.map((usuario) => <tr key={usuario.email}><td><div className="usuarios-name"><span className="usuarios-avatar">{iniciais(usuario.nome)}</span><strong>{usuario.nome}</strong></div></td><td>{usuario.email}</td><td>{usuario.solicitacao}</td>{aba === "Clientes" && <><td><span className={`usuarios-badge ${usuario.status === "Concluída" ? "complete" : usuario.status === "Sem solicitação" ? "none" : "pending"}`}>{usuario.status === "Concluída" ? <Check size={11} /> : <Clock3 size={11} />}{usuario.status}</span></td><td><button type="button" className="usuarios-details" onClick={() => setSelecionado(usuario)}>Ver detalhes <ArrowRight size={12} /></button></td></>}</tr>)}
              {visiveis.length === 0 && <tr><td className="usuarios-empty" colSpan={aba === "Clientes" ? 5 : 3}>Nenhum usuário encontrado.</td></tr>}
            </tbody></table></div>
          <footer className="usuarios-pagination"><span>Mostrando {filtrados.length ? (paginaAtual - 1) * porPagina + 1 : 0}–{Math.min(paginaAtual * porPagina, filtrados.length)} de {filtrados.length} {aba.toLocaleLowerCase("pt-BR")}</span><div><button type="button" aria-label="Página anterior" disabled={paginaAtual <= 1} onClick={() => setPagina(paginaAtual - 1)}><ArrowLeft size={13} /></button>{Array.from({ length: totalPaginas }, (_, index) => index + 1).slice(0, 3).map((numero) => <button type="button" key={numero} aria-current={paginaAtual === numero ? "page" : undefined} className={paginaAtual === numero ? "current" : ""} onClick={() => setPagina(numero)}>{numero}</button>)}{totalPaginas > 3 && <><span>…</span><button type="button" onClick={() => setPagina(totalPaginas)}>{totalPaginas}</button></>}<button type="button" aria-label="Próxima página" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina(paginaAtual + 1)}><ArrowRight size={13} /></button></div></footer>
        </section>
      </section>
    </main>
      {selecionado && aba === "Clientes" && <div className="usuarios-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelecionado(null); }}><section className="usuarios-dialog" role="dialog" aria-modal="true" aria-labelledby="usuarios-dialog-title">
        <header className="usuarios-dialog-header"><h2 id="usuarios-dialog-title"><Package size={16} />Detalhes da Solicitação</h2><span className={`usuarios-badge ${selecionado.status === "Em andamento" ? "pending" : "complete"}`}>{selecionado.status}</span><button className="usuarios-close" type="button" aria-label="Fechar detalhes" onClick={() => setSelecionado(null)}><X size={17} /></button></header>
        <div className="usuarios-request-body">
          <section className="usuarios-detail-section"><h3>INFORMAÇÕES DO CLIENTE</h3><div className="usuarios-client"><span className="usuarios-client-avatar"><Users size={20} fill="currentColor" /></span><div><strong>{selecionado.nome}</strong><span>{selecionado.email}</span><span>{selecionado.telefone || "(11) 99999-9999"}</span></div></div></section>
          <section className="usuarios-detail-section"><h3>INFORMAÇÕES DA ENTREGA</h3><div className="usuarios-delivery-grid"><div><MapPin className="pin-origin" size={17} /><p><strong>Origem</strong><span>{selecionado.origem || "São Paulo, SP"}</span></p></div><div><MapPin className="pin-destination" size={17} /><p><strong>Destino</strong><span>{selecionado.destino || "Santo André, SP"}</span></p></div><div><CalendarDays className="pin-date" size={16} /><p><strong>Data da solicitação</strong><span>{selecionado.solicitacao}</span></p></div><div><Package className="pin-service" size={16} /><p><strong>Tipo de serviço</strong><span>{selecionado.servico || "Entrega expressa"}</span></p></div></div></section>
          <section className="usuarios-detail-section"><h3>MOTORISTA RESPONSÁVEL</h3><div className="usuarios-driver"><span className="usuarios-client-avatar"><Users size={20} fill="currentColor" /></span><div><strong>{selecionado.motorista || "Carlos Henrique"}</strong><span>Motorista • {selecionado.veiculo || "LT-2048"}</span></div><span className="usuarios-driver-status">Ativo</span></div></section>
          <section className="usuarios-detail-section usuarios-observations"><h3>OBSERVAÇÕES DO PEDIDO</h3><div><FileText size={16} /><p>{selecionado.detalhe}</p></div></section>
        </div>



        <button className="usuarios-modal-close-button" type="button" onClick={() => setSelecionado(null)}><X size={15} />Fechar</button>
      </section></div>}
    </div>
  );
}


