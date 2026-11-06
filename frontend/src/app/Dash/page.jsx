"use client";

import styles from "./pageDash.css";
import { useState } from "react";


export default function Dash() {
    const [selecionado, setSelecionado] = useState(null);

    return (
        <body className="container">

            <main>
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

            </main>


        </body>
    )

}

