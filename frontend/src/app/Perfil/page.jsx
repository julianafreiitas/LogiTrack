"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Check, IdCard, Mail, MapPin, Phone, Save, ShieldCheck, Truck, UserRound } from "lucide-react";
import Aside from "../components/aside";
import DeliveryBanner from "../components/DeliveryBanner";
import SeletorIdentificacao from "../components/SeletorIdentificacao";
import { chamarApi, useIdentificacao } from "../lib/identificacao";
import "../Dash/pageDash.css";
import "./perfil.css";

const DADOS_VAZIOS = { nome: "", email: "", telefone: "", cpf: "", nascimento: "", endereco: "", contatoEmergencia: "", matricula: "", cidade: "", veiculo: "", cnh: "", categoriaCnh: "", validadeCnh: "", situacao: "Inativo", status: "Disponível" };

const CAMPOS_PESSOAIS = [
  { id: "nome", label: "Nome completo", icon: UserRound, autoComplete: "name" },
  { id: "email", label: "E-mail", icon: Mail, type: "email", autoComplete: "email" },
  { id: "telefone", label: "Telefone", icon: Phone, type: "tel", autoComplete: "tel" },
  { id: "cpf", label: "CPF", icon: IdCard, autoComplete: "off" },
  { id: "nascimento", label: "Data de nascimento", icon: CalendarDays, type: "date", autoComplete: "bday" },
  { id: "endereco", label: "Endereço", icon: MapPin, autoComplete: "street-address" },
  { id: "contatoEmergencia", label: "Contato de emergência", icon: Phone, type: "tel", autoComplete: "off" },
];

const CAMPOS_PROFISSIONAIS = [
  { id: "matricula", label: "Matrícula", icon: IdCard, autoComplete: "off" },
  { id: "cidade", label: "Cidade base", icon: MapPin, autoComplete: "address-level2" },
  { id: "veiculo", label: "Veículo", icon: Truck },
  { id: "cnh", label: "CNH", icon: ShieldCheck, autoComplete: "off" },
  { id: "categoriaCnh", label: "Categoria da CNH", icon: ShieldCheck, autoComplete: "off" },
  { id: "validadeCnh", label: "Validade da CNH", icon: CalendarDays, type: "date", autoComplete: "off" },
];

export default function Perfil() {
  const motorista = useIdentificacao("motorista");
  const [dados, setDados] = useState(DADOS_VAZIOS);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const carregarPerfil = useCallback(async (id) => {
    if (!id) return;
    setCarregando(true);
    setErro("");
    setSucesso(false);
    setDados(DADOS_VAZIOS);
    try {
      const perfil = await chamarApi(`/portal/motorista/${id}/perfil`);
      setDados({ nome: perfil.nome ?? "", email: perfil.email ?? "", telefone: perfil.telefone ?? "", cpf: perfil.cpf ?? "", nascimento: perfil.dataNascimento ?? "", endereco: perfil.endereco ?? "", contatoEmergencia: perfil.contatoEmergencia ?? "", matricula: perfil.matricula ?? "", cidade: perfil.cidadeBase ?? "", veiculo: perfil.veiculo ?? "", cnh: perfil.cnh ?? "", categoriaCnh: perfil.categoriaCnh ?? "", validadeCnh: perfil.validadeCnh ?? "", situacao: perfil.situacao ?? "Inativo", status: perfil.status ?? "Disponível" });
      setSucesso(false);
    } catch (falha) { setErro(falha.message); }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => {
    if (motorista.id) carregarPerfil(motorista.id);
    else if (motorista.pronto) setCarregando(false);
  }, [motorista.id, motorista.pronto, carregarPerfil]);

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setDados((atuais) => ({ ...atuais, [name]: value }));
    setSucesso(false);
  }

  async function salvar(event) {
    event.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);
    try {
      const resposta = await chamarApi(`/portal/motorista/${motorista.id}/perfil`, { method: "PUT", body: JSON.stringify({ nome: dados.nome, email: dados.email, telefone: dados.telefone, cpf: dados.cpf, dataNascimento: dados.nascimento, endereco: dados.endereco, contatoEmergencia: dados.contatoEmergencia, cnh: dados.cnh, categoriaCnh: dados.categoriaCnh, validadeCnh: dados.validadeCnh }) });
      setDados((atuais) => ({ ...atuais, nome: resposta.nome ?? atuais.nome, email: resposta.email ?? atuais.email, telefone: resposta.telefone ?? atuais.telefone, cpf: resposta.cpf ?? atuais.cpf, nascimento: resposta.dataNascimento ?? "", endereco: resposta.endereco ?? "", contatoEmergencia: resposta.contatoEmergencia ?? "", matricula: resposta.matricula ?? atuais.matricula, cidade: resposta.cidadeBase ?? atuais.cidade, veiculo: resposta.veiculo ?? atuais.veiculo, cnh: resposta.cnh ?? atuais.cnh, categoriaCnh: resposta.categoriaCnh ?? atuais.categoriaCnh, validadeCnh: resposta.validadeCnh ?? "", situacao: resposta.situacao ?? atuais.situacao, status: resposta.status ?? atuais.status }));
      setSucesso(true);
    } catch (falha) { setErro(falha.message); }
    finally { setSalvando(false); }
  }

  function descartar() { carregarPerfil(motorista.id); }

  const iniciais = dados.nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

  function renderCampos(campos) {
    return campos.map(({ id, label, icon: Icon, type = "text", autoComplete }) => (
      <label className="profile-field" key={id} htmlFor={`profile-${id}`}>
        <span>{label}</span>
        <div className="profile-input-wrap">
          <Icon size={18} aria-hidden="true" />
          <input
            id={`profile-${id}`}
            name={id}
            type={type}
            autoComplete={autoComplete}
            value={dados[id]}
            readOnly={["matricula", "cidade", "veiculo"].includes(id)}
            onChange={atualizarCampo}
          />
        </div>
      </label>
    ));
  }

  return (
    <div className="dash-container profile-page-shell">
      <Aside variant="employee" />
      <main className="profile-page">
        <header className="profile-topbar">
          <div className="profile-breadcrumb">ÁREA DO MOTORISTA <span>/</span> PERFIL</div>
          <div className="profile-top-actions"><SeletorIdentificacao rotulo="Testando como" lista={motorista.lista} id={motorista.id} onChange={(novo) => motorista.escolher(novo)} /><div className="profile-top-user"><span>{iniciais || "--"}</span><strong>{dados.nome || "Motorista"}</strong></div></div>
        </header>

        <DeliveryBanner
          title="Meu Perfil"
          subtitle="Gerencie suas informações pessoais e profissionais."
          icon={UserRound}
        />
        {(erro || motorista.erro) && <p className="aviso-erro" role="alert">{erro || motorista.erro}</p>}
        {carregando && <p className="profile-feedback" role="status">Carregando perfil...</p>}
        {sucesso && <p className="profile-success" role="status">Perfil atualizado.</p>}

        <section className="profile-content" aria-label="Configurações do perfil">
          <article className="profile-summary-card">
            <div className="profile-large-avatar">{iniciais || "--"}</div>
            <span className={`profile-online ${dados.situacao.toLowerCase() === "inativo" ? "is-inactive" : ""}`}><i /> Motorista {dados.situacao.toLowerCase()}</span>
            <h2>{dados.nome || "Seu nome"}</h2>
            <p className="profile-role">Motorista LogiTrack</p>
            <div className="profile-summary-divider" />
            <div className="profile-summary-row"><Mail size={17} /><span>{dados.email || "Adicione seu e-mail"}</span></div>
            <div className="profile-summary-row"><Phone size={17} /><span>{dados.telefone || "Adicione seu telefone"}</span></div>
            <div className="profile-summary-row"><MapPin size={17} /><span>{dados.cidade || "Adicione sua cidade base"}</span></div>
            <div className="profile-summary-row"><Truck size={17} /><span>{dados.veiculo || "Adicione seu veículo"}</span></div>
            <div className="profile-summary-row"><IdCard size={17} /><span>Matrícula: {dados.matricula || "Não informada"}</span></div>
          </article>

          <form className="profile-form-card" onSubmit={salvar}>
            <div className="profile-form-heading">
              <div>
                <p className="profile-section-kicker">MINHA CONTA</p>
                <h2>Informações do perfil</h2>
                <p>Atualize seus dados de contato e trabalho.</p>
              </div>
              {sucesso && <span className="profile-saved-message" role="status"><Check size={16} /> Perfil atualizado.</span>}
            </div>

            <div className="profile-fields-section">
              <h3>Dados pessoais</h3>
              <div className="profile-fields-grid">{renderCampos(CAMPOS_PESSOAIS)}</div>
            </div>

            <div className="profile-fields-section professional">
              <h3>Informações profissionais</h3>
              <div className="profile-fields-grid">{renderCampos(CAMPOS_PROFISSIONAIS)}</div>
            </div>

            <div className="profile-form-footer">
              <p>Suas informações aparecem apenas no seu perfil.</p>
              <div>
                <button className="profile-cancel-button" type="button" onClick={descartar} disabled={carregando || salvando}>Descartar</button>
                <button className="profile-save-button" type="submit" disabled={carregando || salvando || !motorista.id}><Save size={17} /> {salvando ? "Salvando..." : "Salvar alterações"}</button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
