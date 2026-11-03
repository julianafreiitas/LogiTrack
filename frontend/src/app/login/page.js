
"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function entrar(e) {
    e.preventDefault();

    alert("Login será conectado ao backend!");
  }

  return (
    <main className={styles.container}>

      <div className={styles.login}>

        <h1>Logi<span>Track</span></h1>

        <h2>Bem-vindo de volta!</h2>

        <p>Entre com suas credenciais para continuar.</p>

        <form onSubmit={entrar}>

          <label>E-mail</label>

          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Senha</label>

          <input
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <div className={styles.espaco}>
            <a href="">Esqueceu a senha?</a>
          </div>

          <button type="submit">
            Entrar
          </button>

          <button type="submit">
            Cadastrar
          </button>

        </form>

      </div>

    </main>
  );
}