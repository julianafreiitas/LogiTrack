"use client";

import { useEffect, useState } from "react";
import { Boxes, Check, Clock3, Truck } from "lucide-react";
import Aside from "../components/aside";
import Header from "../components/header";
import "./pageDash.css";
import "../sharedDashboard.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const numero = (valor) => Number(valor).toLocaleString("pt-BR");
const percentual = (valor, total) => (total ? (valor / total) * 100 : 0).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function tempoAtras(minutos) {
  if (minutos < 60) return `há ${minutos} min`;
  if (minutos < 1440) return `há ${Math.floor(minutos / 60)} h`;
  return `há ${Math.floor(minutos / 1440)} d`;
}

// "2026-11-17" -> data local (sem deslocamento de fuso)
function dataDoDia(dia) {
  const [ano, mes, diaDoMes] = dia.split("-").map(Number);
  return new Date(ano, mes - 1, diaDoMes);
}

function DeliveriesChart({ dados }) {
  const maximo = Math.max(5, Math.ceil(Math.max(0, ...dados.map((item) => item.total)) / 5) * 5);
  const x = (i) => (dados.length > 1 ? 28 + (i * 300) / (dados.length - 1) : 28);
  const y = (valor) => 140 - (valor / maximo) * 110;
  const points = dados.map((item, i) => `${x(i).toFixed(1)},${y(item.total).toFixed(1)}`).join(" ");
  const rotulo = (item, i) => {
    const data = dataDoDia(item.dia);
    if (dados.length <= 7) return diasSemana[data.getDay()];
    return (dados.length - 1 - i) % 5 === 0 ? `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}` : "";
  };

  return (
    <svg className="line-chart" viewBox="0 0 360 170" role="img" aria-label="Entregas por dia no período selecionado">
      {[30, 52, 74, 96, 118, 140].map((linha, i) => (
        <g key={linha}>
          <line x1="28" y1={linha} x2="340" y2={linha} className="chart-grid" />
          <text x="2" y={linha + 3} className="chart-label">{Math.round((maximo * (5 - i)) / 5)}</text>
        </g>
      ))}
      {dados.length > 0 && <polygon points={`28,140 ${points} ${x(dados.length - 1).toFixed(1)},140`} className="chart-area" />}
      <polyline points={points} className="chart-line" />
      {dados.length <= 7 && dados.map((item, i) => <circle key={item.dia} cx={x(i)} cy={y(item.total)} r="2.6" className="chart-dot" />)}
      {dados.map((item, i) => (
        <text key={`rotulo-${item.dia}`} x={x(i)} y="158" textAnchor="middle" className="chart-label">{rotulo(item, i)}</text>
      ))}
    </svg>
  );
}

function StatusChart({ metricas }) {
  const { total, concluidas, emTransito, pendentes, atrasadas } = metricas;
  const circunferencia = 302;
  let acumulado = 0;
  const segmentos = [
    ["segment-complete", concluidas],
    ["segment-transit", emTransito],
    ["segment-pending", pendentes],
    ["segment-late", atrasadas],
  ].map(([classe, valor]) => {
    const comprimento = total ? (valor / total) * circunferencia : 0;
    const estilo = { strokeDasharray: `${Math.max(comprimento - (comprimento > 3 ? 2 : 0), 0)} ${circunferencia}`, strokeDashoffset: -acumulado };
    acumulado += comprimento;
    return [classe, estilo];
  });

  return (
    <div className="donut-wrap" role="img" aria-label={`Status das entregas: ${percentual(concluidas, total)}% concluídas, ${percentual(emTransito, total)}% em trânsito, ${percentual(pendentes, total)}% pendentes e ${percentual(atrasadas, total)}% atrasadas`}>
      <svg viewBox="0 0 120 120" className="donut-chart" aria-hidden="true">
        <circle className="donut-track" cx="60" cy="60" r="48" />
        {segmentos.map(([classe, estilo]) => <circle key={classe} className={`donut-segment ${classe}`} cx="60" cy="60" r="48" style={estilo} />)}
      </svg>
      <ul className="chart-legend">
        <li><i className="legend-complete" />Concluídas</li>
        <li><i className="legend-transit" />Em trânsito</li>
        <li><i className="legend-pending" />Pendentes</li>
        <li><i className="legend-late" />Atrasadas</li>
      </ul>
    </div>
  );
}

const resumoVazio = {
  metricas: { total: 0, concluidas: 0, emTransito: 0, pendentes: 0, atrasadas: 0, canceladas: 0, variacao: null },
  entregasPorDia: [],
  atualizacoes: [],
};

export default function Dash() {
  const [period, setPeriod] = useState("7 dias");
  const [resumo, setResumo] = useState(resumoVazio);
  const [carregado, setCarregado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const dias = parseInt(period, 10);

    fetch(`${apiUrl}/dashboard?periodo=${dias}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        setResumo(await res.json());
        setCarregado(true);
        setErro("");
      })
      .catch(() => setErro("Não foi possível carregar os dados do dashboard."));
  }, [period]);

  const { metricas: m, entregasPorDia, atualizacoes } = resumo;
  const valor = (n) => (carregado ? numero(n) : "—");
  const variacao = m.variacao === null ? "Sem período anterior para comparar" : `${m.variacao >= 0 ? "↑" : "↓"} ${Math.abs(m.variacao).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% em relação ao período anterior`;
  const metrics = [
    { label: "Total de entregas", value: valor(m.total), note: carregado ? variacao : "Carregando...", icon: Boxes, tone: "orange" },
    { label: "Concluídas", value: valor(m.concluidas), note: `${percentual(m.concluidas, m.total)}% do total de entregas`, icon: Check, tone: "green" },
    { label: "Em trânsito", value: valor(m.emTransito), note: "Acompanhamento ativo", icon: Truck, tone: "blue" },
    { label: "Atrasadas", value: valor(m.atrasadas), note: `${percentual(m.atrasadas, m.total)}% do total de entregas`, icon: Clock3, tone: "red" },
  ];
  const updates = atualizacoes.map((item) => ({ title: item.titulo, detail: `${item.cidade}, SP · ${tempoAtras(item.minutos)}`, tone: item.tom }));

  return (
    <div className="dash-container">
      <Aside />
      <main className="dash">
        <Header/>

        <section className="dashboard-content" aria-label="Visão geral das operações">
          <div className="dashboard-heading">
            <div>
              <p className="eyebrow">VISÃO GERAL / OPERAÇÕES</p>
              <h1>Dashboard</h1>
              <p className="subtitle">Acompanhe sua operação em tempo real</p>
              {erro && <p className="subtitle" role="alert">{erro}</p>}
            </div>
            <div className="period-switch" aria-label="Período do relatório">
              {["7 dias", "30 dias"].map((option) => (
                <button key={option} type="button" className={period === option ? "active" : ""} aria-pressed={period === option} onClick={() => setPeriod(option)}>{option}</button>
              ))}
            </div>
          </div>

          <section className="metric-grid" aria-label="Indicadores">
            {metrics.map(({ label, value, note, icon: Icon, tone }) => (
              <article className="metric-card" key={label}>
                <div className={`metric-icon ${tone}`}><Icon size={15} strokeWidth={2.2} /></div>
                <p className="metric-label">{label}</p>
                <strong className="metric-value">{value}</strong>
                <p className="metric-note">{note}</p>
              </article>
            ))}
          </section>

          <section className="charts-grid" aria-label="Gráficos de entregas">
            <article className="panel delivery-panel">
              <div className="panel-heading"><div><h2>Entregas por dia</h2><p>Volume de entregas no período selecionado</p></div><span className="chart-key"><i /> Entregas</span></div>
              <DeliveriesChart dados={entregasPorDia} />
            </article>
            <article className="panel status-panel">
              <div className="panel-heading"><div><h2>Status das entregas</h2><p>Distribuição atual da operação</p></div></div>
              <StatusChart metricas={m} />
            </article>
          </section>

          <section className="panel updates-panel">
            <div className="panel-heading"><div><h2>Atualizações recentes</h2><p>O que está acontecendo na operação</p></div></div>
            <div className="updates-grid">
              {updates.length === 0 && <article className="update-item orange"><strong>Nenhuma atualização recente</strong><span>{carregado ? "Sem movimentações registradas" : "Carregando..."}</span></article>}
              {updates.map((update) => <article className={`update-item ${update.tone}`} key={update.title}><strong>{update.title}</strong><span>{update.detail}</span></article>)}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
