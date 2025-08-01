
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  Settings,
  ChevronLeft, 
  Menu,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Logo from './Logo';

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
      className={`flex flex-col h-screen bg-white border-r border-gray-200 shadow-lg ${
        isCollapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 ease-in-out overflow-y-auto`}
    >
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <Logo isCollapsed={isCollapsed} />
        <Button variant="ghost" size="icon" onClick={toggleCollapse}>
          {isCollapsed ? <Menu /> : <ChevronLeft />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 transition-colors duration-200 ${
                isActive
                  ? 'bg-gray-200 font-medium'
                  : 'text-gray-600'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      
      <div className="px-2 pb-4 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
