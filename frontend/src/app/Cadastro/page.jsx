"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  Phone,
  CreditCard,
  Truck,
  MapPin,
  Users,
  Briefcase,
} from "lucide-react";
import "./pageCadastro.css";

const TIPOS = [
  { valor: "cliente", rotulo: "Cliente", Icone: Users },
  { valor: "motorista", rotulo: "Motorista", Icone: Truck },
];

function mascaraTelefone(v) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

function mascaraCpf(v) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  return n
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function Cadastro() {
  const [tipo, setTipo] = useState("cliente");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmar: "",
    cpf: "",
    cnh: "",
    categoria_cnh: "",
    cidade_base: "",
    veiculo: "",
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erro, setErro] = useState("");

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function cadastrar(e) {
    e.preventDefault();
    setErro("");

    if (form.senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (form.senha !== form.confirmar) {
      setErro("As senhas não são iguais.");
      return;
    }

    const { confirmar, ...dados } = form;
    const payload = { tipo, ...dados };

    console.log("Enviar para o backend:", payload);
    alert("Cadastro será conectado ao backend!");
  }

  const ehMotorista = tipo === "motorista";

  return (
    <main className="register-page">
      <section className="register" aria-label="Criar conta">
        <div className="register-brand">
          <img src="/imagens/logo2.png" alt="" />
          <span>
            Logi<strong>Track</strong>
          </span>
        </div>
        <h1>Crie sua conta</h1>
        <p className="register-subtitle">Escolha como você vai usar o LogiTrack.</p>

        <div className="register-tipos" role="radiogroup" aria-label="Tipo de conta">
          {TIPOS.map(({ valor, rotulo, Icone }) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={tipo === valor}
              className={`register-tipo ${tipo === valor ? "ativo" : ""}`}
              onClick={() => setTipo(valor)}
            >
              <Icone size={18} aria-hidden="true" />
              {rotulo}
            </button>
          ))}
        </div>

        <form onSubmit={cadastrar}>
          <div className="register-grid">
            <div className="register-group full">
              <label htmlFor="reg-nome">Nome completo</label>
              <div className="register-field">
                <User size={15} aria-hidden="true" />
                <input
                  id="reg-nome"
                  type="text"
                  autoComplete="name"
                  placeholder="Digite seu nome"
                  value={form.nome}
                  onChange={(e) => atualizar("nome", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="register-group">
              <label htmlFor="reg-email">E-mail</label>
              <div className="register-field">
                <Mail size={15} aria-hidden="true" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Digite seu e-mail"
                  value={form.email}
                  onChange={(e) => atualizar("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="register-group">
              <label htmlFor="reg-telefone">Telefone</label>
              <div className="register-field">
                <Phone size={15} aria-hidden="true" />
                <input
                  id="reg-telefone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={(e) => atualizar("telefone", mascaraTelefone(e.target.value))}
                  required
                />
              </div>
            </div>

            {ehMotorista && (
              <>
                <div className="register-group">
                  <label htmlFor="reg-cpf">CPF</label>
                  <div className="register-field">
                    <CreditCard size={15} aria-hidden="true" />
                    <input
                      id="reg-cpf"
                      type="text"
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      value={form.cpf}
                      onChange={(e) => atualizar("cpf", mascaraCpf(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="register-group">
                  <label htmlFor="reg-cnh">CNH</label>
                  <div className="register-field">
                    <CreditCard size={15} aria-hidden="true" />
                    <input
                      id="reg-cnh"
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="Número da CNH"
                      value={form.cnh}
                      onChange={(e) => atualizar("cnh", e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>
                </div>

                <div className="register-group">
                  <label htmlFor="reg-categoria">Categoria da CNH</label>
                  <div className="register-field">
                    <CreditCard size={15} aria-hidden="true" />
                    <select
                      id="reg-categoria"
                      value={form.categoria_cnh}
                      onChange={(e) => atualizar("categoria_cnh", e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {["A", "B", "C", "D", "E"].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="register-group">
                  <label htmlFor="reg-cidade">Cidade base</label>
                  <div className="register-field">
                    <MapPin size={15} aria-hidden="true" />
                    <input
                      id="reg-cidade"
                      type="text"
                      placeholder="Ex.: Santo André"
                      value={form.cidade_base}
                      onChange={(e) => atualizar("cidade_base", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="register-group full">
                  <label htmlFor="reg-veiculo">Veículo</label>
                  <div className="register-field">
                    <Truck size={15} aria-hidden="true" />
                    <input
                      id="reg-veiculo"
                      type="text"
                      placeholder="Ex.: Caminhão baú – ABC1D23"
                      value={form.veiculo}
                      onChange={(e) => atualizar("veiculo", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="register-group">
              <label htmlFor="reg-senha">Senha</label>
              <div className="register-field">
                <LockKeyhole size={15} aria-hidden="true" />
                <input
                  id="reg-senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Crie uma senha"
                  value={form.senha}
                  onChange={(e) => atualizar("senha", e.target.value)}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="register-group">
              <label htmlFor="reg-confirmar">Confirmar senha</label>
              <div className="register-field">
                <LockKeyhole size={15} aria-hidden="true" />
                <input
                  id="reg-confirmar"
                  type={mostrarConfirmar ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  value={form.confirmar}
                  onChange={(e) => atualizar("confirmar", e.target.value)}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setMostrarConfirmar((v) => !v)}
                  aria-label={mostrarConfirmar ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {erro && (
            <p className="register-erro" role="alert">
              {erro}
            </p>
          )}

          <button className="register-submit" type="submit">
            Criar conta
          </button>

          <div className="register-login">
            <p>
              Já possui uma conta? <Link href="/login">Fazer login</Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}