"use client";

import { useState } from "react";
import { CalendarDays, Check, IdCard, Mail, MapPin, Phone, Save, ShieldCheck, Truck, UserRound } from "lucide-react";
import Aside from "../components/aside";
import DeliveryBanner from "../components/DeliveryBanner";
import "../Dash/pageDash.css";
import "./perfil.css";

const DADOS_INICIAIS = {
  nome: "Jo\u00e3o Silva",
  email: "joao.silva@logitrack.com",
  telefone: "(11) 98765-4321",
  cpf: "000.000.000-00",
  nascimento: "1990-05-18",
  endereco: "Rua das Flores, 123",
  contatoEmergencia: "(11) 90000-0000",
  matricula: "MOT-00428",
  cidade: "S\u00e3o Caetano do Sul, SP",
  veiculo: "Van 03 - Fiat Ducato",
  cnh: "00000000000",
  categoriaCnh: "AB",
  validadeCnh: "2028-11-20",
};

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
  const [dados, setDados] = useState(DADOS_INICIAIS);
  const [salvo, setSalvo] = useState(false);

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setDados((atuais) => ({ ...atuais, [name]: value }));
    setSalvo(false);
  }

  function salvar(event) {
    event.preventDefault();
    setSalvo(true);
  }

  function descartar() {
    setDados(DADOS_INICIAIS);
    setSalvo(false);
  }

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
          <div className="profile-top-user"><span>{iniciais || "JD"}</span><strong>{dados.nome}</strong></div>
        </header>

        <DeliveryBanner
          title="Meu Perfil"
          subtitle="Gerencie suas informações pessoais e profissionais."
          icon={UserRound}
        />

        <section className="profile-content" aria-label="Configurações do perfil">
          <article className="profile-summary-card">
            <div className="profile-large-avatar">{iniciais || "JD"}</div>
            <span className="profile-online"><i /> Motorista ativo</span>
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
              {salvo && <span className="profile-saved-message" role="status"><Check size={16} /> Alterações salvas</span>}
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
                <button className="profile-cancel-button" type="button" onClick={descartar}>Descartar</button>
                <button className="profile-save-button" type="submit"><Save size={17} /> Salvar alterações</button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
