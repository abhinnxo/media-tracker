
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"
import { Home, Library, Compass, User, LogOut, Sun, Moon, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface Props {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  const { user, signOut } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    // Close mobile menu when window is resized to desktop size
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  if (!isMounted) {
    return null
  }

  const menuItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: Compass, label: "Explore", href: "/explore" },
    { icon: Library, label: "Library", href: "/library" },
  ];

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full relative">
        {/* Mobile menu hamburger button */}
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu}
            className="rounded-full bg-background/70 backdrop-blur-sm border shadow-sm"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Sidebar - hidden on mobile by default, shown when mobileMenuOpen is true */}
        <div className={cn(
          "fixed inset-0 z-40 lg:relative lg:z-auto",
          !mobileMenuOpen && "hidden lg:block",
          mobileMenuOpen && "lg:block"
        )}>
          <div 
            className="absolute inset-0 bg-black/50 lg:hidden"
            onClick={toggleMobileMenu}
          />
          <Sidebar className="h-full z-50">
            <SidebarHeader className="flex flex-col items-center justify-center py-6">
              <Link to="/home" className="text-xl font-bold">
                MyMediaList
              </Link>
            </SidebarHeader>
            
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild onClick={() => setMobileMenuOpen(false)}>
                          <Link to={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              {user && (
                <SidebarGroup>
                  <SidebarGroupLabel>Account</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild onClick={() => setMobileMenuOpen(false)}>
                          <Link to="/profile">
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}>
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </SidebarContent>
            
            <SidebarFooter className="p-4">
              {user ? (
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.email || "Avatar"} />
                    <AvatarFallback>{user?.email?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Login</Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleThemeToggle} 
                className="mt-2"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </SidebarFooter>
          </Sidebar>
        </div>
        
        <SidebarRail className="hidden lg:block" />
        <SidebarInset className={cn(
          "p-4 lg:p-6 w-full max-w-full overflow-x-hidden",
          mobileMenuOpen && "lg:opacity-100 opacity-20 pointer-events-none lg:pointer-events-auto"
        )}>
          <main className="mx-auto w-full max-w-7xl">
            {children}
          </main>
          <footer className="w-full border-t bg-background mt-10">
            <div className="container flex flex-col items-center justify-center space-y-4 py-6 md:flex-row md:justify-between md:space-y-0">
              <span className="text-sm text-muted-foreground">
                © 2023 MyMediaList. All rights reserved.
              </span>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
