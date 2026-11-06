
"use client";

import { createIcons, CircleUserRound, SquareUserRound } from 'lucide-react';
import { useState } from "react";
import styles from "./page.css";

export default function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function entrar(e) {
    e.preventDefault();

    alert("Login será conectado ao backend!");
  }

  return (
    <main className="container">

      <div className="marca">

        <div className="login">

          <h1>Logi<span>Track</span></h1>

          <h2>Bem-vindo de volta!</h2>

          <p>Entre com suas credenciais para continuar.</p>

          <form onSubmit={entrar}>

            <label>E-mail</label>

            {/* <CircleUserRound /> */}

            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />


            <label>Senha</label>

            <div className='senha'>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

            </div>


            <div className="espaco">
              <a href="">Esqueceu a senha?</a>
            </div>

            <button type="submit">
              Entrar
            </button>

            <div className="cadastro">
              <p>Não possui uma conta? <a href='#'> Cadastre-se</a></p>
            </div>


          </form>

        </div>

      </div>
    </main>
  );
}   