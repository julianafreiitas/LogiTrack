"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { chamarApi, salvarSessaoAdmin, salvarSessaoCliente } from "../lib/identificacao";
import "./page.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const emailCadastrado = parametros.get("email");
    if (emailCadastrado) setEmail(emailCadastrado);
  }, []);

  async function entrar(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const opcoes = { method: "POST", body: JSON.stringify({ email, senha }) };
      let resultadoCliente = null;
      try {
        resultadoCliente = await chamarApi("/auth/cliente/login", opcoes);
      } catch (falhaCliente) {
        if (falhaCliente.status !== 401) throw falhaCliente;
      }

      if (resultadoCliente?.cliente) {
        salvarSessaoCliente(resultadoCliente.cliente, resultadoCliente.token);
        router.replace("/Main-usuario");
      } else {
        const resultadoAdmin = await chamarApi("/auth/login", opcoes);
        salvarSessaoAdmin(resultadoAdmin.usuario, resultadoAdmin.token);
        router.replace("/Dash");
      }
    } catch (falha) {
      setErro(falha.message || "Não foi possível entrar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login" aria-label="Acesso à conta">
        <div className="centro">
          <img className="login-brand" src="/imagens/Logotipo.png" alt="LogiTrack" />
        </div>
        <h1>Bem-vindo!</h1>
        <p className="login-subtitle">Faça login para continuar.</p>

        <form onSubmit={entrar}>
          <label htmlFor="login-email">E-mail</label>
          <div className="login-field">
            <Mail size={15} aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <label htmlFor="login-password">Senha</label>
          <div className="login-field">
            <LockKeyhole size={15} aria-hidden="true" />
            <input
              id="login-password"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setMostrarSenha((visivel) => !visivel)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="login-options">
            <a href="/RecuperarSenha">Esqueceu a senha?</a>
          </div>

          {erro && <p className="login-error" role="alert">{erro}</p>}
          <button className="login-submit" type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
          <div className="cadastro">
            <p>Não possui uma conta? <a href="/Cadastro">Cadastre-se</a></p>
          </div>
        </form>
      </section>
    </main>
  );
}
