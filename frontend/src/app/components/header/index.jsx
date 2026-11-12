"use client";

import "./header.css";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Header() {
return(
    <header className="topbar">
    <label className="search-box">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input type="search" placeholder="Buscar entrega ou destino..." aria-label="Buscar entrega ou destino" />
    </label>
    <div className="account">
        <div><strong>Equipe de operações</strong><span>Visão geral</span></div>
        <div className="avatar" aria-label="Perfil LT">LT</div>
    </div>
</header>

)
}