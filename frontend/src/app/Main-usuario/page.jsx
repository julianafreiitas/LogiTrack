
'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header-usuarios";
import SeletorIdentificacao from "../components/SeletorIdentificacao";
import { chamarApi, useIdentificacao } from "../lib/identificacao";
import "./pagemain.css";
import {Truck, Package, Check, Clock4, Info } from "lucide-react";

export default function MainUsuario() {
  const router = useRouter();
  const cliente = useIdentificacao("cliente");
  const [codigo, setCodigo] = useState("");
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState("");
  const [erroCodigo, setErroCodigo] = useState("");
  const [consultando, setConsultando] = useState(false);

  useEffect(() => {
    if (!cliente.id) return;
    let cancelado = false;
    chamarApi(`/portal/cliente/${cliente.id}/resumo`)
      .then((dados) => { if (!cancelado) { setResumo(dados); setErro(""); } })
      .catch((falha) => { if (!cancelado) setErro(falha.message); });
    return () => { cancelado = true; };
  }, [cliente.id]);

  async function consultarEntrega(e) {
    e.preventDefault();
    const digitado = codigo.trim();
    setErroCodigo("");

    // sem código: abre a tela de acompanhamento vazia, como antes
    if (!digitado) {
      router.push("/acompanharEntrega");
      return;
    }

    setConsultando(true);
    try {
      const encontrado = await chamarApi(`/portal/cliente/rastreio/${encodeURIComponent(digitado)}`);
      router.push(`/acompanharEntrega?codigo=${encodeURIComponent(encontrado.codigo)}`);
    } catch (falha) {
      setErroCodigo(falha.status === 404 ? "Não encontramos nenhuma entrega com esse código." : falha.message);
    } finally {
      setConsultando(false);
    }
  }

  const dois = (valor) => (resumo ? String(valor).padStart(2, "0") : "–");
  const pedidos = resumo?.ultimosPedidos ?? [];

  return (
    <div className="dash-container home-page-shell">
      <Header />

      <main className="main-content">

        <div className="seletor-faixa">
          <SeletorIdentificacao rotulo="Testando como" lista={cliente.lista} id={cliente.id} onChange={(novo) => { cliente.escolher(novo); setResumo(null); }} />
        </div>
        {(erro || cliente.erro) && <p className="aviso-erro" role="alert">{erro || cliente.erro}</p>}

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

        {/* INDICADORES LOGO ABAIXO DO BANNER */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><Truck/></div>
            <div><span>Em trânsito</span><strong>{dois(resumo?.emTransito)}</strong></div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green"><Check/></div>
            <div><span>Entregues</span><strong>{dois(resumo?.entregues)}</strong></div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange"><Clock4 /></div>
            <div><span>Pendentes</span><strong>{dois(resumo?.pendentes)}</strong></div>
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
                  Digite o código de rastreio da sua entrega.
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
                  placeholder="Ex: ENT-10001"
                  value={codigo}
                  onChange={(e) => {
                    setCodigo(e.target.value);
                    setErroCodigo("");
                  }}
                />

                <button type="submit" disabled={consultando}>
                  {consultando ? "Consultando..." : "Consultar entrega"}
                </button>
              </div>
              {erroCodigo && <p className="aviso-erro" role="alert">{erroCodigo}</p>}

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
              <a href="/Meus-Pedidos">
                Ver todos
              </a>
            </div>

            <div className="orders-list">
              {resumo && pedidos.length === 0 && <p>Você ainda não tem pedidos.</p>}
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

      </main>
    </div>
  );
}
