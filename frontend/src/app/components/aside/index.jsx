"use client";

import "./aside.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChartNoAxesColumnIncreasing, LayoutDashboard, LogOut, Map, Package, Users } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/Dash", icon: LayoutDashboard },
  { name: "Entregas", href: "/Entregas", icon: Package },
  { name: "Motoristas", href: "/Motoristas", icon: Users },
  { name: "Usuários", href: "/Usuarios", icon: Users },
  { name: "Rotas", href: "/Rotas", icon: Map }, 
  // { name: "Relatórios", icon: ChartNoAxesColumnIncreasing },
];

export default function Aside() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* <Link className="brand" href="/Dash" aria-label="LogiTrack início">
        <ArrowUpRight size={25} strokeWidth={3} />
        <span>Logi<strong>Track</strong></span>
      </Link> */}
      <div>
        <img className="logo" src="../imagens/logo_2.png" alt="" />
      </div>
      <p className="nav-label">MENU PRINCIPAL</p>
      <nav className="area_botoes" aria-label="Menu principal">
        {navigation.map(({ name, href, icon: Icon }) => {
          const selected = pathname === href;
          return (
            <Link key={name} href={href} className={`botao ${selected ? "selecionado" : ""}`} aria-current={selected ? "page" : undefined}>
              <Icon size={23} strokeWidth={1.8} />
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>
      <p className="sidebar-footer">LogiTrack &middot;</p>
      <a className="logout-button" href="/login">
        <LogOut size={19} strokeWidth={2} />
        <span>Sair</span>
      </a>
    </aside>
  );
}
