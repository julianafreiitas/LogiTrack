"use client";

import { useEffect, useMemo, useState } from "react";
import Aside from "../components/aside";
import Header from "../components/header";
import "../Dash/pageDash.css";
import "./pageMotorista.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const classeStatus = { "Disponível": "disponivel", "Em rota": "em-rota", "Indisponível": "indisponivel" };

export default function Motoristas() {
    const [motoristas, setMotoristas] = useState([]);
    const [erro, setErro] = useState("");
    const [busca, setBusca] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch(`${apiUrl}/motoristas`, { headers: { Authorization: `Bearer ${token}` } })
            .then(async (res) => {
                if (!res.ok) throw new Error();
                setMotoristas(await res.json());
            })
            .catch(() => setErro("Não foi possível carregar os motoristas."));
    }, []);

    const filtrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");
        return motoristas.filter((m) => `${m.nome} ${m.veiculo} ${m.cidade}`.toLocaleLowerCase("pt-BR").includes(termo));
    }, [motoristas, busca]);

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
                                <p><strong>Total de motoristas:</strong> {motoristas.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="filtro_busca">
                        <input
                            className="buscar"
                            type="text"
                            placeholder="Buscar motorista..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />

                        <div className="filtro">
                            <button className="btn_cadastro">Cadastrar</button>

                        </div>

                        <div className="motorista-table-wrap">
                            <table className="motorista-table">
                                <thead><tr><th>Nome</th><th>Veículo</th><th>Cidade base</th><th>Entregas hoje</th><th>Status</th></tr></thead>
                                <tbody>
                                    {filtrados.map((m) => (
                                        <tr key={m.id}>
                                            <td>{m.nome}</td>
                                            <td>{m.veiculo}</td>
                                            <td>{m.cidade}</td>
                                            <td>{m.entregasHoje}</td>
                                            <td><span className={`motorista-status ${classeStatus[m.status]}`}>{m.status}</span></td>
                                        </tr>
                                    ))}
                                    {filtrados.length === 0 && <tr><td colSpan="5">{erro || "Nenhum motorista encontrado."}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </section>
            </main>
        </div>
    )
}
