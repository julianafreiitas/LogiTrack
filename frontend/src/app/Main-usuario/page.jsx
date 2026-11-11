'use client'

import SideBar from "../components/sideBar-usuarios";
import "./pagemain.css";

export default function MainUsuario() {


 return(
    <div className="dash-container">
    <SideBar />
    <main className="container py-5">
      <section className="banner p-4 p-md-5 mb-5 rounded-3">
        <h1 className="display-5 fw-bold">
          Acompanhe suas entregas em tempo real
        </h1>

        <p className="col-md-8 fs-5">
          Com a LogiTrack, você sempre fica por dentro 
          dos status de entrega dos seus pedidos.
        </p>
      </section>
      </main>
    </div>
 );
}
