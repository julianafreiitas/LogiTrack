"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, FileText, MapPin, Package, Plus, Search, ShieldCheck, Users, X } from "lucide-react";
import Aside from "../components/aside";
import Header from "../components/header";
import "../Dash/pageDash.css";
import "../sharedDashboard.css";
import "./pageUsuarios.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
const POR_PAGINA = 5;
const LISTA_VAZIA = { dados: [], total: 0, pagina: 1, totalPaginas: 1 };
const FORM_ADMIN_VAZIO = { nome: "", email: "", senha: "" };

function iniciais(nome) {
  return nome.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
}

function classeStatus(status) {
  if (status === "Concluída") return "complete";
  if (status === "Em andamento") return "pending";
  return "none";
}

async function lerJson(resposta) {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

export default function Usuarios() {
  const [aba, setAba] = useState("Clientes");
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [pagina, setPagina] = useState(1);
  const [lista, setLista] = useState(LISTA_VAZIA);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");
  const [recarregar, setRecarregar] = useState(0);
  const [resumo, setResumo] = useState({ totalUsuarios: 0, totalAdministradores: 0 });
  const [selecionado, setSelecionado] = useState(null);
  const [formAberto, setFormAberto] = useState(false);
  const [novoAdmin, setNovoAdmin] = useState(FORM_ADMIN_VAZIO);
  const [erroAdmin, setErroAdmin] = useState("");
  const [enviandoAdmin, setEnviandoAdmin] = useState(false);

  const carregarResumo = useCallback(async () => {
    try {
      const resposta = await fetch(`${API_URL}/usuarios/resumo`);
      if (!resposta.ok) throw new Error("Falha ao carregar o resumo");
      setResumo(await resposta.json());
    } catch {
      // Mantém os últimos números exibidos; a lista mostra o erro de conexão.
    }
  }, []);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  // Espera o usuário parar de digitar antes de consultar a API.
  useEffect(() => {
    const temporizador = setTimeout(() => setBuscaAplicada(busca.trim()), 300);
    return () => clearTimeout(temporizador);
  }, [busca]);

  useEffect(() => {
    const controlador = new AbortController();
    const rota = aba === "Clientes" ? "clientes" : "administradores";
    const parametros = new URLSearchParams({ pagina: String(pagina), porPagina: String(POR_PAGINA) });

    if (buscaAplicada) parametros.set("busca", buscaAplicada);

    setCarregando(true);
    setErroLista("");

    fetch(`${API_URL}/usuarios/${rota}?${parametros.toString()}`, { signal: controlador.signal })
      .then((resposta) => {
        if (!resposta.ok) throw new Error("Falha ao carregar a lista");
        return resposta.json();
      })
      .then((resultado) => {
        setLista(resultado);
        setCarregando(false);
      })
      .catch((erro) => {
        if (erro.name === "AbortError") return;
        setLista(LISTA_VAZIA);
        setErroLista("Não foi possível carregar os dados. Verifique se a API está no ar.");
        setCarregando(false);
      });

    return () => controlador.abort();
  }, [aba, buscaAplicada, pagina, recarregar]);

  const totalPaginas = Math.max(1, lista.totalPaginas);
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = lista.total ? (paginaAtual - 1) * POR_PAGINA + 1 : 0;
  const fim = Math.min(paginaAtual * POR_PAGINA, lista.total);

  function trocarAba(novaAba) {
    setAba(novaAba);
    setPagina(1);
    setBusca("");
    setBuscaAplicada("");
    setLista(LISTA_VAZIA);
    setFormAberto(false);
    setErroAdmin("");
  }

  async function abrirDetalhes(cliente) {
    try {
      const resposta = await fetch(`${API_URL}/usuarios/clientes/${cliente.id}/solicitacao`);
      if (!resposta.ok) throw new Error("Falha ao carregar a solicitação");
      setSelecionado(await resposta.json());
    } catch {
      setErroLista("Não foi possível carregar os detalhes da solicitação.");
    }
  }

  async function adicionarAdministrador(event) {
    event.preventDefault();
    setEnviandoAdmin(true);
    setErroAdmin("");

    try {
      const resposta = await fetch(`${API_URL}/usuarios/administradores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoAdmin),
      });
      const corpo = await lerJson(resposta);

      if (!resposta.ok) {
        setErroAdmin(corpo?.message || "Não foi possível cadastrar o administrador.");
        return;
      }

      setNovoAdmin(FORM_ADMIN_VAZIO);
      setFormAberto(false);
      setBusca("");
      setBuscaAplicada("");
      setPagina(1);
      setRecarregar((valor) => valor + 1);
      carregarResumo();
    } catch {
      setErroAdmin("Não foi possível conectar à API.");
    } finally {
      setEnviandoAdmin(false);
    }
  }

  const colunas = aba === "Clientes" ? 5 : 3;

  return (
    <div className="dash-container">
      <Aside />
      <main className="dash">
        <Header />
        <section className="usuarios-content" aria-label="Gerenciamento de usuários">
          <div className="usuarios-heading">
            <p className="eyebrow">VISÃO GERAL / USUÁRIOS</p>
            <h1>Gerenciamento de Usuários</h1>
            <p className="subtitle">Gerencie os clientes cadastrados e acompanhe suas solicitações de entrega.</p>
          </div>

          <section className="usuarios-metrics" aria-label="Resumo de usuários">
            <article className="usuarios-metric">
              <Users className="usuarios-metric-icon orange" size={25} fill="currentColor" />
              <div>
                <strong>{resumo.totalUsuarios}</strong>
                <span>Total de usuários</span>
              </div>
            </article>
            <article className="usuarios-metric">
              <ShieldCheck className="usuarios-metric-icon blue" size={26} />
              <div>
                <strong>{resumo.totalAdministradores}</strong>
                <span>Administradores cadastrados</span>
              </div>
            </article>
          </section>

          <div className="usuarios-tabs" role="tablist" aria-label="Tipo de usuário">
            {["Clientes", "Administradores"].map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={aba === item}
                className={aba === item ? "active" : ""}
                onClick={() => trocarAba(item)}
              >
                {item === "Clientes" ? <Users size={14} fill="currentColor" /> : <ShieldCheck size={14} />}
                {item}
              </button>
            ))}
          </div>

          <section className="usuarios-panel" aria-labelledby="usuarios-panel-title">
            <div className="usuarios-toolbar">
              <h2 id="usuarios-panel-title">{aba} cadastrados</h2>
              {aba === "Administradores" && (
                <button
                  className="usuarios-add-admin"
                  type="button"
                  onClick={() => {
                    setFormAberto((aberto) => !aberto);
                    setErroAdmin("");
                  }}
                >
                  <Plus size={17} />
                  Adicionar administrador
                </button>
              )}
            </div>

            <label className="usuarios-search">
              <Search size={14} aria-hidden="true" />
              <input
                type="search"
                value={busca}
                onChange={(event) => {
                  setBusca(event.target.value);
                  setPagina(1);
                }}
                placeholder={aba === "Clientes" ? "Buscar cliente por nome, e-mail ou CPF..." : "Buscar administrador por nome ou e-mail..."}
                aria-label="Buscar usuário por nome ou e-mail"
              />
            </label>

            {aba === "Administradores" && formAberto && (
              <form className="usuarios-admin-form" onSubmit={adicionarAdministrador}>
                <label>
                  <span>Nome completo</span>
                  <input
                    autoFocus
                    required
                    maxLength={100}
                    value={novoAdmin.nome}
                    onChange={(event) => setNovoAdmin((atual) => ({ ...atual, nome: event.target.value }))}
                    placeholder="Nome do administrador"
                  />
                </label>
                <label>
                  <span>E-mail</span>
                  <input
                    required
                    type="email"
                    maxLength={150}
                    value={novoAdmin.email}
                    onChange={(event) => setNovoAdmin((atual) => ({ ...atual, email: event.target.value }))}
                    placeholder="nome@empresa.com"
                  />
                </label>
                <label>
                  <span>Senha</span>
                  <input
                    required
                    type="password"
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    value={novoAdmin.senha}
                    onChange={(event) => setNovoAdmin((atual) => ({ ...atual, senha: event.target.value }))}
                    placeholder="Mínimo de 8 caracteres"
                  />
                </label>
                {erroAdmin && <p role="alert">{erroAdmin}</p>}
                <button type="submit" disabled={enviandoAdmin}>
                  {enviandoAdmin ? "Cadastrando..." : "Cadastrar"}
                </button>
              </form>
            )}

            <div className="usuarios-table-wrap">
              <table className="usuarios-table">
                <thead>
                  <tr>
                    <th>{aba === "Clientes" ? "Cliente" : "Administrador"}</th>
                    <th>E-mail</th>
                    <th>{aba === "Clientes" ? "Última solicitação" : "Último acesso"}</th>
                    {aba === "Clientes" && (
                      <>
                        <th>Status</th>
                        <th>Ações</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {lista.dados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <div className="usuarios-name">
                          <span className="usuarios-avatar">{iniciais(usuario.nome)}</span>
                          <strong>{usuario.nome}</strong>
                        </div>
                      </td>
                      <td>{usuario.email}</td>
                      <td>{(aba === "Clientes" ? usuario.ultimaSolicitacao : usuario.ultimoAcesso) || "—"}</td>
                      {aba === "Clientes" && (
                        <>
                          <td>
                            <span className={`usuarios-badge ${classeStatus(usuario.status)}`}>
                              {usuario.status === "Concluída" ? <Check size={11} /> : <Clock3 size={11} />}
                              {usuario.status}
                            </span>
                          </td>
                          <td>
                            <button type="button" className="usuarios-details" onClick={() => abrirDetalhes(usuario)}>
                              Ver detalhes <ArrowRight size={12} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {lista.dados.length === 0 && (
                    <tr>
                      <td className="usuarios-empty" colSpan={colunas}>
                        {carregando ? "Carregando..." : erroLista || "Nenhum usuário encontrado."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="usuarios-pagination">
              <span>
                Mostrando {inicio}–{fim} de {lista.total} {aba.toLocaleLowerCase("pt-BR")}
              </span>
              <div>
                <button type="button" aria-label="Página anterior" disabled={paginaAtual <= 1} onClick={() => setPagina(paginaAtual - 1)}>
                  <ArrowLeft size={13} />
                </button>
                {Array.from({ length: totalPaginas }, (_, indice) => indice + 1)
                  .slice(0, 3)
                  .map((numero) => (
                    <button
                      type="button"
                      key={numero}
                      aria-current={paginaAtual === numero ? "page" : undefined}
                      className={paginaAtual === numero ? "current" : ""}
                      onClick={() => setPagina(numero)}
                    >
                      {numero}
                    </button>
                  ))}
                {totalPaginas > 3 && (
                  <>
                    <span>…</span>
                    <button type="button" onClick={() => setPagina(totalPaginas)}>
                      {totalPaginas}
                    </button>
                  </>
                )}
                <button type="button" aria-label="Próxima página" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina(paginaAtual + 1)}>
                  <ArrowRight size={13} />
                </button>
              </div>
            </footer>
          </section>
        </section>
      </main>

      {selecionado && aba === "Clientes" && (
        <div
          className="usuarios-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelecionado(null);
          }}
        >
          <section className="usuarios-dialog" role="dialog" aria-modal="true" aria-labelledby="usuarios-dialog-title">
            <header className="usuarios-dialog-header">
              <h2 id="usuarios-dialog-title">
                <Package size={16} />
                Detalhes da Solicitação
              </h2>
              <span className={`usuarios-badge ${classeStatus(selecionado.status)}`}>{selecionado.status}</span>
              <button className="usuarios-close" type="button" aria-label="Fechar detalhes" onClick={() => setSelecionado(null)}>
                <X size={17} />
              </button>
            </header>

            <div className="usuarios-request-body">
              <section className="usuarios-detail-section">
                <h3>INFORMAÇÕES DO CLIENTE</h3>
                <div className="usuarios-client">
                  <span className="usuarios-client-avatar">
                    <Users size={20} fill="currentColor" />
                  </span>
                  <div>
                    <strong>{selecionado.nome}</strong>
                    <span>{selecionado.email}</span>
                    <span>{selecionado.telefone || "Telefone não informado"}</span>
                  </div>
                </div>
              </section>

              <section className="usuarios-detail-section">
                <h3>INFORMAÇÕES DA ENTREGA</h3>
                <div className="usuarios-delivery-grid">
                  <div>
                    <MapPin className="pin-origin" size={17} />
                    <p>
                      <strong>Origem</strong>
                      <span>{selecionado.origem || "Não informada"}</span>
                    </p>
                  </div>
                  <div>
                    <MapPin className="pin-destination" size={17} />
                    <p>
                      <strong>Destino</strong>
                      <span>{selecionado.destino || "Não informado"}</span>
                    </p>
                  </div>
                  <div>
                    <CalendarDays className="pin-date" size={16} />
                    <p>
                      <strong>Data da solicitação</strong>
                      <span>{selecionado.solicitacao || "—"}</span>
                    </p>
                  </div>
                  <div>
                    <Package className="pin-service" size={16} />
                    <p>
                      <strong>Tipo de serviço</strong>
                      <span>{selecionado.servico || "—"}</span>
                    </p>
                  </div>
                </div>
              </section>

              <section className="usuarios-detail-section">
                <h3>MOTORISTA RESPONSÁVEL</h3>
                <div className="usuarios-driver">
                  <span className="usuarios-client-avatar">
                    <Users size={20} fill="currentColor" />
                  </span>
                  {selecionado.motorista ? (
                    <>
                      <div>
                        <strong>{selecionado.motorista}</strong>
                        <span>Motorista • {selecionado.veiculo}</span>
                      </div>
                      <span className="usuarios-driver-status">{selecionado.motoristaStatus}</span>
                    </>
                  ) : (
                    <div>
                      <strong>Nenhum motorista atribuído</strong>
                      <span>Aguardando um motorista aceitar a entrega</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="usuarios-detail-section usuarios-observations">
                <h3>OBSERVAÇÕES DO PEDIDO</h3>
                <div>
                  <FileText size={16} />
                  <p>{selecionado.detalhe}</p>
                </div>
              </section>
            </div>

            <button className="usuarios-modal-close-button" type="button" onClick={() => setSelecionado(null)}>
              <X size={15} />
              Fechar
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
