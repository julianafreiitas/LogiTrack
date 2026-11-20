'use client'

import { useState, useMemo } from "react";
import Header from "../components/Header-usuarios";
import Footer from "../components/Footer-usuarios";
import "../Main-usuario/pagemain.css";   // ajuste o caminho se necessário
import "./pageMeusPedidos.css";
import { ChevronDown, SearchX } from "lucide-react";

const pedidos = [
  {
    codigo: "LT-2049",
    cidade: "Campinas, SP",
    status: "Em trânsito",
    tipo: "transito",
    origem: "São Paulo, SP",
    previsao: "20/11/2026",
    etapas: [
      { nome: "Pedido recebido", feito: true },
      { nome: "Coletado", feito: true },
      { nome: "Em trânsito", feito: true },
      { nome: "Entregue", feito: false }
    ]
  },
  {
    codigo: "LT-2048",
    cidade: "São Paulo, SP",
    status: "Entregue",
    tipo: "entregue",
    origem: "Santo André, SP",
    previsao: "15/11/2026",
    etapas: [
      { nome: "Pedido recebido", feito: true },
      { nome: "Coletado", feito: true },
      { nome: "Em trânsito", feito: true },
      { nome: "Entregue", feito: true }
    ]
  },
  {
    codigo: "LT-2050",
    cidade: "Santos, SP",
    status: "Pendente",
    tipo: "pendente",
    origem: "São Bernardo do Campo, SP",
    previsao: "A definir",
    etapas: [
      { nome: "Pedido recebido", feito: true },
      { nome: "Coletado", feito: false },
      { nome: "Em trânsito", feito: false },
      { nome: "Entregue", feito: false }
    ]
  }
];

export default function MeusPedidosUsuario() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [aberto, setAberto] = useState(null);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return pedidos.filter((p) => {
      const combinaTexto =
        !termo ||
        p.codigo.toLowerCase().includes(termo) ||
        p.cidade.toLowerCase().includes(termo);
      const combinaStatus = filtro === "todos" || p.tipo === filtro;
      return combinaTexto && combinaStatus;
    });
  }, [busca, filtro]);

  function alternar(codigo) {
    setAberto(aberto === codigo ? null : codigo);
  }

  return (
    <div className="dash-container">
      <Header />

      <main className="main-content">
        <section className="page-title">
          <span className="banner-label orders-label">SEUS PEDIDOS</span>
          <h1>Histórico de pedidos</h1>
          <p>Explore os pedidos demonstrativos e abra seus detalhes.</p>
        </section>

        <section className="content-card history-card">
          {/* FILTROS */}
          <div className="filters">
            <div className="field field-search">
              <label htmlFor="busca">Buscar pedido ou destino</label>
              <input
                id="busca"
                type="text"
                placeholder="Código ou cidade"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="field field-status">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="transito">Em trânsito</option>
                <option value="entregue">Entregue</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
          </div>

          {/* LISTA */}
          <div className="orders-list history-list">
            {filtrados.map((p) => {
              const isOpen = aberto === p.codigo;

              return (
                <div className="history-item" key={p.codigo}>
                  <button
                    type="button"
                    className="history-row"
                    onClick={() => alternar(p.codigo)}
                    aria-expanded={isOpen}
                    aria-controls={`detalhes-${p.codigo}`}
                  >
                    <div className="order-info">
                      <strong>{p.codigo}</strong>
                      <span>{p.cidade}</span>
                    </div>

                    <div className="history-right">
                      <span className={`status-badge ${p.tipo}`}>{p.status}</span>
                      <ChevronDown
                        size={16}
                        className={`history-chevron ${isOpen ? "open" : ""}`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="history-details" id={`detalhes-${p.codigo}`}>
                      <dl className="details-grid">
                        <div>
                          <dt>Origem</dt>
                          <dd>{p.origem}</dd>
                        </div>
                        <div>
                          <dt>Destino</dt>
                          <dd>{p.cidade}</dd>
                        </div>
                        <div>
                          <dt>Previsão de entrega</dt>
                          <dd>{p.previsao}</dd>
                        </div>
                      </dl>

                      <ol className="steps">
                        {p.etapas.map((e) => (
                          <li key={e.nome} className={e.feito ? "done" : ""}>
                            {e.nome}
                          </li>
                        ))}
                      </ol>

                      <a className="details-link" href="/AcompanharEntrega">
                        Acompanhar entrega
                      </a>
                    </div>
                  )}
                </div>
              );
            })}

            {filtrados.length === 0 && (
              <div className="empty-state">
                <SearchX size={28} />
                <strong>Nenhum pedido encontrado</strong>
                <span>Tente outro código, outra cidade ou limpe o filtro de status.</span>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}