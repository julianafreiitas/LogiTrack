import { useState } from "react";

export default function Aside() {
    const [selecionado, setSelecionado] = useState(null); // Mover para dentro do componente

    return (
        <aside>
            <div className="img_logo">
                <img className="logo" src="/imagens/logo.png" alt="Logo da aplicação" />
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
    );
}