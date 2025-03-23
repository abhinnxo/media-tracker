
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Plus, Home, Library, Menu, X, User, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedTransition } from './AnimatedTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '@/lib/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profile = useProfileStore(state => state.profile);

  // Navigation items
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Library, label: 'Library', path: '/library' },
  ];

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when nav item is clicked
  const handleNavClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar - Using shadcn/ui sidebar */}
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-between p-2">
              <h1 className="text-xl font-semibold tracking-tight pl-2">
                Media Tracker
              </h1>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.path}
                    tooltip={item.label}
                  >
                    <Link to={item.path} onClick={handleNavClick}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Add Media"
                >
                  <Link to="/add" onClick={handleNavClick}>
                    <Plus />
                    <span>Add Media</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === '/profile'}
                tooltip="Profile" 
                size="lg"
              >
                <Link to="/profile" className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile.image} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium">{profile.name || 'Your Profile'}</span>
                    <span className="text-xs text-muted-foreground">{profile.username || 'Edit profile'}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Sidebar */}
        <header className="md:hidden sticky top-0 z-40 glass-dark bg-background/50 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-full hover:bg-secondary transition-all-200"
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            
            <h1 className="text-xl font-semibold tracking-tight">
              Media Tracker
            </h1>
            
            <Link 
              to="/add" 
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all-200"
              aria-label="Add new media"
            >
              <Plus size={22} />
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar (Animated Overlay) */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                onClick={toggleSidebar}
              />
              
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 h-full w-64 bg-card z-50 md:hidden"
              >
                <div className="flex justify-between items-center p-4 border-b border-border">
                  <h2 className="font-semibold">Media Tracker</h2>
                  <button 
                    onClick={toggleSidebar}
                    className="p-1 rounded-full hover:bg-secondary transition-all-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <nav className="flex-1 px-2 py-4 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-lg transition-all-200",
                        location.pathname === item.path 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-secondary"
                      )}
                      onClick={handleNavClick}
                    >
                      <item.icon size={20} className="mr-3" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <Link
                    to="/add"
                    className="flex items-center px-4 py-3 rounded-lg transition-all-200 hover:bg-secondary"
                    onClick={handleNavClick}
                  >
                    <Plus size={20} className="mr-3" />
                    <span>Add Media</span>
                  </Link>
                  <Link
                    to="/profile"
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg transition-all-200 mt-4",
                      location.pathname === '/profile' 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-secondary"
                    )}
                    onClick={handleNavClick}
                  >
                    <Avatar className="h-7 w-7 mr-3">
                      <AvatarImage src={profile.image} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span>Profile</span>
                  </Link>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatedTransition variant="fadeIn" className="px-4 py-6 md:px-6 md:py-8 container mx-auto max-w-4xl">
            {children}
          </AnimatedTransition>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
