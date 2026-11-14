"use client";

import "./header.css";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Header({ searchPlaceholder = "Buscar entrega ou destino...", onSearchChange }) {
return(
    <header className="topbar">
    <label className="search-box">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input type="search" placeholder={searchPlaceholder} aria-label={searchPlaceholder} onChange={onSearchChange} />
    </label>
    <div className="account">
        <div><strong>Equipe de operações</strong><span>Visão geral</span></div>
        <div className="avatar" aria-label="Perfil LT">LT</div>
    </div>
</header>

)
}
