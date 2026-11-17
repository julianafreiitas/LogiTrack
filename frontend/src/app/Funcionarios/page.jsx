"use client";

import "./pageFuncionarios.css"


export default function Funcionarios() {
    return (
        <div className="conteiner-funcionario">
            <aside className="sidebar">

                <img className="logo" src="../imagens/logo_2.png" alt="" />

                <div className="btn_espaco">
                    <button className="btn">Home</button>
                    <button className="btn">Minhas Entregas</button>
                    <button className="btn">Mapa</button>
                    <button className="btn">Perfil</button>
                </div>
            </aside>

            <main className="dash">
                <header className="cabecalho">
                    {/* <input className="buscar" type="text" /> */}
                    <div className="space">
                        <div className="perfil">JF</div>
                        <h3>Juliana Freitas</h3>
                    </div>
                </header>

            </main>

        </div>
    );
}


