"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  IdCard,
  LockKeyhole,
} from "lucide-react";
import { chamarApi } from "../lib/identificacao";
import "./pageRecuperarSenha.css";

function mascaraCpf(valor) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 3) return n;
  if (n.length <= 6) return `${n.slice(0, 3)}.${n.slice(3)}`;
  if (n.length <= 9) return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6)}`;
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}`;
}

function Marca() {
  return (
    <div className="recover-brand">
      <img src="/imagens/CAPA.png" alt="LogiTrack" />
    </div>
  );
}

/* Etapa 1: o usuário informa o CPF; se existir no banco, segue para a troca de senha */
function PedirCpf({ onVerificado }) {
  const [cpf, setCpf] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function verificar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const { token } = await chamarApi("/auth/cliente/recuperar/verificar", {
        method: "POST",
        body: JSON.stringify({ cpf }),
      });
      onVerificado(token);
    } catch (falha) {
      setErro(falha.message || "Não foi possível verificar o CPF.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <h1>Esqueceu a senha?</h1>
      <p className="recover-subtitle">
        Digite o CPF da sua conta para criar uma nova senha.
      </p>

      <form onSubmit={verificar}>
        <label htmlFor="recover-cpf">CPF</label>
        <div className="recover-field">
          <IdCard size={15} aria-hidden="true" />
          <input
            id="recover-cpf"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(mascaraCpf(e.target.value))}
            required
          />
        </div>

        {erro && (
          <p className="recover-erro" role="alert">
            {erro}
          </p>
        )}

        <button className="recover-submit" type="submit" disabled={carregando}>
          {carregando ? "Verificando..." : "Continuar"}
        </button>
      </form>
    </>
  );
}

function NovaSenha({ token, onVoltar }) {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erro, setErro] = useState("");
  const [expirou, setExpirou] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  async function redefinir(e) {
    e.preventDefault();
    setErro("");

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não são iguais.");
      return;
    }

    setCarregando(true);
    try {
      await chamarApi("/auth/cliente/recuperar/redefinir", {
        method: "POST",
        body: JSON.stringify({ token, senha }),
      });
      setConcluido(true);
    } catch (falha) {
      setErro(falha.message || "Não foi possível salvar a nova senha.");
      setExpirou(falha.status === 401);
    } finally {
      setCarregando(false);
    }
  }

  if (concluido) {
    return (
      <>
        <div className="recover-icon sucesso" aria-hidden="true">
          <CheckCircle2 size={30} />
        </div>
        <h1>Senha atualizada</h1>
        <p className="recover-subtitle">
          Sua senha foi alterada. Entre com a nova senha para continuar.
        </p>
        <Link className="recover-submit recover-submit-link" href="/login">
          Ir para o login
        </Link>
      </>
    );
  }

  return (
    <>
      <h1>Crie uma nova senha</h1>
      <p className="recover-subtitle">Escolha uma senha com pelo menos 6 caracteres.</p>

      <form onSubmit={redefinir}>
        <label htmlFor="recover-senha">Nova senha</label>
        <div className="recover-field">
          <LockKeyhole size={15} aria-hidden="true" />
          <input
            id="recover-senha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Digite a nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
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

        <label htmlFor="recover-confirmar">Confirmar nova senha</label>
        <div className="recover-field">
          <LockKeyhole size={15} aria-hidden="true" />
          <input
            id="recover-confirmar"
            type={mostrarConfirmar ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
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

        {erro && (
          <p className="recover-erro" role="alert">
            {erro}
          </p>
        )}

        {expirou && (
          <button className="recover-link-button" type="button" onClick={onVoltar}>
            Digitar o CPF novamente
          </button>
        )}

        <button className="recover-submit" type="submit" disabled={carregando}>
          {carregando ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </>
  );
}

export default function Page() {
  const [token, setToken] = useState(null);

  return (
    <main className="recover-page">
      <section className="recover" aria-label="Recuperar senha">
        <Marca />

        {token ? (
          <NovaSenha token={token} onVoltar={() => setToken(null)} />
        ) : (
          <PedirCpf onVerificado={setToken} />
        )}

        <div className="recover-back">
          <Link href="/login">
            <ArrowLeft size={14} aria-hidden="true" />
            Voltar para o login
          </Link>
        </div>
      </section>
    </main>
  );
}
