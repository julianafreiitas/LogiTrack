
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  UserRound,
  Truck,
  LogOut,
  RotateCcwClock
} from "lucide-react";

const navigation = [
  { name: "Início", href: "/Main-usuario", icon: Home },
  { name: "Solicitar Entregas", href: "/solicitarEntrega", icon: Package},
  { name: "Acompanhar", href: "/acompanharEntrega", icon: Truck },
  { name: "Últimos Pedidos", href: "/Meus-Pedidos", icon: RotateCcwClock},
  { name: "Perfil", href: "/PerfilCliente", icon: UserRound },
];


export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header-users">

      {/* LOGO */}
      <Link
        className="brand"
        href="/Main-usuario"
        aria-label="LogiTrack início"
      >
        <img src="/imagens/CAPA.png" className="logo" alt="LogiTrack" />
      </Link>

      {/* NAVEGAÇÃO */}
      <nav className="area_botoes" aria-label="Menu principal">
        {navigation.map(({ name, href, icon: Icon }) => {
          const selected = pathname === href;

          return (
            <Link
              key={name}
              href={href}
              className={`botao ${selected ? "selecionado" : ""}`}
              aria-current={selected ? "page" : undefined}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>

      {/* PERFIL DO CLIENTE */}
      <div className="user-area">
        <div className="user-avatar">
          <UserRound size={17} />
        </div>

        <span>Olá, Cliente!</span>

        <Link className="user-logout" href="/login">
          <LogOut size={16} />
          <span>Sair</span>
        </Link>
      </div>

    </header>
  );
}
