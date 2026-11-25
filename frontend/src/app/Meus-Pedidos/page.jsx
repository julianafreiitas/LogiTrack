"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Package, PackageX, Truck, X } from "lucide-react";
import Header from "../components/Header-usuarios";
import { chamarApi, useIdentificacao } from "../lib/identificacao";
import "../Main-usuario/pagemain.css";
import "./ultimosPedidos.css";

export default function MeusPedidos() {
  const router = useRouter();
  const cliente = useIdentificacao("cliente");
  const [pedidos, setPedidos] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!cliente.id) {
      if (cliente.erro) { setErro(cliente.erro); setCarregando(false); }
      return;
    }
    let cancelado = false;
    chamarApi(`/portal/cliente/${cliente.id}/pedidos`)
      .then((dados) => { if (!cancelado) { setPedidos(dados); setErro(""); } })
      .catch((falha) => { if (!cancelado) setErro(falha.message); })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
  }, [cliente.id, cliente.erro]);

  function verDetalhes(pedido) {
    if (pedido.status === "Pendente" || pedido.status === "A Caminho") {
      router.push(`/acompanharEntrega?codigo=${encodeURIComponent(pedido.codigo)}`);
      return;
    }
    setSelecionado(pedido);
  }

  const dataFormatada = (valor) => valor ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(valor)) : "—";
  const valorFormatado = (valor) => valor == null ? "—" : Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

          {erro && <p className="aviso-erro" role="alert">{erro}</p>}
          {carregando && <p>Carregando histórico...</p>}
          {!carregando && !erro && pedidos.length === 0 && <p>Você ainda não realizou pedidos.</p>}

          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr><th>Código do Pedido</th><th>Data da Solicitação</th><th>Endereço de Entrega</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.codigo}>
                    <td data-label="Código do Pedido" className="orders-code">{pedido.codigo}</td>
                    <td data-label="Data da Solicitação">{dataFormatada(pedido.solicitadoEm)}</td>
                    <td data-label="Endereço de Entrega">{pedido.destino}</td>
                    <td data-label="Status">
                      <span className={`orders-status ${pedido.tipo}`}>
                        {pedido.status === "Entregue" ? <CheckCircle2 size={18} /> : pedido.status === "Cancelado" ? <PackageX size={18} /> : pedido.status === "A Caminho" ? <Truck size={18} /> : <Clock3 size={18} />}
                        {pedido.texto}
                      </span>
                    </td>
                    <td data-label="Ações">
                      <button className="orders-action" type="button" onClick={() => verDetalhes(pedido)}>
                        {pedido.status === "Cancelado" ? <PackageX size={16} /> : pedido.status === "A Caminho" || pedido.status === "Pendente" ? <Truck size={16} /> : <Package size={16} />}
                        Ver detalhes <ArrowRight size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      {selecionado && <div className="orders-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelecionado(null); }}>
        <section className="orders-detail-modal" role="dialog" aria-modal="true" aria-labelledby="orders-detail-title">
          <button type="button" className="orders-modal-close" aria-label="Fechar" onClick={() => setSelecionado(null)}><X size={19} /></button>
          <div className={`orders-modal-icon ${selecionado.status === "Cancelado" ? "cancelado" : "entregue"}`}>{selecionado.status === "Cancelado" ? <PackageX size={25} /> : <CheckCircle2 size={25} />}</div>
          <h2 id="orders-detail-title">{selecionado.status === "Cancelado" ? "Pedido cancelado" : "Entrega concluída"}</h2>
          <p className="orders-modal-subtitle">{selecionado.codigo} · {dataFormatada(selecionado.solicitadoEm)}</p>
          <dl className="orders-modal-data">
            <div><dt>Status</dt><dd>{selecionado.texto}</dd></div>
            <div><dt>Coleta</dt><dd>{selecionado.coleta || "—"}</dd></div>
            <div><dt>Destino</dt><dd>{selecionado.destino}</dd></div>
            <div><dt>Pacote</dt><dd>{selecionado.tamanho || "—"}, {selecionado.pesoKg ?? "—"} kg · {selecionado.servico || "—"}</dd></div>
            <div><dt>Coleta desejada</dt><dd>{selecionado.dataColeta ? dataFormatada(`${String(selecionado.dataColeta).slice(0, 10)}T12:00:00`) : "A combinar"} · {selecionado.urgencia || "Normal"}</dd></div>
            <div><dt>Frete / pagamento</dt><dd>{valorFormatado(selecionado.valorFrete)} · {selecionado.pagamento || "—"}</dd></div>
            {selecionado.observacoes && <div><dt>Observações</dt><dd>{selecionado.observacoes}</dd></div>}
          </dl>
          <button className="orders-modal-done" type="button" onClick={() => setSelecionado(null)}>Fechar</button>
        </section>
      </div>}
    </div>
  );
}
