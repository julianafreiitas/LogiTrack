
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Home,
  Package,
  UserRound,
  Truck,
  MapPinHouse,
  LogOut,
  RotateCcwClock,
  ChevronDown
} from "lucide-react";

const navigation = [
  { name: "Início", href: "/Main-usuario", icon: Home },
  { name: "Solicitar Entregas", href: "/Solicitar-Entregas", icon: Package},
  { name: "Acompanhar", href: "/AcompanharEntrega", icon: Truck },
  { name: "Últimos Pedidos", href: "/Meus-Pedidos", icon: RotateCcwClock},
  { name: "Endereços", href: "/Enderecos", icon: MapPinHouse },
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
        <img src="/imagens/logo2.png" className="logo" />
        <span>Logi<strong>Track</strong></span>
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

        <ChevronDown size={14} />
      </div>

    </header>
  );
}
