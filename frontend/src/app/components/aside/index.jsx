"use client";

import "./aside.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChartNoAxesColumnIncreasing, LayoutDashboard, Map, Package, Users } from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Entregas", icon: Package },
  { name: "Motoristas", icon: Users },
  { name: "Rotas", icon: Map , }, 
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
        {navigation.map(({ name, icon: Icon }) => {
          const href = name === "Dashboard" ? "/Dash" : `/${name}`;
          const selected = pathname === href;
          return (
            <Link key={name} href={href} className={`botao ${selected ? "selecionado" : ""}`} aria-current={selected ? "page" : undefined}>
              <Icon size={23} strokeWidth={1.8} />
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>
      <p className="sidebar-footer">LogiTrack · Painel demonstrativo</p>
    </aside>
  );
}
