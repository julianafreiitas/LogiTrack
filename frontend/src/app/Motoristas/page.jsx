"use client";

import { useState } from "react";
import Aside from "../components/aside";
import Header from "../components/header";
import "./pageMotorista.css";


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
                        <input className="buscar" type="text" placeholder="Buscar motorista..." />

                        <div className="filtro">
                            <button className="btn_cadastro">Cadastrar</button>

                        </div>

                        <div className="motorista-table-wrap">
                            <table className="motorista-table">
                                <thead><tr><th>Nome</th><th>Veículo</th><th>Placa</th><th>Status</th></tr></thead>
                                <tbody>
                                    {/* Aqui você pode mapear os motoristas cadastrados */}
                                    <tr><td>João Pereira</td><td>Caminhão</td><td>ABC-1234</td><td>Ativo</td></tr>
                                    <tr><td>Ana Costa</td><td>Van</td><td>XYZ-5678</td><td>Inativo</td></tr>
                                    {/* Adicione mais motoristas conforme necessário */}
                                </tbody>
                            </table>
                        </div>
                        </div>

                    
                </section>
            </main>
        </div>
    )
}