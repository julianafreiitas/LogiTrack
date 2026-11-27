
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  MapPin,
  Flag,
  Calendar,
  Box,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle2,
  Wallet,
  Truck,
  Package,
  CreditCard
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import Header from "../components/Header-usuarios";
import { API_URL } from "../lib/api";
import { useIdentificacao } from "../lib/identificacao";
import "../Main-usuario/pagemain.css";
import "./SolicitarEntrega.css";

// Dados iniciais do formulário
const initialForm = {
  coleta: "",
  destino: "",
  data: "",
  servico: "",
  tamanho: "pequeno",
  pesoKg: "",
  urgencia: "normal",
  observacoes: "",
  pagamento: "pix",
  nomeCartao: "",
  numeroCartao: "",
  validadeCartao: "",
  cvvCartao: ""
};

// Formatação de valores em reais
function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// QR Code demonstrativo
function PixDemoQr({ seed }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <QRCodeSVG
        value={seed || "LOGITRACK-DEMO"}
        size={200}
      />
    </div>
  );
}

export default function SolicitarEntrega() {
  const router = useRouter();
  const cliente = useIdentificacao("cliente");
  const [formData, setFormData] = useState(initialForm);
  const [etapa, setEtapa] = useState(1);
  const [orcamento, setOrcamento] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [solicitacaoEnviada, setSolicitacaoEnviada] = useState(false);
  const [pixEmExibicao, setPixEmExibicao] = useState(false);
  const [pixSeed, setPixSeed] = useState("");
  const [pedidoCriado, setPedidoCriado] = useState(null);

  const finalizarPedido = useCallback(async () => {
    if (carregando || pedidoCriado) return;
    if (!cliente.id) {
      setErro(cliente.erro || "Não foi possível identificar o cliente. Confira se o backend está disponível.");
      setPixEmExibicao(false);
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      const response = await fetch(`${API_URL}/deliveries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: cliente.id,
          coleta: formData.coleta,
          destino: formData.destino,
          dataColeta: formData.data,
          servico: formData.servico,
          tamanho: formData.tamanho,
          pesoKg: Number(formData.pesoKg),
          urgencia: formData.urgencia,
          observacoes: formData.observacoes,
          valorFrete: orcamento?.total,
          distanciaKm: orcamento?.distanciaKm,
          pagamento: formData.pagamento,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.message || "Não foi possível registrar o pedido pago.");
      setPedidoCriado(data.data);
      setPixEmExibicao(false);
      setSolicitacaoEnviada(true);
    } catch (error) {
      console.log(error);
      
      setErro(error.message || "Falha ao registrar o pedido. Tente novamente.");
      setPixEmExibicao(false);
    } finally {
      setCarregando(false);
    }
  }, [carregando, pedidoCriado, cliente.id, cliente.erro, formData, orcamento, router]);

  // Simulação de confirmação do Pix após 5 segundos
  useEffect(() => {
    if (!pixEmExibicao) return undefined;

    const inicio = Date.now();

    const atualizador = setInterval(() => {
      const restante = Math.max(
        0,
        Math.ceil((5000 - (Date.now() - inicio)) / 1000)
      );

      if (restante === 0) {
        clearInterval(atualizador);
        setPixEmExibicao(false);
        finalizarPedido();
      }
    }, 150);

    return () => clearInterval(atualizador);
  }, [pixEmExibicao, finalizarPedido]);

  // Atualização dos campos
  const handleChange = (event) => {
    setFormData((atual) => ({
      ...atual,
      [event.target.name]: event.target.value
    }));
  };

  // Cálculo do orçamento pela API
  async function irParaPagamento(event) {
    event.preventDefault();

    setCarregando(true);
    setErro("");

    try {
      const response = await fetch(`${API_URL}/deliveries/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          coleta: formData.coleta,
          destino: formData.destino,
          servico: formData.servico,
          tamanho: formData.tamanho,
          pesoKg: Number(formData.pesoKg),
          urgencia: formData.urgencia
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível calcular o frete."
        );
      }

      setOrcamento(data);
      setEtapa(2);

    } catch (error) {
      setErro(
        error.message ||
        "Falha ao calcular o frete. Confira os endereços e tente novamente."
      );

    } finally {
      setCarregando(false);
    }
  }

  // Confirmação demonstrativa do pagamento
  function confirmarPagamento(event) {
    event.preventDefault();

    if (formData.pagamento === "pix") {
      setPixSeed(
        `PIX-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      );

      setPixEmExibicao(true);
      return;
    }

    finalizarPedido();
  }

  return (
    <div className="page-container request-page">

      <Header />

      <section className="banner request-hero-banner">
        <div className="banner-text">
          <span className="banner-label">
            PORTAL DO CLIENTE · LOGITRACK
          </span>

          <h1>Solicitar entrega</h1>

          <p>
            Preencha as informações abaixo para solicitar seu serviço de entrega.
          </p>
        </div>
      </section>

      <main className="request-main-content">

        {solicitacaoEnviada ? (

          // TELA DE PAGAMENTO CONCLUÍDO
          <section className="request-success-card" role="status">

            <CheckCircle2 size={48} />

            <h2>Pedido pago com sucesso!</h2>

            <p>
              Pagamento demonstrativo de{" "}
              <strong>{moeda(orcamento?.total)}</strong>{" "}
              confirmado via{" "}
              {formData.pagamento === "pix" ? "Pix" : "cartão"}.
            </p>

            {pedidoCriado && (
              <p className="request-tracking-code">
                Código de rastreamento: <strong>{pedidoCriado.codigoRastreio}</strong>
              </p>
            )}

            {pedidoCriado?.motoristaNome && <p className="request-tracking-code">Motorista responsável: <strong>{pedidoCriado.motoristaNome}</strong> · pedido aguardando início na aba Pendentes.</p>}

            <p className="request-demo-note">
              Esta confirmação é uma simulação. Nenhuma cobrança real foi realizada.
            </p>

            <button
              className="btn-submit"
              type="button"
              onClick={() => {
                if (pedidoCriado?.codigoRastreio) {
                  router.push(`/acompanharEntrega?codigo=${encodeURIComponent(pedidoCriado.codigoRastreio)}`);
                  return;
                }
                setSolicitacaoEnviada(false);
                setPixSeed("");
                setPedidoCriado(null);
                setEtapa(1);
              }}
            >
              {pedidoCriado ? "Acompanhar entrega" : "Voltar às solicitações"}
            </button>

          </section>

        ) : pixEmExibicao ? (

          // TELA DO QR CODE PIX
          <section className="request-pix-card" aria-live="polite">

            <div className="card-header-icon">
              <Wallet size={20} />
            </div>

            <h2>Escaneie para pagar via Pix</h2>

            <p>Valor do frete</p>

            <strong className="pix-amount">
              {moeda(orcamento?.total)}
            </strong>

            <PixDemoQr seed={pixSeed} />

            <p className="pix-countdown">
              Aguardando confirmação do pagamento...
            </p>

            <p className="request-demo-note">
              Este QR code é aleatório e não processa um pagamento real.
            </p>

          </section>

        ) : etapa === 1 ? (

          // ETAPA 1 - DADOS DA ENTREGA
          <div className="form-card">

            <div className="card-header">

              <div className="card-header-icon">
                <Box size={20} />
              </div>

              <div>
                <h2>Dados da Entrega</h2>
                <p>
                  Informe os endereços e as características do pacote.
                </p>
              </div>

            </div>

            <form onSubmit={irParaPagamento}>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    <MapPin size={16} /> Endereço de Coleta
                  </label>

                  <div className="input-wrapper">

                    <input
                      type="text"
                      name="coleta"
                      value={formData.coleta}
                      placeholder="Rua, número, cidade e estado"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />

                    <MapPin
                      size={16}
                      className="input-icon-right"
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    <Flag size={16} /> Endereço de Destino
                  </label>

                  <div className="input-wrapper">

                    <input
                      type="text"
                      name="destino"
                      value={formData.destino}
                      placeholder="Rua, número, cidade e estado"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />

                    <MapPin
                      size={16}
                      className="input-icon-right"
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    <Calendar size={16} /> Data Desejada para Coleta
                  </label>

                  <input
                    type="date"
                    name="data"
                    value={formData.data}
                    className="form-control"
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    <Truck size={16} /> Tipo de Serviço
                  </label>

                  <select
                    name="servico"
                    value={formData.servico}
                    className="form-control"
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Selecione o tipo de serviço
                    </option>

                    <option value="expressa">
                      Entrega Expressa
                    </option>

                    <option value="convencional">
                      Carga Convencional
                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    <Package size={16} /> Tamanho do pacote
                  </label>

                  <select
                    name="tamanho"
                    value={formData.tamanho}
                    className="form-control"
                    onChange={handleChange}
                    required
                  >
                    <option value="pequeno">Pequeno</option>
                    <option value="medio">Médio</option>
                    <option value="grande">Grande</option>
                  </select>

                </div>

                <div className="form-group">

                  <label>
                    <Box size={16} /> Peso aproximado (kg)
                  </label>

                  <input
                    type="number"
                    name="pesoKg"
                    value={formData.pesoKg}
                    min="0"
                    max="1000"
                    step="0.1"
                    className="form-control"
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    <Truck size={16} /> Urgência
                  </label>

                  <select
                    name="urgencia"
                    value={formData.urgencia}
                    className="form-control"
                    onChange={handleChange}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgente">Urgente</option>
                  </select>

                </div>

              </div>

              <div className="form-group">

                <label>
                  <MessageSquare size={16} /> Observações (opcional)
                </label>

                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  rows="3"
                  placeholder="Adicione informações extras sobre sua entrega..."
                  className="form-control"
                  onChange={handleChange}
                />

              </div>

              {erro && (
                <p className="request-error" role="alert">
                  {erro}
                </p>
              )}

              <div className="form-actions">

                <button
                  type="button"
                  className="btn-back"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft size={16} />
                  Voltar para início
                </button>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={carregando}
                >
                  {carregando ? (
                    "Calculando frete..."
                  ) : (
                    <>
                      Continuar para pagamento
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        ) : (

          // ETAPA 2 - RESUMO E PAGAMENTO
          <div className="form-card payment-card">

            <div className="card-header">

              <div className="card-header-icon">
                <CreditCard size={20} />
              </div>

              <div>
                <h2>Resumo e pagamento</h2>
                <p>
                  O valor é estimado com base na rota e nas opções selecionadas.
                </p>
              </div>

            </div>

            <div className="freight-summary">

              <div className="freight-route">

                <div>
                  <small>Coleta</small>
                  <strong>{formData.coleta}</strong>
                </div>

                <ArrowRight size={18} />

                <div>
                  <small>Destino</small>
                  <strong>{formData.destino}</strong>
                </div>

              </div>

              <div className="freight-lines">

                <div>
                  <span>Distância estimada pela rota</span>
                  <strong>{orcamento?.distanciaKm} km</strong>
                </div>

                <div>
                  <span>Taxa base</span>
                  <strong>{moeda(orcamento?.taxaBase)}</strong>
                </div>

                <div>
                  <span>
                    Distância ({orcamento?.distanciaKm} km × {moeda(orcamento?.valorPorKm)})
                  </span>

                  <strong>
                    {moeda(
                      (orcamento?.distanciaKm || 0) *
                      (orcamento?.valorPorKm || 0)
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Pacote ({formData.tamanho}, {formData.pesoKg} kg)
                  </span>

                  <strong>
                    {moeda(
                      (orcamento?.adicionalTamanho || 0) +
                      (orcamento?.adicionalPeso || 0)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Serviço e urgência</span>

                  <strong>
                    {formData.servico === "expressa"
                      ? "Expressa"
                      : "Convencional"}{" "}
                    ·{" "}
                    {formData.urgencia === "urgente"
                      ? "Urgente"
                      : "Normal"}
                  </strong>
                </div>

              </div>

              <div className="freight-total">

                <span>Total estimado do frete</span>

                <strong>
                  {moeda(orcamento?.total)}
                </strong>

              </div>

              <p className="freight-formula">
                Frete = (taxa base + km × valor por km + adicionais do pacote) × serviço × urgência.
              </p>

            </div>

            <form onSubmit={confirmarPagamento}>

              <fieldset className="payment-methods">

                <legend>Forma de pagamento</legend>

                <label
                  className={
                    formData.pagamento === "pix" ? "selected" : ""
                  }
                >

                  <input
                    type="radio"
                    name="pagamento"
                    value="pix"
                    checked={formData.pagamento === "pix"}
                    onChange={handleChange}
                  />

                  <Wallet size={18} />

                  <span>
                    <strong>Pix</strong>
                    <small>Pagamento instantâneo</small>
                  </span>

                </label>

                <label
                  className={
                    formData.pagamento === "cartao" ? "selected" : ""
                  }
                >

                  <input
                    type="radio"
                    name="pagamento"
                    value="cartao"
                    checked={formData.pagamento === "cartao"}
                    onChange={handleChange}
                  />

                  <CreditCard size={18} />

                  <span>
                    <strong>Cartão</strong>
                    <small>Crédito ou débito</small>
                  </span>

                </label>

              </fieldset>

              {formData.pagamento === "cartao" && (

                <fieldset className="card-payment-fields">

                  <legend>Dados do cartão</legend>

                  <div className="form-grid">

                    <div className="form-group card-field-full">

                      <label htmlFor="cardholder">
                        Nome impresso no cartão
                      </label>

                      <input
                        id="cardholder"
                        name="nomeCartao"
                        autoComplete="cc-name"
                        className="form-control"
                        placeholder="Como aparece no cartão"
                        required
                      />

                    </div>

                    <div className="form-group card-field-full">

                      <label htmlFor="card-number">
                        Número do cartão
                      </label>

                      <input
                        id="card-number"
                        name="numeroCartao"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        maxLength="19"
                        pattern="[0-9 ]{13,19}"
                        className="form-control"
                        placeholder="0000 0000 0000 0000"
                        required
                      />

                    </div>

                    <div className="form-group">

                      <label htmlFor="card-expiry">
                        Validade
                      </label>

                      <input
                        id="card-expiry"
                        name="validadeCartao"
                        type="month"
                        autoComplete="cc-exp"
                        className="form-control"
                        required
                      />

                    </div>

                    <div className="form-group">

                      <label htmlFor="card-cvc">
                        CVV
                      </label>

                      <input
                        id="card-cvc"
                        name="cvvCartao"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        maxLength="4"
                        pattern="[0-9]{3,4}"
                        className="form-control"
                        placeholder="123"
                        required
                      />

                    </div>

                  </div>

                </fieldset>

              )}

              {erro && <p className="request-error" role="alert">{erro}</p>}

              <p className="request-demo-note">
                Ambiente demonstrativo: não use dados reais do cartão. Nenhuma cobrança será realizada.
              </p>

              <div className="form-actions">

                <button
                  type="button"
                  className="btn-back"
                  onClick={() => {
                    setErro("");
                    setEtapa(1);
                  }}
                >
                  <ArrowLeft size={16} />
                  Voltar aos dados
                </button>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={carregando}
                >
                  {carregando ? "Registrando pedido..." : <Send size={16} />}

                  {!carregando && (formData.pagamento === "pix"
                    ? "Gerar QR Code Pix"
                    : "Confirmar pagamento")}

                </button>

              </div>

            </form>

          </div>

        )}

      </main>

      <footer className="footer-bar" />

    </div>
  );
}
