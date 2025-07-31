
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden">
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
