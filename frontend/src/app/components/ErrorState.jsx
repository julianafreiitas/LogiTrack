"use client";

import Link from "next/link";
import { ArrowLeft, CircleAlert, Home, PackageSearch, RefreshCw } from "lucide-react";
import Header from "./Header-usuarios";
import Footer from "./Footer-usuarios";
import "../Main-usuario/pagemain.css";
import "./errorState.css";

export default function ErrorState({ notFound = false, reset }) {
  const code = notFound ? "404" : "500";
  const Icon = notFound ? PackageSearch : CircleAlert;

  return (
    <div className="dash-container error-page-shell">
      <Header />
      <main className="error-page-content">
        <div className="error-card">
          <div className="error-illustration" aria-hidden="true">
            <span className="error-orbit orbit-one" />
            <span className="error-orbit orbit-two" />
            <span className="error-icon-wrap"><Icon size={54} strokeWidth={1.7} /></span>
            <strong>{code}</strong>
          </div>

          <div className="error-copy">
            <span className="error-eyebrow">LOGITRACK · CENTRAL DE AJUDA</span>
            <h1>{notFound ? "Não encontramos essa página" : "Algo deu errado"}</h1>
            <p>
              {notFound
                ? "O endereço pode estar incorreto ou a página foi movida. Você pode voltar ao portal e continuar acompanhando suas entregas."
                : "Tivemos um problema ao abrir esta página. Tente novamente ou volte ao portal para continuar."}
            </p>

            <div className="error-actions">
              {!notFound && typeof reset === "function" && (
                <button type="button" className="error-primary-action" onClick={reset}>
                  <RefreshCw size={17} /> Tentar novamente
                </button>
              )}
              <Link className={notFound ? "error-primary-action" : "error-secondary-action"} href="/Main-usuario">
                {notFound ? <Home size={17} /> : <ArrowLeft size={17} />}
                {notFound ? "Ir para o início" : "Voltar ao portal"}
              </Link>
            </div>
          </div>
        </div>

        <p className="error-help">Precisa de ajuda? Acesse o portal LogiTrack para consultar seus pedidos.</p>
      </main>
      <Footer />
    </div>
  );
}
