"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, Check, X, Eye, Pencil, Trash2, UserRoundX } from "lucide-react";
import Aside from "../components/aside";
import Header from "../components/header";
import "../Dash/pageDash.css";
import "./pageMotorista.css";
import "../sharedDashboard.css";

const opcoes = ["Toda a equipe", "Em rota", "Dispon\u00edvel", "Inativo"];
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

async function chamarApi(caminho, opcoes = {}) {
  const resposta = await fetch(`${apiUrl}${caminho}`, { headers: { "Content-Type": "application/json" }, ...opcoes });
  const dados = resposta.status === 204 ? null : await resposta.json().catch(() => null);
  if (!resposta.ok) throw new Error(dados?.erro || dados?.message || "Não foi possível concluir a operação.");
  return dados;
}

const formularioInicial = { nome: "", cpf: "", telefone: "", cnh: "", categoria: "", status: "Ativo", statusOperacional: "Dispon\u00edvel", cidade: "", veiculo: "", entregas: "0" };
const chaveMotorista = (motorista) => motorista.id || motorista.cpf || motorista.nome;
const categoriasCnh = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"];

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Toda a equipe");
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [erroCadastro, setErroCadastro] = useState("");
  const [erroLista, setErroLista] = useState("");

  useEffect(() => {
    chamarApi("/motoristas")
      .then(setMotoristas)
      .catch(() => setErroLista("Não foi possível carregar os motoristas."));
  }, []);

  useEffect(() => {
    if (!modalCadastroAberto && !detalhesAbertos) return undefined;
    const overflowAnterior = document.body.style.overflow;
    const fecharComEscape = (event) => {
      if (event.key === "Escape") {
        setModalCadastroAberto(false);
        setDetalhesAbertos(false);
        setModoEdicao(false);
        setConfirmandoExclusao(false);
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [modalCadastroAberto, detalhesAbertos]);

  const filteredDrivers = useMemo(() => motoristas.filter((motorista) => {
    const matchesStatus = status === "Toda a equipe" || motorista.status === status;
    const searchable = `${motorista.nome} ${motorista.cidade} ${motorista.veiculo}`.toLocaleLowerCase("pt-BR");
    return matchesStatus && searchable.includes(query.trim().toLocaleLowerCase("pt-BR"));
  }), [motoristas, query, status]);

  function atualizarFormulario(event) {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
    setErroCadastro("");
  }

  function fecharCadastro() {
    setModalCadastroAberto(false);
    setFormulario(formularioInicial);
    setErroCadastro("");
  }

  async function cadastrarMotorista(event) {
    event.preventDefault();
    try {
      const criado = await chamarApi("/motoristas", { method: "POST", body: JSON.stringify(formulario) });
      setMotoristas((atuais) => [criado, ...atuais]);
      setStatus("Toda a equipe");
      setQuery("");
      fecharCadastro();
    } catch (erro) {
      setErroCadastro(erro.message);
    }
  }

  function carregarFormulario(motorista) {
    setFormulario({
      ...formularioInicial,
      nome: motorista.nome || "",
      cpf: motorista.cpf || "",
      telefone: motorista.telefone || "",
      cnh: motorista.cnh || "",
      categoria: motorista.categoria || "",
      status: motorista.statusCadastro || (motorista.status === "Inativo" ? "Inativo" : "Ativo"),
      statusOperacional: motorista.status === "Inativo" ? "Dispon\u00edvel" : motorista.status,
      cidade: motorista.cidade || "",
      veiculo: motorista.veiculo || "",
      entregas: String(motorista.entregas ?? 0),
    });
  }

  function abrirDetalhes(motorista) {
    setMotoristaSelecionado(motorista);
    carregarFormulario(motorista);
    setErroCadastro("");
    setModoEdicao(false);
    setConfirmandoExclusao(false);
    setDetalhesAbertos(true);
  }

  function fecharDetalhes() {
    setDetalhesAbertos(false);
    setMotoristaSelecionado(null);
    setModoEdicao(false);
    setConfirmandoExclusao(false);
    setErroCadastro("");
  }

  function substituirMotorista(atualizado) {
    setMotoristas((atuais) => atuais.map((motorista) => motorista.id === atualizado.id ? atualizado : motorista));
    setMotoristaSelecionado(atualizado);
    carregarFormulario(atualizado);
  }

  async function salvarEdicaoMotorista(event) {
    event.preventDefault();
    if (!motoristaSelecionado) return;
    try {
      const atualizado = await chamarApi(`/motoristas/${motoristaSelecionado.id}`, { method: "PUT", body: JSON.stringify(formulario) });
      substituirMotorista(atualizado);
      setModoEdicao(false);
      setErroCadastro("");
    } catch (erro) {
      setErroCadastro(erro.message);
    }
  }

  async function alterarSituacao() {
    if (!motoristaSelecionado) return;
    const desativar = motoristaSelecionado.status !== "Inativo";
    const dados = { ...formulario, status: desativar ? "Inativo" : "Ativo", statusOperacional: desativar ? "Inativo" : "Disponível" };
    try {
      const atualizado = await chamarApi(`/motoristas/${motoristaSelecionado.id}`, { method: "PUT", body: JSON.stringify(dados) });
      substituirMotorista(atualizado);
    } catch (erro) {
      window.alert(erro.message);
    }
  }

  async function excluirMotorista() {
    if (!motoristaSelecionado) return;
    try {
      await chamarApi(`/motoristas/${motoristaSelecionado.id}`, { method: "DELETE" });
      setMotoristas((atuais) => atuais.filter((motorista) => motorista.id !== motoristaSelecionado.id));
      fecharDetalhes();
    } catch (erro) {
      window.alert(erro.message);
    }
  }

  function valorDetalhe(valor) {
    return valor === undefined || valor === null || valor === "" ? "N\u00e3o informado" : valor;
  }

  return (
    <div className="dash-container">
      <Aside />
      <main className="dash">
        <Header />
        <section className="motorista-content" aria-label="Motoristas cadastrados">
          <div className="motorista-heading-row">
            <div className="motorista-heading">
              <p className="eyebrow">EQUIPE / CAMPO</p>
              <h1>Motoristas</h1>
              <p className="subtitle">Conhe&ccedil;a a equipe respons&aacute;vel pelas entregas.</p>
            </div>
            <span className="motorista-count">{motoristas.length} motoristas na amostra</span>
          </div>

          <div className="motorista-filters">
            <label className="motorista-search">
              <Search size={14} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Buscar motorista ou cidade..." aria-label="Buscar motorista ou cidade" />
            </label>
            <button className="motorista-add-button" type="button" aria-label="Adicionar motorista" title="Adicionar motorista" onClick={() => { setFormulario(formularioInicial); setErroCadastro(""); setModalCadastroAberto(true); }}>+</button>
            <div className="motorista-status-dropdown">
              <button className="motorista-status-button" type="button" aria-haspopup="listbox" aria-expanded={filtroAberto} onClick={() => setFiltroAberto(!filtroAberto)}>
                {status}<ChevronDown size={15} className={filtroAberto ? "motorista-chevron is-open" : "motorista-chevron"} />
              </button>
              {filtroAberto && <div className="motorista-status-options" role="listbox" aria-label="Filtrar equipe">
                {opcoes.map((option) => <button key={option} className={`motorista-status-option ${status === option ? "is-selected" : ""}`} type="button" role="option" aria-selected={status === option} onClick={() => { setStatus(option); setFiltroAberto(false); }}>
                  {option}{status === option && <Check size={14} />}
                </button>)}
              </div>}
            </div>
          </div>

          <div className="motorista-table-wrap">
            <table className="motorista-list-table">
              <thead><tr><th>Motorista</th><th>Cidade-base</th><th>Ve&iacute;culo</th><th>Entregas hoje</th><th>Status</th></tr></thead>
              <tbody>
                {filteredDrivers.map((motorista) => <tr key={chaveMotorista(motorista)}>
                  <td><div className="motorista-name"><span className="motorista-avatar">{motorista.iniciais}</span><strong>{motorista.nome}</strong></div></td>
                  <td>{motorista.cidade}</td><td>{motorista.veiculo}</td><td>{motorista.entregas}</td>
                  <td><div className="motorista-status-cell">
                    <span className={`motorista-badge ${motorista.status === "Em rota" ? "em-rota" : motorista.status === "Dispon\u00edvel" ? "disponivel" : "inativo"}`}>{motorista.status}</span>
                    <button className="motorista-details-button" type="button" onClick={() => abrirDetalhes(motorista)} aria-label={`Ver detalhes de ${motorista.nome}`}><Eye size={15} /><span>Detalhes</span></button>
                  </div></td>
                </tr>)}
                {filteredDrivers.length === 0 && <tr><td className="motorista-empty" colSpan="5">{erroLista || "Nenhum motorista encontrado."}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {modalCadastroAberto && (
        <div className="motorista-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) fecharCadastro(); }}>
          <section className="motorista-modal" role="dialog" aria-modal="true" aria-labelledby="motorista-modal-title" aria-describedby="motorista-modal-description">
            <div className="motorista-modal-header">
              <h2 id="motorista-modal-title">Cadastrar novo motorista</h2>
              <button className="motorista-modal-close" type="button" aria-label="Fechar" onClick={fecharCadastro}><X size={20} /></button>
            </div>
            <p className="motorista-modal-description" id="motorista-modal-description">Preencha os dados para cadastrar um novo motorista no LogiTrack.</p>
            <form className="motorista-modal-form" onSubmit={cadastrarMotorista}>
              <label className="motorista-form-field motorista-form-full"><span>Nome completo</span><input autoFocus name="nome" value={formulario.nome} onChange={atualizarFormulario} placeholder="Digite o nome do motorista" autoComplete="name" required /></label>
              <label className="motorista-form-field"><span>CPF</span><input name="cpf" value={formulario.cpf} onChange={atualizarFormulario} placeholder="000.000.000-00" inputMode="numeric" maxLength={14} autoComplete="off" required /></label>
              <label className="motorista-form-field"><span>Telefone</span><input name="telefone" value={formulario.telefone} onChange={atualizarFormulario} placeholder="(00) 00000-0000" type="tel" inputMode="tel" maxLength={16} autoComplete="tel" required /></label>
              <label className="motorista-form-field motorista-form-full"><span>CNH</span><input name="cnh" value={formulario.cnh} onChange={atualizarFormulario} placeholder="N&uacute;mero da habilita&ccedil;&atilde;o" inputMode="numeric" maxLength={11} required /></label>
              <label className="motorista-form-field motorista-form-full">
                <span>Categoria da CNH</span>
                <span className="motorista-select-wrap"><select name="categoria" value={formulario.categoria} onChange={atualizarFormulario} required><option value="" disabled>Selecione a categoria</option>{categoriasCnh.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}</select><ChevronDown size={18} aria-hidden="true" /></span>
              </label>
              <label className="motorista-form-field motorista-form-full"><span>Status</span><select name="status" value={formulario.status} onChange={atualizarFormulario}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></label>
              {erroCadastro && <p className="motorista-form-error motorista-form-full" role="alert">{erroCadastro}</p>}
              <div className="motorista-modal-actions motorista-form-full"><button className="motorista-cancel-button" type="button" onClick={fecharCadastro}>Cancelar</button><button className="motorista-submit-button" type="submit">Cadastrar motorista</button></div>
            </form>
          </section>
        </div>
      )}

      {detalhesAbertos && motoristaSelecionado && (
        <div className="motorista-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) fecharDetalhes(); }}>
          <section className="motorista-modal motorista-detail-modal" role="dialog" aria-modal="true" aria-labelledby="motorista-detail-title">
            <div className="motorista-modal-header">
              <h2 id="motorista-detail-title">{modoEdicao ? "Editar motorista" : "Detalhes do motorista"}</h2>
              <button className="motorista-modal-close" type="button" aria-label="Fechar" onClick={fecharDetalhes}><X size={20} /></button>
            </div>
            {modoEdicao ? (
              <form className="motorista-modal-form" onSubmit={salvarEdicaoMotorista}>
                <label className="motorista-form-field motorista-form-full"><span>Nome completo</span><input name="nome" value={formulario.nome} onChange={atualizarFormulario} required /></label>
                <label className="motorista-form-field"><span>CPF</span><input name="cpf" value={formulario.cpf} onChange={atualizarFormulario} inputMode="numeric" maxLength={14} /></label>
                <label className="motorista-form-field"><span>Telefone</span><input name="telefone" value={formulario.telefone} onChange={atualizarFormulario} type="tel" inputMode="tel" maxLength={16} /></label>
                <label className="motorista-form-field"><span>CNH</span><input name="cnh" value={formulario.cnh} onChange={atualizarFormulario} inputMode="numeric" maxLength={11} /></label>
                <label className="motorista-form-field"><span>Categoria da CNH</span><select name="categoria" value={formulario.categoria} onChange={atualizarFormulario}><option value="">N&atilde;o informado</option>{categoriasCnh.map((categoria) => <option key={categoria}>{categoria}</option>)}</select></label>
                <label className="motorista-form-field"><span>Cidade-base</span><input name="cidade" value={formulario.cidade} onChange={atualizarFormulario} /></label>
                <label className="motorista-form-field"><span>Ve&iacute;culo</span><input name="veiculo" value={formulario.veiculo} onChange={atualizarFormulario} /></label>
                <label className="motorista-form-field"><span>Entregas hoje</span><input name="entregas" value={formulario.entregas} onChange={atualizarFormulario} type="number" min="0" step="1" /></label>
                <label className="motorista-form-field"><span>Situa&ccedil;&atilde;o cadastral</span><select name="status" value={formulario.status} onChange={atualizarFormulario}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></label>
                <label className="motorista-form-field motorista-form-full"><span>Status operacional</span><select name="statusOperacional" value={formulario.statusOperacional} onChange={atualizarFormulario}><option value="Em rota">Em rota</option><option value="Dispon\u00edvel">Dispon&iacute;vel</option><option value="Inativo">Inativo</option></select></label>
                {erroCadastro && <p className="motorista-form-error motorista-form-full" role="alert">{erroCadastro}</p>}
                <div className="motorista-modal-actions motorista-form-full"><button className="motorista-cancel-button" type="button" onClick={() => { carregarFormulario(motoristaSelecionado); setModoEdicao(false); setErroCadastro(""); }}>Cancelar</button><button className="motorista-submit-button" type="submit">Salvar altera&ccedil;&otilde;es</button></div>
              </form>
            ) : (
              <>
                <p className="motorista-modal-description">Dados cadastrais e informa&ccedil;&otilde;es da equipe.</p>
                <dl className="motorista-detail-grid">
                  <div><dt>Nome completo</dt><dd>{motoristaSelecionado.nome}</dd></div>
                  <div><dt>CPF</dt><dd>{valorDetalhe(motoristaSelecionado.cpf)}</dd></div>
                  <div><dt>Telefone</dt><dd>{valorDetalhe(motoristaSelecionado.telefone)}</dd></div>
                  <div><dt>CNH</dt><dd>{valorDetalhe(motoristaSelecionado.cnh)}</dd></div>
                  <div><dt>Categoria da CNH</dt><dd>{valorDetalhe(motoristaSelecionado.categoria)}</dd></div>
                  <div><dt>Cidade-base</dt><dd>{valorDetalhe(motoristaSelecionado.cidade)}</dd></div>
                  <div><dt>Ve&iacute;culo</dt><dd>{valorDetalhe(motoristaSelecionado.veiculo)}</dd></div>
                  <div><dt>Entregas hoje</dt><dd>{motoristaSelecionado.entregas ?? 0}</dd></div>
                  <div><dt>Situa&ccedil;&atilde;o cadastral</dt><dd>{motoristaSelecionado.statusCadastro || (motoristaSelecionado.status === "Inativo" ? "Inativo" : "Ativo")}</dd></div>
                  <div><dt>Status operacional</dt><dd><span className={`motorista-badge ${motoristaSelecionado.status === "Em rota" ? "em-rota" : motoristaSelecionado.status === "Dispon\u00edvel" ? "disponivel" : "inativo"}`}>{motoristaSelecionado.status}</span></dd></div>
                </dl>
                {confirmandoExclusao ? (
                  <div className="motorista-delete-confirm"><p>Excluir o cadastro de {motoristaSelecionado.nome}? Esta a&ccedil;&atilde;o n&atilde;o pode ser desfeita.</p><div><button className="motorista-cancel-button" type="button" onClick={() => setConfirmandoExclusao(false)}>Voltar</button><button className="motorista-delete-confirm-button" type="button" onClick={excluirMotorista}>Confirmar exclus&atilde;o</button></div></div>
                ) : (
                  <div className="motorista-detail-actions">
                    <button className="motorista-detail-edit" type="button" onClick={() => { carregarFormulario(motoristaSelecionado); setModoEdicao(true); }}><Pencil size={16} />Editar</button>
                    <button className="motorista-detail-toggle" type="button" onClick={alterarSituacao}><UserRoundX size={16} />{motoristaSelecionado.status === "Inativo" ? "Ativar motorista" : "Tornar inativo"}</button>
                    <button className="motorista-detail-delete" type="button" onClick={() => setConfirmandoExclusao(true)}><Trash2 size={16} />Excluir</button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
