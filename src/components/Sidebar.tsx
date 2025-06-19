
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  Settings, 
  Globe,
  Home,
  Bell,
  User,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'flows', label: 'Fluxos', icon: MessageSquare },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'editor', label: 'Editor', icon: Settings },
    { id: 'preview', label: 'Preview', icon: Globe },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
      });
    }
  };

  const handleNotifications = () => {
    toast({
      title: "Notificações",
      description: "Funcionalidade em desenvolvimento.",
    });
  };

  const handleProfile = () => {
    toast({
      title: "Meu Perfil",
      description: "Funcionalidade em desenvolvimento.",
    });
  };

  const handleHelp = () => {
    toast({
      title: "Ajuda",
      description: "Funcionalidade em desenvolvimento.",
    });
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col h-full">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Envia Lead</h2>
            <p className="text-xs text-gray-500">v1.0.0</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  activeTab === item.id 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-gray-200 space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          onClick={handleNotifications}
        >
          <Bell className="w-5 h-5" />
          Notificações
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          onClick={handleProfile}
        >
          <User className="w-5 h-5" />
          Meu Perfil
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          onClick={handleHelp}
        >
          <HelpCircle className="w-5 h-5" />
          Ajuda
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
