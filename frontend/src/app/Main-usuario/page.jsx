
'use client'

import { useState } from "react";
import Header from "../components/Header-usuarios";
import Footer from "../components/Footer-usuarios";
import "./pagemain.css";
import {Truck, Package, Check, Clock4, Info } from "lucide-react";

const pedidos = [
  {
    codigo: "LT-2049",
    cidade: "Campinas, SP",
    status: "Em trânsito",
    tipo: "transito"
  },
  {
    codigo: "LT-2048",
    cidade: "São Paulo, SP",
    status: "Entregue",
    tipo: "entregue"
  },
  {
    codigo: "LT-2050",
    cidade: "Santos, SP",
    status: "Pendente",
    tipo: "pendente"
  }
];

export default function MainUsuario() {
  const [codigo, setCodigo] = useState("");
  const [mensagem, setMensagem] = useState("");

  function consultarEntrega(e) {
    e.preventDefault();

    if (!codigo.trim()) {
      setMensagem("Digite um código de rastreamento.");
      return;
    }

    // Aqui você poderá conectar sua API de rastreamento.
    setMensagem(
      `Código ${codigo.trim()} informado. Aguardando consulta ao sistema.`
    );
  }

  return (
    <div className="dash-container">
      <Header />

      <main className="main-content">

        {/* BANNER PRINCIPAL */}
        <section className="banner">
          <div className="banner-text">
            <span className="banner-label">
              PORTAL DO CLIENTE · LOGITRACK
            </span>

            <h1>
              Sua entrega, sempre à vista.
            </h1>

            <p>
              Consulte o trajeto, acompanhe cada etapa e
              encontre seus pedidos em um só lugar.
            </p>
          </div>

          
        </section>

        {/* ÁREA PRINCIPAL */}
        <section className="dashboard-grid">

          {/* RASTREAMENTO */}
          <div className="content-card tracking-card">
            <div className="card-heading">
              <div>
                <h2>Acompanhe sua entrega</h2>
                <p>
                  Digite um código demonstrativo, como LT-2049.
                </p>
              </div>
              <span className="card-icon"><Package/></span>
            </div>

            <form onSubmit={consultarEntrega}>
              <label htmlFor="codigo">
                Código de rastreamento
              </label>

              <div className="tracking-input-group">
                <input
                  id="codigo"
                  type="text"
                  placeholder="Ex: LT-2049"
                  value={codigo}
                  onChange={(e) => {
                    setCodigo(e.target.value);
                    setMensagem("");
                  }}
                />

                <button type="submit">
                  Consultar entrega
                </button>
              </div>

              {mensagem && (
                <p className="tracking-message" role="status">
                  {mensagem}
                </p>
              )}
            </form>

            <div className="tracking-help">
              <span><Info className="custom-icon2"/></span>
              Tenha seu código em mãos para consultar sua encomenda.
            </div>
          </div>

          {/* ÚLTIMOS PEDIDOS */}
          <div className="content-card orders-card">
            <div className="card-heading">
              <h2>Últimos pedidos</h2>
              <a href="/meus-pedidos">
                Ver todos
              </a>
            </div>

            <div className="orders-list">
              {pedidos.map((pedido) => (
                <div className="order-item" key={pedido.codigo}>
                  <div className="order-info">
                    <strong>{pedido.codigo}</strong>
                    <span>{pedido.cidade}</span>
                  </div>

                  <span className={`status-badge ${pedido.tipo}`}>
                    {pedido.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* INDICADORES */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue"><Truck/></div>
            <div>
              <span>Em trânsito</span>
              <strong>12</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green"><Check/></div>
            <div>
              <span>Entregues</span>
              <strong>28</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange"><Clock4 /></div>
            <div>
              <span>Pendentes</span>
              <strong>03</strong>
            </div>
          </div>

        </section>

        <Footer/>

      </main>
    </div>
  );
}
