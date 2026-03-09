
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState } from 'react';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar fixo */}
      <div className="fixed left-0 top-0 h-full z-10">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      
      {/* Conteúdo principal */}
      <main 
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ 
          marginLeft: isCollapsed ? '80px' : '256px',
          background: 'linear-gradient(135deg, hsl(220 30% 97%) 0%, hsl(240 20% 96%) 50%, hsl(267 30% 96%) 100%)',
        }}
      >
        <div className="flex-1 overflow-auto bg-grid-pattern">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
