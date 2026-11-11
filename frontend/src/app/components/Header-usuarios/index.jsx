
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
  ChevronDown
} from "lucide-react";

const navigation = [
  { name: "Início", href: "/Main-usuario", icon: Home },
  { name: "Acompanhar", href: "/AcompanharEntrega", icon: Truck },
  { name: "Meus Pedidos", href: "/Meus-Pedidos", icon: Package},
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
        <ArrowUpRight size={22} strokeWidth={3} />
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
