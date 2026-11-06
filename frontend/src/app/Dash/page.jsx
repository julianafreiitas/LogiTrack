"use client";

import Aside from "../components/aside";
import styles from "./pageDash.css";
import { Omega } from "lucide-react";


export default function Dash() {
   

    return (
        <div className="container">

           <Aside/>

            <main className="dash">
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
                <div className="conteudo">

                </div>
            </main>



        </div>
    )

}

