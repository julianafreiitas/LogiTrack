"use client";

import "./aside.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Map, Package, Users } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/Dash", icon: LayoutDashboard },
  { name: "Entregas", href: "/Entregas", icon: Package },
  { name: "Motoristas", href: "/Motoristas", icon: Users },
  // { name: "Funcionários", href: "/Funcionarios", icon: Users },
  { name: "Usuários", href: "/Usuarios", icon: Users },
  { name: "Rotas", href: "/Rotas", icon: Map }, 
  // { name: "Relatórios", icon: ChartNoAxesColumnIncreasing },
];

const employeeNavigation = [
  { name: "Início", href: "/Funcionarios", icon: LayoutDashboard },
  { name: "Minhas Entregas", href: "/Entregas", icon: Package },
  { name: "Mapa", href: "/MapaFuncionarios", icon: Map },
];

export default function Aside({ variant = "default" }) {
  const pathname = usePathname();
  const items = variant === "employee" ? employeeNavigation : navigation;

  return (
    <aside className="sidebar">
      {/* <Link className="brand" href="/Dash" aria-label="LogiTrack início">
        <ArrowUpRight size={25} strokeWidth={3} />
        <span>Logi<strong>Track</strong></span>
      </Link> */}
      <div>
        <img className="logo" src="/imagens/logo_2.png" alt="LogiTrack" />
      </div>
      <p className="nav-label">MENU PRINCIPAL</p>
      <nav className="area_botoes" aria-label="Menu principal">
        {items.map(({ name, href, icon: Icon }) => {
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
      <Link className="logout-button" href="/login">
        <LogOut size={19} strokeWidth={2} />
        <span>Sair</span>
      </Link>
    </aside>
  );
}
