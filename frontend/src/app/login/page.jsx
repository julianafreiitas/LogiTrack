"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./page.css";

export default function Login() {

  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const dados = await res.json();

      if (!res.ok) {
        setErro(dados.erro || "Não foi possível entrar.");
        return;
      }

      localStorage.setItem("token", dados.token);
      router.push("/Dash");
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">

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
              <a href="#">Esqueceu a senha?</a>
            </div>

            {erro && <p className="erro">{erro}</p>}

            <button type="submit" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
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
