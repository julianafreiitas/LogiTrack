"use client";

import { useEffect, useMemo, useState } from "react";
import Aside from "../components/aside";
import Header from "../components/header";
import "../Dash/pageDash.css";
import "./pageRotas.css";
import "../sharedDashboard.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Área do mapa exibida no iframe (mesmo bbox do OpenStreetMap abaixo)
const area = { minLng: -47.7, maxLng: -46.2, minLat: -24.2, maxLat: -22.5 };

// Converte latitude/longitude para as coordenadas do SVG (1000 x 600), com o norte para cima
function projetar(pontos) {
    return pontos
        .map(({ lat, lng }) => {
            const x = ((lng - area.minLng) / (area.maxLng - area.minLng)) * 1000;
            const y = ((area.maxLat - lat) / (area.maxLat - area.minLat)) * 600;
            return `${Math.round(x)},${Math.round(y)}`;
        })
        .join(" ");
}

export default function Rotas() {
    const [rotas, setRotas] = useState([]);
    const [rotaSelecionada, setRotaSelecionada] = useState(null);
    const [busca, setBusca] = useState("");
    const [erro, setErro] = useState("");

    useEffect(() => {
        fetch(`${apiUrl}/rotas`)
            .then(async (res) => {
                if (!res.ok) throw new Error();
                const dados = await res.json();
                const lista = dados.map((rota) => ({ ...rota, pontos: projetar(rota.pontos) }));
                setRotas(lista);
                setRotaSelecionada(lista[0] ?? null);
            })
            .catch(() => setErro("Não foi possível carregar as rotas."));
    }, []);

    const rotasFiltradas = useMemo(() => rotas.filter((rota) => `${rota.nome} ${rota.motorista}`.toLocaleLowerCase("pt-BR").includes(busca.trim().toLocaleLowerCase("pt-BR"))), [rotas, busca]);

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
                                    <button key={rota.id} type="button" className={`rota-card ${rotaSelecionada?.id === rota.id ? "is-active" : ""}`} onClick={() => setRotaSelecionada(rota)} aria-pressed={rotaSelecionada?.id === rota.id}>
                                        <span className="rota-card-copy"><strong>{rota.nome}</strong><small>{rota.motorista} &middot; {rota.distancia}</small></span>
                                        <span className="rota-active-label">&bull; {rota.status}</span>
                                    </button>
                                ))}
                                {rotasFiltradas.length === 0 && <p className="rotas-empty">{erro || "Nenhuma rota encontrada."}</p>}
                            </div>
                        </section>

                        <section className="map-panel" aria-label="Mapa de rotas">
                            <h2>Mapa de rotas</h2>
                            <p className="rotas-panel-description">Trajetos ilustrativos entre cidades paulistas</p>
                            <div className="route-map">
                                <iframe title="Mapa de rotas na regiao de Sao Paulo" src="https://www.openstreetmap.org/export/embed.html?bbox=-47.7%2C-24.2%2C-46.2%2C-22.5&layer=mapnik" loading="lazy" />
                                {rotaSelecionada && (
                                    <svg className="route-overlay" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
                                        <polyline points={rotaSelecionada.pontos} />
                                        <circle cx={rotaSelecionada.pontos.split(" ")[0].split(",")[0]} cy={rotaSelecionada.pontos.split(" ")[0].split(",")[1]} r="9" className="route-origin" />
                                        <circle cx={rotaSelecionada.pontos.split(" ").at(-1).split(",")[0]} cy={rotaSelecionada.pontos.split(" ").at(-1).split(",")[1]} r="10" className="route-destination" />
                                    </svg>
                                )}
                            </div>
                            {rotaSelecionada && <p className="map-caption">Trajeto demonstrativo de {rotaSelecionada.origem} at&eacute; {rotaSelecionada.destino}. O mapa representa uma simula&ccedil;&atilde;o visual.</p>}
                        </section>
                    </div>
                </section>
            </main>
        </div>
    );
}
