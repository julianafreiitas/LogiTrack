"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Home,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import Header from "../components/Header-usuarios";
import Footer from "../components/Footer-usuarios";
import { chamarApi, useIdentificacao } from "../lib/identificacao";
import "../Main-usuario/pagemain.css";
import "./perfilCliente.css";

const DADOS_INICIAIS = {
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  nascimento: "",
  cep: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
};

const CAMPOS_PESSOAIS = [
  { id: "nome", label: "Nome completo", type: "text", icon: UserRound, autoComplete: "name" },
  { id: "email", label: "E-mail", type: "email", icon: Mail, autoComplete: "email" },
  { id: "telefone", label: "Telefone", type: "tel", icon: Phone, autoComplete: "tel" },
  { id: "cpf", label: "CPF", type: "text", icon: UserRound, autoComplete: "off" },
  { id: "nascimento", label: "Data de nascimento", type: "date", icon: CalendarDays, autoComplete: "bday" },
];

const CAMPOS_ENDERECO = [
  { id: "cep", label: "CEP", type: "text", autoComplete: "postal-code" },
  { id: "rua", label: "Rua / Avenida", type: "text", autoComplete: "address-line1" },
  { id: "numero", label: "Número", type: "text", autoComplete: "address-line2" },
  { id: "bairro", label: "Bairro", type: "text", autoComplete: "address-level3" },
  { id: "cidade", label: "Cidade", type: "text", autoComplete: "address-level2" },
  { id: "estado", label: "Estado", type: "text", autoComplete: "address-level1" },
];

export default function PerfilCliente() {
  const cliente = useIdentificacao("cliente");
  const [dados, setDados] = useState(DADOS_INICIAIS);
  const [salvo, setSalvo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!cliente.id) {
      if (cliente.erro) { setErro(cliente.erro); setCarregando(false); }
      return;
    }
    let cancelado = false;
    setCarregando(true);
    chamarApi(`/portal/cliente/${cliente.id}/perfil`)
      .then((perfil) => { if (!cancelado) setDados({ ...DADOS_INICIAIS, ...perfil }); })
      .catch((falha) => { if (!cancelado) setErro(falha.message); })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
  }, [cliente.id, cliente.erro]);

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setDados((atuais) => ({ ...atuais, [name]: value }));
    setSalvo(false);
  }

  async function salvar(event) {
    event.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      const resultado = await chamarApi(`/portal/cliente/${cliente.id}/perfil`, {
        method: "PUT",
        body: JSON.stringify(dados),
      });
      setDados({ ...DADOS_INICIAIS, ...resultado.perfil });
      setSalvo(true);
    } catch (falha) {
      setErro(falha.message);
      setSalvo(false);
    } finally {
      setSalvando(false);
    }
  }

  function renderCampos(campos) {
    return campos.map(({ id, label, type, icon: Icon, autoComplete }) => (
      <label className="client-profile-field" key={id} htmlFor={`client-${id}`}>
        <span>{label}</span>
        <div className="client-profile-input-wrap">
          {Icon && <Icon size={17} aria-hidden="true" />}
          <input
            id={`client-${id}`}
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

  const iniciais = dados.nome.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]?.toUpperCase()).join("");
  const endereco = [dados.rua, dados.numero, dados.bairro, dados.cidade, dados.estado]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="dash-container client-profile-shell">
      <Header />
      <main className="main-content client-profile-content">
        <section className="banner client-profile-banner">
          <div className="banner-text">
            <span className="banner-label">PORTAL DO CLIENTE · LOGITRACK</span>
            <h1>Meu <em>Perfil</em></h1>
            <p>Gerencie seus dados de contato e o endereço das suas entregas.</p>
          </div>
        </section>

        <section className="client-profile-layout" aria-label="Perfil do cliente">
          <aside className="client-profile-summary">
            <div className="client-profile-avatar">{iniciais || "CL"}</div>
            <span className="client-profile-status"><i /> Perfil do cliente</span>
            <h2>{dados.nome || "Seu nome"}</h2>
            <p className="client-profile-role">Cliente LogiTrack</p>
            <div className="client-profile-divider" />
            <div className="client-profile-summary-row"><Mail size={18} /><span>{dados.email || "Adicione seu e-mail"}</span></div>
            <div className="client-profile-summary-row"><Phone size={18} /><span>{dados.telefone || "Adicione seu telefone"}</span></div>
            <div className="client-profile-summary-row"><MapPin size={18} /><span>{endereco || "Adicione seu endereço"}</span></div>
            <div className="client-profile-summary-row"><Home size={18} /><span>CEP {dados.cep || "não informado"}</span></div>
          </aside>

          <form className="client-profile-form" onSubmit={salvar}>
            <div className="client-profile-form-heading">
              <div><span>MINHA CONTA</span><h2>Informações do cliente</h2><p>Mantenha seu contato e endereço de entrega atualizados.</p></div>
              {carregando && <span className="client-profile-saved">Carregando perfil...</span>}
              {salvo && <span className="client-profile-saved" role="status"><Check size={16} /> Alterações salvas</span>}
            </div>

            <section className="client-profile-section">
              <h3>Dados pessoais</h3>
              <div className="client-profile-fields personal-fields">{renderCampos(CAMPOS_PESSOAIS)}</div>
            </section>

            <section className="client-profile-section address-section">
              <h3>Endereço principal</h3>
              <div className="client-profile-fields">{renderCampos(CAMPOS_ENDERECO)}</div>
            </section>

            {erro && <p className="aviso-erro" role="alert">{erro}</p>}

            <div className="client-profile-form-footer">
              <p>Suas informações ficam salvas na sua conta.</p>
              <button type="submit" disabled={salvando || carregando || !cliente.id}><Save size={17} /> {salvando ? "Salvando..." : "Salvar alterações"}</button>
            </div>
          </form>
        </section>
        <Footer />
      </main>
    </div>
  );
}
