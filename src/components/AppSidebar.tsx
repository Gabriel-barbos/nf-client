import { FileText, Users, History } from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Pedidos", url: "/", icon: FileText },
  { title: "Destinatários", url: "/destinatarios", icon: Users },
  { title: "Histórico", url: "/historico", icon: History },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-sidebar to-sidebar/95">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-8 mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-2 ring-primary/20 transition-all duration-200">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              {open && (
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight">NF-e System</span>
                  <span className="text-xs text-muted-foreground font-normal">Gestão de Notas</span>
                </div>
              )}
            </div>
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    className="transition-all duration-200 hover:translate-x-1"
                  >
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive 
                          ? "bg-primary/15 text-primary font-medium border-l-4 border-primary shadow-sm" 
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="transition-transform duration-200 group-hover:scale-110" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {open && (
          <div className="mt-auto px-4 py-6 border-t border-sidebar-border/50">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Sistema ativo</span>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}