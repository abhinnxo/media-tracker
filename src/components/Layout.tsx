
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
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"
import { Home, Library, Compass, User, LogOut, Sun, Moon, Menu, X, PanelLeft } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface Props {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  const { user, signOut } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="flex flex-col items-center justify-center py-6">
            <Link to="/home" className="text-xl font-bold group-data-[collapsible=icon]:hidden">
              MyMediaList
            </Link>
            <Link to="/home" className="text-xl font-bold hidden group-data-[collapsible=icon]:block">
              M
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
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
                      <SidebarMenuButton asChild>
                        <Link to="/profile">
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={signOut}>
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
              <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.email || "Avatar"} />
                  <AvatarFallback>{user?.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
              </div>
            ) : (
              <Link to="/login" className="group-data-[collapsible=icon]:hidden">
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
        
        <SidebarInset className="w-full">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto" />
          </header>
          
          <main className="flex-1 p-4 lg:p-6">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
          
          <footer className="w-full border-t bg-background">
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
