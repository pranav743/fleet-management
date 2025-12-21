import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { logout, user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Fleet Management</h1>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
        <ModeToggle />
        <Button onClick={logout} variant="outline" size="sm">
          <LogOut className="h-4 w-4 lg:mr-2" />
          <span className="hidden lg:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
