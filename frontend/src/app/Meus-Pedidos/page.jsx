import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Package, Truck } from "lucide-react";
import Header from "../components/Header-usuarios";
import "../Main-usuario/pagemain.css";
import "./ultimosPedidos.css";

const pedidos = [
  { codigo: "#LT78452", data: "14/11/2026", endereco: "Rua das Flores, 123 - SP", status: "Entregue", tipo: "entregue" },
  { codigo: "#LT78449", data: "13/11/2026", endereco: "Av. Goiás, 456 - SP", status: "Em andamento", tipo: "andamento" },
  { codigo: "#LT78445", data: "12/11/2026", endereco: "Rua XV de Novembro, 321 - SP", status: "Em andamento", tipo: "andamento" },
];

export default function MeusPedidos() {
  return (
    <div className="dash-container orders-page-shell">
      <Header />
      <main className="orders-page-content">
        <section className="banner orders-hero-banner">
          <div className="banner-text">
            <span className="banner-label">PORTAL DO CLIENTE · LOGITRACK</span>
            <h1>Últimos pedidos</h1>
            <p>Acompanhe o histórico e o status das suas entregas.</p>
          </div>
        </section>
        <section className="orders-history-card">
          <h2>Seu histórico de entregas</h2>
          <p>Confira todos os seus pedidos realizados.</p>

          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr><th>Código do Pedido</th><th>Data da Solicitação</th><th>Endereço de Entrega</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.codigo}>
                    <td data-label="Código do Pedido" className="orders-code">{pedido.codigo}</td>
                    <td data-label="Data da Solicitação">{pedido.data}</td>
                    <td data-label="Endereço de Entrega">{pedido.endereco}</td>
                    <td data-label="Status">
                      <span className={`orders-status ${pedido.tipo}`}>
                        {pedido.tipo === "entregue" ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                        {pedido.status}
                      </span>
                    </td>
                    <td data-label="Ações">
                      <Link className="orders-action" href="/acompanharEntrega">
                        {pedido.tipo === "andamento" ? <Truck size={16} /> : <Package size={16} />}
                        Ver detalhes <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
