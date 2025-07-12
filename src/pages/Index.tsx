
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import Sidebar from "@/components/Sidebar";
import DashboardMetrics from "@/components/DashboardMetrics";
import FlowManager from "@/components/FlowManager";
import LeadsTable from "@/components/LeadsTable";
import UserManagement from "@/components/UserManagement";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardMetrics />;
      case 'flows':
        return <FlowManager />;
      case 'leads':
        return <LeadsTable />;
      case 'users':
        return <UserManagement />;
      default:
        return <DashboardMetrics />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default Index;
