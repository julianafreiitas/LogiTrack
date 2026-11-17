"use client";

import "./pageFuncionarios.css"
import AsideMotorista from "../components/asideMotorista";


export default function Funcionarios() {
    return (
        <div className="conteiner-funcionario">
           <AsideMotorista />

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


