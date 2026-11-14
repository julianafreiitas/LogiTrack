"use client";

import { useMemo, useState } from "react";
import Aside from "../components/aside";
import Header from "../components/header";
import "../Dash/pageDash.css";
import "./pageRotas.css";
import "../sharedDashboard.css";

const rotas = [
    { id: "rota-01", nome: "Rota 01 - S\u00e3o Paulo - Campinas", motorista: "Jo\u00e3o Pereira", distancia: "99 km", origem: "S\u00e3o Paulo", destino: "Campinas", pontos: "713,229 610,310 500,370 427,455" },
    { id: "rota-02", nome: "Rota 02 - S\u00e3o Paulo - Santos", motorista: "Pedro Alves", distancia: "72 km", origem: "S\u00e3o Paulo", destino: "Santos", pontos: "713,229 790,175 855,130 913,85" },
    { id: "rota-03", nome: "Rota 03 - S\u00e3o Paulo - Sorocaba", motorista: "Diego Ramos", distancia: "87 km", origem: "S\u00e3o Paulo", destino: "Sorocaba", pontos: "713,229 560,230 380,240 160,247" },
];

export default function Rotas() {
    const [rotaSelecionada, setRotaSelecionada] = useState(rotas[0]);
    const [busca, setBusca] = useState("");
    const rotasFiltradas = useMemo(() => rotas.filter((rota) => `${rota.nome} ${rota.motorista}`.toLocaleLowerCase("pt-BR").includes(busca.trim().toLocaleLowerCase("pt-BR"))), [busca]);

    return (
        <div className="dash-container">
            <Aside />
            <main className="dash">
                <Header searchPlaceholder="Buscar entrega ou destino..." onSearchChange={(event) => setBusca(event.target.value)} />
                <section className="rotas-content" aria-label="Rotas">
                    <div className="rotas-heading">
                        <p className="eyebrow">OPERA&Ccedil;&Otilde;ES / DESLOCAMENTO</p>
                        <h1>Rotas</h1>
                        <p className="subtitle">Explore trajetos demonstrativos no mapa.</p>
                    </div>

                    <div className="rotas-layout">
                        <section className="rotas-panel" aria-label="Rotas em destaque">
                            <h2>Rotas em destaque</h2>
                            <p className="rotas-panel-description">Selecione uma rota para visualizar seu trajeto</p>
                            <div className="rotas-list">
                                {rotasFiltradas.map((rota) => (
                                    <button key={rota.id} type="button" className={`rota-card ${rotaSelecionada.id === rota.id ? "is-active" : ""}`} onClick={() => setRotaSelecionada(rota)} aria-pressed={rotaSelecionada.id === rota.id}>
                                        <span className="rota-card-copy"><strong>{rota.nome}</strong><small>{rota.motorista} &middot; {rota.distancia}</small></span>
                                        <span className="rota-active-label">&bull; Ativa</span>
                                    </button>
                                ))}
                                {rotasFiltradas.length === 0 && <p className="rotas-empty">Nenhuma rota encontrada.</p>}
                            </div>
                        </section>

                        <section className="map-panel" aria-label="Mapa de rotas">
                            <h2>Mapa de rotas</h2>
                            <p className="rotas-panel-description">Trajetos ilustrativos entre cidades paulistas</p>
                            <div className="route-map">
                                <iframe title="Mapa de rotas na regiao de Sao Paulo" src="https://www.openstreetmap.org/export/embed.html?bbox=-47.7%2C-24.2%2C-46.2%2C-22.5&layer=mapnik" loading="lazy" />
                                <svg className="route-overlay" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
                                    <polyline points={rotaSelecionada.pontos} />
                                    <circle cx={rotaSelecionada.pontos.split(" ")[0].split(",")[0]} cy={rotaSelecionada.pontos.split(" ")[0].split(",")[1]} r="9" className="route-origin" />
                                    <circle cx={rotaSelecionada.pontos.split(" ").at(-1).split(",")[0]} cy={rotaSelecionada.pontos.split(" ").at(-1).split(",")[1]} r="10" className="route-destination" />
                                </svg>
                            </div>
                            <p className="map-caption">Trajeto demonstrativo de {rotaSelecionada.origem} at&eacute; {rotaSelecionada.destino}. O mapa representa uma simula&ccedil;&atilde;o visual.</p>
                        </section>
                    </div>
                </section>
            </main>
        </div>
    );
}
