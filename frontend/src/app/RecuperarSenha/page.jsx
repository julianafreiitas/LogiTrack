"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Fingerprint, LockKeyhole } from "lucide-react";
import { chamarApi } from "../lib/identificacao";
import "./pageRecuperarSenha.css";

function Marca() {
  return (
    <div className="recover-brand">
      <img src="/imagens/CAPA.png" alt="LogiTrack" />
    </div>
  );
}

function formatarCpf(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

export default function RecuperarSenha() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [token, setToken] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [etapa, setEtapa] = useState("cpf");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function validarCpf(evento) {
    evento.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const resposta = await chamarApi("/auth/cliente/recuperar-senha/cpf", {
        method: "POST",
        body: JSON.stringify({ cpf: cpf.replace(/\D/g, "") }),
      });
      setToken(resposta.token);
      setEtapa("senha");
    } catch (falha) {
      setErro(falha.message || "Não foi possível validar o CPF.");
    } finally {
      setCarregando(false);
    }
  }

  async function redefinirSenha(evento) {
    evento.preventDefault();
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
      await chamarApi("/auth/cliente/recuperar-senha/redefinir", {
        method: "POST",
        body: JSON.stringify({ token, senha }),
      });
      setEtapa("concluido");
    } catch (falha) {
      setErro(falha.message || "Não foi possível alterar a senha.");
      if (falha.status === 401) {
        setToken("");
        setEtapa("cpf");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="recover-page">
      <section className="recover" aria-label="Recuperar senha">
        <Marca />

        {etapa === "cpf" && (
          <>
            <h1>Esqueceu a senha?</h1>
            <p className="recover-subtitle">
              Informe o CPF cadastrado para criar uma nova senha.
            </p>
            <form onSubmit={validarCpf}>
              <label htmlFor="recover-cpf">CPF</label>
              <div className="recover-field">
                <Fingerprint size={16} aria-hidden="true" />
                <input
                  id="recover-cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Digite seu CPF"
                  value={cpf}
                  onChange={(evento) => setCpf(formatarCpf(evento.target.value))}
                  required
                />
              </div>
              {erro && <p className="recover-erro" role="alert">{erro}</p>}
              <button className="recover-submit" type="submit" disabled={carregando}>
                {carregando ? "Verificando CPF..." : "Continuar"}
              </button>
            </form>
          </>
        )}

        {etapa === "senha" && (
          <>
            <h1>Crie uma nova senha</h1>
            <p className="recover-subtitle">CPF validado. Escolha uma senha com pelo menos 6 caracteres.</p>
            <form onSubmit={redefinirSenha}>
              <label htmlFor="recover-senha">Nova senha</label>
              <div className="recover-field">
                <LockKeyhole size={15} aria-hidden="true" />
                <input
                  id="recover-senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Digite a nova senha"
                  value={senha}
                  onChange={(evento) => setSenha(evento.target.value)}
                  required
                />
                <button className="password-toggle" type="button" onClick={() => setMostrarSenha((valor) => !valor)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>
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
                  onChange={(evento) => setConfirmar(evento.target.value)}
                  required
                />
                <button className="password-toggle" type="button" onClick={() => setMostrarConfirmar((valor) => !valor)} aria-label={mostrarConfirmar ? "Ocultar senha" : "Mostrar senha"}>
                  {mostrarConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {erro && <p className="recover-erro" role="alert">{erro}</p>}
              <button className="recover-submit" type="submit" disabled={carregando}>
                {carregando ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          </>
        )}

        {etapa === "concluido" && (
          <>
            <div className="recover-icon sucesso" aria-hidden="true"><CheckCircle2 size={30} /></div>
            <h1>Senha atualizada</h1>
            <p className="recover-subtitle">Sua senha foi alterada. Entre com a nova senha para continuar.</p>
            <button className="recover-submit" type="button" onClick={() => router.push("/login")}>Ir para o login</button>
          </>
        )}

        {etapa !== "concluido" && (
          <div className="recover-back">
            <Link href="/login"><ArrowLeft size={14} aria-hidden="true" />Voltar para o login</Link>
          </div>
        )}
      </section>
    </main>
  );
}
