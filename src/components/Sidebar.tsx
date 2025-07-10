
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  Settings, 
  TestTube,
  ChevronLeft, 
  Menu 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
}

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: MenuItem[] = [
    { icon: BarChart3, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Fluxos', path: '/flows' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
    { icon: TestTube, label: 'Teste', path: '/test' },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`flex flex-col h-screen bg-gray-100 border-r border-gray-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      } transition-width duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between p-4">
        <Logo isCollapsed={isCollapsed} />
        <Button variant="ghost" size="icon" onClick={toggleCollapse}>
          {isCollapsed ? <Menu /> : <ChevronLeft />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
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
    </div>
  );
};

export default Sidebar;
