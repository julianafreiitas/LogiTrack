"use client";

import Aside from "../components/aside";
import "../Dash/pageDash.css";
import "./mapa.css";

export default function MapaFuncionarios() {
  return (
    <div className="dash-container container_mapa">
      <Aside variant="employee" />
      <main className="dash">
        <h1>Mapa</h1>
      </main>
    </div>
  );
}
