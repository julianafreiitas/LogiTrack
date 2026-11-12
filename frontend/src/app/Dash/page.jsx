"use client";

import { useState } from "react";
import { Boxes, Check, Clock3, Truck } from "lucide-react";
import Aside from "../components/aside";
import Header from "../components/header";
import "./pageDash.css";

const metrics = [
  { label: "Total de entregas", value: "1.284", note: "↑ 12,8% em relação ao período anterior", icon: Boxes, tone: "orange" },
  { label: "Concluídas", value: "986", note: "76,8% do total de entregas", icon: Check, tone: "green" },
  { label: "Em trânsito", value: "218", note: "Acompanhamento ativo", icon: Truck, tone: "blue" },
  { label: "Atrasadas", value: "12", note: "0,9% do total de entregas", icon: Clock3, tone: "red" },
];

const updates = [
  { title: "LT-2048 · Entrega concluída", detail: "São Paulo, SP · há 12 min", tone: "orange" },
  { title: "LT-2049 · Saiu para entrega", detail: "Campinas, SP · há 28 min", tone: "blue" },
  { title: "Rota 03 · Motorista a caminho", detail: "Santos, SP · há 41 min", tone: "green" },
];

function DeliveriesChart() {
  const points = "28,119 78,97 128,108 178,78 228,91 278,68 328,80";

  return (
    <svg className="line-chart" viewBox="0 0 360 170" role="img" aria-label="Entregas por dia: crescimento ao longo da semana">
      {[30, 52, 74, 96, 118, 140].map((y, i) => (
        <g key={y}>
          <line x1="28" y1={y} x2="340" y2={y} className="chart-grid" />
          <text x="2" y={y + 3} className="chart-label">{200 - i * 40}</text>
        </g>
      ))}
      <polygon points={`28,140 ${points} 328,140`} className="chart-area" />
      <polyline points={points} className="chart-line" />
      {points.split(" ").map((point) => {
        const [cx, cy] = point.split(",");
        return <circle key={point} cx={cx} cy={cy} r="2.6" className="chart-dot" />;
      })}
      {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => (
        <text key={day} x={28 + i * 50} y="158" textAnchor="middle" className="chart-label">{day}</text>
      ))}
    </svg>
  );
}

function StatusChart() {
  return (
    <div className="donut-wrap" role="img" aria-label="Status das entregas: 76,8% concluídas, 17% em trânsito, 4,8% pendentes e 1,4% atrasadas">
      <svg viewBox="0 0 120 120" className="donut-chart" aria-hidden="true">
        <circle className="donut-track" cx="60" cy="60" r="48" />
        <circle className="donut-segment segment-complete" cx="60" cy="60" r="48" />
        <circle className="donut-segment segment-transit" cx="60" cy="60" r="48" />
        <circle className="donut-segment segment-pending" cx="60" cy="60" r="48" />
        <circle className="donut-segment segment-late" cx="60" cy="60" r="48" />
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

export default function Dash() {
  const [period, setPeriod] = useState("7 dias");

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
              <DeliveriesChart />
            </article>
            <article className="panel status-panel">
              <div className="panel-heading"><div><h2>Status das entregas</h2><p>Distribuição atual da operação</p></div></div>
              <StatusChart />
            </article>
          </section>

          <section className="panel updates-panel">
            <div className="panel-heading"><div><h2>Atualizações recentes</h2><p>O que está acontecendo na operação</p></div></div>
            <div className="updates-grid">
              {updates.map((update) => <article className={`update-item ${update.tone}`} key={update.title}><strong>{update.title}</strong><span>{update.detail}</span></article>)}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
