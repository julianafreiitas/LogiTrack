"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import "./page.css";

export default function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function entrar(e) {
    e.preventDefault();

    alert("Login será conectado ao backend!");
  }

  return (
    <main className="login-page">
      <section className="login" aria-label="Acesso à conta">
        <div className="centro">
          <img className="login-brand" src="/imagens/logotipo.png" alt="" />
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setSenha(e.target.value)}
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

          <button className="login-submit" type="submit">Entrar</button>
          <div className="cadastro">
            <p>Não possui uma conta? <a href="/Cadastro">Cadastre-se</a></p>
          </div>
        </form>
      </section>
    </main>
  );
}
