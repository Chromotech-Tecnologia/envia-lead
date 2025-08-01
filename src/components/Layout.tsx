
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState } from 'react';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Sidebar fixo */}
      <div className="fixed left-0 top-0 h-full z-10">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      
      {/* Conteúdo principal com margem dinâmica baseada no estado do sidebar */}
      <main 
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '80px' : '256px' }}
      >
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
