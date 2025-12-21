import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Car, Users, Route, BarChart3, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/vehicles", label: "Vehicles", icon: Car },
  { path: "/drivers", label: "Drivers", icon: Users },
  { path: "/trips", label: "Trips", icon: Route },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 lg:relative lg:translate-x-0",
          isCollapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && <h2 className="text-lg font-semibold">Fleet Manager</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn("hidden lg:flex", isCollapsed && "mx-auto")}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
