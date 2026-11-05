"use client";

import styles from "./pageDash.css";
import { useState } from "react";
import { Omega } from "lucide-react";


export default function Dash() {
    const [selecionado, setSelecionado] = useState(null);

    return (
        <body className="container">

            <main className="dash">
                <aside>
                    <div className="img_logo">
                        <img className="logo" src="/imagens/logo.png" alt="" />
                    </div>

                    <div className="area_botoes">
                        {["Dashboard", "Entregas", "Motoristas", "Rotas"].map((nome) => (
                            <button
                                key={nome}
                                className={`botao ${selecionado === nome ? "selecionado" : ""}`}
                                onClick={() => setSelecionado(nome)}
                            >
                                {nome}
                            </button>
                        ))}
                    </div>

                </aside>

                <div className="espaco">
                    <input className="buscar" type="text" placeholder="Buscar entrega ou destino..." />
                    <div className="box">
                        <div className="identifica">
                            <p>Equipe de operações</p>
                            <p className="infor">Visão geral</p>

                        </div>
                        <div className="perfil">
                            JF
                        </div>
                    </div>

            

                </div>

            </main>

        </body>
    )

}

