import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Plus, Home, Library, Menu, X, User, PanelLeft, LogOut, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedTransition } from './AnimatedTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '@/lib/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const profile = useProfileStore(state => state.profile);
  const { user, signOut } = useAuth();

  // Navigation items
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: User, label: 'Friends', path: '/friends' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
  ];

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Close sidebar when nav item is clicked
  const handleNavClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full h-screen bg-background">
        {/* Desktop Sidebar - Using shadcn/ui sidebar */}
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-between p-2">
              {sidebarOpen && <h1 className=" text-xl font-semibold tracking-tight pl-2">
                Media Tracker
              </h1>}
              <SidebarTrigger onClick={() => setSidebarOpen(!sidebarOpen)} />
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
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === '/profile'}
                      tooltip="Profile"
                      size="lg"
                    >
                      <div className="flex items-center gap-3 cursor-pointer">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile.image} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left">
                          <span className="font-medium">{profile.name || user.email?.split('@')[0] || 'Your Profile'}</span>
                          <span className="text-xs text-muted-foreground">{profile.username || 'Edit profile'}</span>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <SidebarMenuButton
                  asChild
                  tooltip="Login"
                  size="lg"
                >
                  <Link to="/login" className="flex items-center gap-3">
                    <Button>Login</Button>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Sidebar (Animated Overlay) */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
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
                    onClick={() => setSidebarOpen(!sidebarOpen)}
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

                  {user ? (
                    <>
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

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 rounded-lg transition-all-200 hover:bg-secondary text-left"
                      >
                        <LogOut size={20} className="mr-3" />
                        <span>Log out</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center px-4 py-3 rounded-lg transition-all-200 hover:bg-secondary mt-4"
                      onClick={handleNavClick}
                    >
                      <User size={20} className="mr-3" />
                      <span>Login</span>
                    </Link>
                  )}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1">
          <div className='h-fit md:hidden'>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full hover:bg-secondary transition-all-200"
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
          </div>
          <AnimatedTransition variant="fadeIn" className="px-4 py-6 md:px-6 md:py-8 container mx-auto">
            {children}
          </AnimatedTransition>
        </main>
      </div >
    </SidebarProvider >
  );
};

export default Layout;
