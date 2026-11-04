"use client";

import styles from "./pageDaesh.css";

export default function Dash(){

    return (
        <body className="container">

            <main>
                <aside>
                    <div className="img_logo">
                        <img className="logo" src="/imagens/logo.png" alt="" />
                    </div>

                    <div className="area_botoes">
                    <button className="botao">Dashboard</button>
                    <button className="botao">Entregas</button>
                    <button className="botao">Motoristas</button>
                    <button className="botao">Rotas</button>
                    </div>
                    
                </aside>

            </main>

    
        </body>
    )

}

