import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Building2, Users, FileText, Download,
  Settings, HelpCircle, ChevronLeft, ChevronRight, Shield
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { path: "/", label: "Visão Geral", icon: LayoutDashboard },
  { path: "/analise", label: "Análise por Pergunta", icon: BarChart3 },
  { path: "/empresas", label: "Comparação Empresas", icon: Building2 },
  { path: "/demografico", label: "Perfil Demográfico", icon: Users },
  { path: "/heatmap", label: "Heatmap Satisfação", icon: FileText },
  { path: "/relatorios", label: "Relatórios", icon: Download },
];

const bottomItems = [
  { path: "/configuracoes", label: "Configurações", icon: Settings },
  { path: "/ajuda", label: "Ajuda", icon: HelpCircle },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-sidebar-primary-foreground">PROART</h1>
            <p className="text-[10px] text-sidebar-foreground opacity-60">Dashboard Analítico</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <p className={cn("mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40", collapsed && "hidden")}>
          Menu
        </p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <div className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-ring" />
              )}
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="animate-fade-in">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border px-3 py-3 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="h-[18px] w-[18px]" /> : <ChevronLeft className="h-[18px] w-[18px]" />}
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
