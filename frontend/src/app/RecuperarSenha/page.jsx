"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MailCheck,
} from "lucide-react";
import "./pageRecuperarSenha.css";

const ESPERA_REENVIO = 30; // segundos

function Marca() {
  return (
    <div className="recover-brand">
      <img src="/imagens/CAPA.png" alt="LogiTrack" />
    </div>
  );
}

/* Etapa 1: o usuário informa o e-mail e recebe o link */
function PedirLink() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [espera, setEspera] = useState(0);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  function enviar(e) {
    e?.preventDefault();


    console.log("Enviar link para:", email);

    setEnviado(true);
    setEspera(ESPERA_REENVIO);
  }

  if (enviado) {
    return (
      <>
        <div className="recover-icon" aria-hidden="true">
          <MailCheck size={30} />
        </div>
        <h1>Verifique seu e-mail</h1>
        <p className="recover-subtitle">
          Se <strong>{email}</strong> estiver cadastrado, você vai receber um link para
          criar uma nova senha. O link vale por 1 hora.
        </p>

        <button
          className="recover-secondary"
          type="button"
          onClick={enviar}
          disabled={espera > 0}
        >
          {espera > 0 ? `Reenviar e-mail em ${espera}s` : "Reenviar e-mail"}
        </button>

        <button
          className="recover-link-button"
          type="button"
          onClick={() => setEnviado(false)}
        >
          Usar outro e-mail
        </button>

        <p className="recover-hint">Não achou? Olhe também a caixa de spam.</p>
      </>
    );
  }

  return (
    <>
      <h1>Esqueceu a senha?</h1>
      <p className="recover-subtitle">
        Digite seu e-mail e enviaremos um link para você criar uma nova senha.
      </p>

      <form onSubmit={enviar}>
        <label htmlFor="recover-email">E-mail</label>
        <div className="recover-field">
          <Mail size={15} aria-hidden="true" />
          <input
            id="recover-email"
            type="email"
            autoComplete="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button className="recover-submit" type="submit">
          Enviar link
        </button>
      </form>
    </>
  );
}

function NovaSenha({ token }) {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);

  function redefinir(e) {
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


    console.log("Redefinir senha com token:", token);

    setConcluido(true);
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

        <button className="recover-submit" type="submit">
          Salvar nova senha
        </button>
      </form>
    </>
  );
}

function RecuperarSenha() {
  const params = useSearchParams();
  const token = params.get("token");

  return (
    <main className="recover-page">
      <section className="recover" aria-label="Recuperar senha">
        <Marca />

        {token ? <NovaSenha token={token} /> : <PedirLink />}

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

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RecuperarSenha />
    </Suspense>
  );
}
