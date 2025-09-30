import { NavLink } from "react-router-dom";
import { FileText, Users, History, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Pedidos", url: "/", icon: FileText },
  { title: "Destinatários", url: "/destinatarios", icon: Users },
  { title: "Histórico", url: "/historico", icon: History },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-sidebar text-sidebar-foreground"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 z-40 border-r border-sidebar-border",
          isOpen ? "w-64" : "w-0 lg:w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <h1 className={cn(
              "font-bold text-xl transition-opacity duration-300",
              !isOpen && "lg:opacity-0"
            )}>
              NF-e System
            </h1>
            {!isOpen && (
              <p className="hidden lg:block text-sm font-bold text-center">NF</p>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1 py-6">
            <ul className="space-y-2 px-3">
              {menuItems.map((item) => (
                <li key={item.url}>
                  <NavLink
                    to={item.url}
                    end
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        "hover:bg-sidebar-accent",
                        isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                      )
                    }
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    <span className={cn(
                      "transition-opacity duration-300",
                      !isOpen && "lg:opacity-0 lg:hidden"
                    )}>
                      {item.title}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-sidebar-border">
            <p className={cn(
              "text-xs text-sidebar-foreground/60 transition-opacity duration-300",
              !isOpen && "lg:opacity-0"
            )}>
              © 2025 NF-e System
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
