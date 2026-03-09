
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  Settings,
  ChevronLeft, 
  Menu,
  LogOut,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Logo from './Logo';
import { useEffect, useState } from 'react';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
}

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

const Sidebar = ({ activeTab, setActiveTab, isCollapsed = false, setIsCollapsed }: SidebarProps) => {
  const location = useLocation();

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error logging out:', error);
        } else {
          window.location.href = '/auth';
        }
      } catch (error) {
        console.error('Error during logout:', error);
        window.location.href = '/auth';
      }
    }
  };

  const menuItems: MenuItem[] = [
    { icon: BarChart3, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Fluxos', path: '/flows' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const toggleCollapse = () => {
    if (setIsCollapsed) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        isCollapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 ease-in-out overflow-y-auto`}
      style={{
        background: 'linear-gradient(180deg, hsl(260 60% 12%) 0%, hsl(240 40% 10%) 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <Logo isCollapsed={isCollapsed} />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/10 mb-2" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-white/15 text-white font-medium shadow-lg shadow-black/10'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary" />
                )}
                <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/20 text-primary-foreground' 
                    : 'text-white/60 group-hover:text-white'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Divider */}
      <div className="mx-4 h-px bg-white/10 mb-2" />

      {/* Logout */}
      <div className="px-3 pb-4 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-red-400/80 hover:text-red-300 hover:bg-red-500/10 rounded-xl px-3 py-2.5"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg">
            <LogOut className="h-5 w-5" />
          </div>
          {!isCollapsed && <span className="text-sm">Sair</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
