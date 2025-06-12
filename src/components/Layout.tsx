import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Library,
  Plus,
  Search,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  List,
  LogOut,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";

interface LayoutProps {
  children: React.ReactNode;
}

// Updated navigation without Profile
const navigation = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Library", href: "/library", icon: Library },
  { name: "My Lists", href: "/lists", icon: List },
  { name: "Add Media", href: "/add", icon: Plus },
  { name: "Explore", href: "/explore", icon: Search },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to log out");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold"
          onClick={() => mobile && setIsMobileOpen(false)}
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          {(!isCollapsed || mobile) && <span>MediaTracker</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => mobile && setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {(!isCollapsed || mobile) && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      {user && (
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  !isCollapsed || mobile ? "px-3" : "px-0 justify-center"
                )}
              >
                <UserAvatar size="sm" />
                {(!isCollapsed || mobile) && (
                  <span className="truncate text-sm">
                    {user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      user.email}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => (window.location.href = "/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark Mode
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          <SidebarContent />

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background p-0 shadow-md"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent mobile />
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                M
              </span>
            </div>
            <span>MediaTracker</span>
          </Link>

          {/* Mobile Theme Toggle and User Menu */}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <UserAvatar size="sm" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/profile")}
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    Appearance
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          "lg:pl-64", // Default desktop padding
          isCollapsed && "lg:pl-16" // Collapsed desktop padding
        )}
      >
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
