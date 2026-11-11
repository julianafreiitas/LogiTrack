"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChartNoAxesColumnIncreasing, Home, LayoutDashboard, LogOut, Map, Package, Users } from "lucide-react";

const navigation = [
  { name: "Inicio", icon: Home },
  { name: "Entregas", icon: Package },
  { name: "Meu Perfil", icon: Users },
  { name: "Sair", icon: LogOut },
  
];


export default function SideBar() {
    const pathname = usePathname();

    return(
        <aside className="sidebar-users">
        <Link className="brand" href="/Main-usuario" aria-label="LogiTrack início">
            <ArrowUpRight size={18} strokeWidth={3} />
            <span>Logi<strong>Track</strong></span>
        </Link>
        <p className="nav-label">MENU PRINCIPAL</p>
        <nav className="area_botoes" aria-label="Menu principal">
            {navigation.map(({ name, icon: Icon }) => {
            const href = name === "Inicio" ? "/Main-usuario" : `/${name}`;
            const selected = pathname === href;
            return (
                <Link key={name} href={href} className={`botao ${selected ? "selecionado" : ""}`} aria-current={selected ? "page" : undefined}>
                <Icon size={15} strokeWidth={1.8} />
                <span>{name}</span>
                </Link>
            );
            })}
        </nav>
        <p className="sidebar-footer">LogiTrack · Painel demonstrativo</p>
        </aside>
    );
}