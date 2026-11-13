"use client";

import "./header.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const tipos = { admin: "Administrador", operador: "Operador" };

export default function Header() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  // Protege as páginas: sem token válido, volta para o login
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }
        const dados = await res.json();
        setUsuario(dados.usuario);
      })
      .catch(() => {});
  }, [router]);

  function sair() {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  const iniciais = usuario
    ? usuario.nome.split(" ").map((parte) => parte[0]).slice(0, 2).join("").toUpperCase()
    : "LT";

  return (
    <header className="topbar">
      <label className="search-box">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input type="search" placeholder="Buscar entrega ou destino..." aria-label="Buscar entrega ou destino" />
      </label>
      <div className="account">
        <div>
          <strong>{usuario ? usuario.nome : "Equipe de operações"}</strong>
          <span>{usuario ? tipos[usuario.tipo] : "Visão geral"}</span>
        </div>
        <div className="avatar" aria-label={`Perfil ${iniciais}`}>{iniciais}</div>
        <button type="button" className="logout" onClick={sair}>Sair</button>
      </div>
    </header>
  );
}
