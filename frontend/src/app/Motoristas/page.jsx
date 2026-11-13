"use client";

import { useState } from "react";
import Aside from "../components/aside";
import Header from "../components/header";
import "./pageMotorista.css";


const deliveries = [
    { code: "LT-2048", destination: "São Paulo, SP", driver: "João Pereira", eta: "30 out · 10:30", status: "Entregue" },
    { code: "LT-2049", destination: "Campinas, SP", driver: "Ana Costa", eta: "30 out · 15:00", status: "Em trânsito" },
    { code: "LT-2050", destination: "Santos, SP", driver: "Pedro Alves", eta: "31 out · 11:00", status: "Pendente" },
    { code: "LT-2051", destination: "São Bernardo, SP", driver: "Marina Lima", eta: "30 out · 09:00", status: "Entregue" },
    { code: "LT-2052", destination: "Sorocaba, SP", driver: "Diego Ramos", eta: "29 out · 17:00", status: "Atrasada" },
    { code: "LT-2053", destination: "Jundiaí, SP", driver: "Carla Nunes", eta: "30 out · 18:00", status: "Em trânsito" },
];

const filteredDeliveries = deliveries;

export default function Motoristas() {
    return (
        <div className="dash-container">
            <Aside />
            <main className="dash">
                <Header />
                <section className="motorista-content" aria-label="Motoristas cadastrados">
                    <div className="motorista-title-row">
                        <div className="motorista-title">

                            <div>
                                <p className="eyebrow">OPERAÇÕES / MOTORISTAS</p>
                                <h1>Motoristas</h1>
                                <p className="subtitle">Gerencie os motoristas cadastrados.</p>
                            </div>

                            <div className="total-motoristas">
                                <p><strong>Total de motoristas:</strong> 2</p>
                            </div>
                        </div>
                    </div>

                    <div className="filtro_busca">
                        <div className="filtro_busca-row">
                            <input className="buscar" type="text" placeholder="Buscar motorista ou cidade..." />

                            <div className="filtro">
                                <button className="btn_cadastro">+</button>
                                
                                <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por status">
                                    {["Todos os status", "Entregue", "Em trânsito", "Pendente", "Atrasada"].map((option) => <option key={option}>{option}</option>)}
                                </select>

                            </div>

                        </div>

                        <div className="delivery-table-wrap">
                            <table className="delivery-table">
                                <thead><tr><th>Código</th><th>Destino</th><th>Motorista</th><th>Previsão</th><th>Status</th></tr></thead>
                                <tbody>
                                    {filteredDeliveries.map((delivery) => (
                                        <tr key={delivery.code}>
                                            <td className="delivery-code">{delivery.code}</td>
                                            <td>{delivery.destination}</td>
                                            <td>{delivery.driver}</td>
                                            <td>{delivery.eta}</td>
                                            <td><span className={`status-badge ${delivery.status.toLowerCase().replace(" ", "-")}`}>{delivery.status}</span></td>
                                        </tr>
                                    ))}
                                    {filteredDeliveries.length === 0 && <tr><td className="empty-state" colSpan="5">Nenhuma entrega encontrada.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>


                </section>
            </main>
        </div>
    )
}