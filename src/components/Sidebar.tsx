
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  Settings,
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
    { id: 'users', label: 'Usuários', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      console.log('Iniciando logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
        throw error;
      }
      
      console.log('Logout realizado com sucesso');
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
      setTimeout(() => {
        navigate('/auth');
      }, 100);
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
      });
    }
  };

  const handleNotifications = () => {
    console.log('Clicou em notificações');
    toast({
      title: "Notificações",
      description: "Funcionalidade em desenvolvimento.",
    });
  };

  const handleProfile = () => {
    console.log('Clicou em perfil');
    toast({
      title: "Meu Perfil",
      description: "Funcionalidade em desenvolvimento.",
    });
  };

  const handleHelp = () => {
    console.log('Clicou em ajuda');
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
                  "w-full justify-start gap-3 h-11 text-left",
                  activeTab === item.id 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                onClick={() => {
                  console.log(`Navegando para aba: ${item.id}`);
                  setActiveTab(item.id);
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-gray-200 space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-11 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-left"
          onClick={handleNotifications}
        >
          <Bell className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">Notificações</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-11 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-left"
          onClick={handleProfile}
        >
          <User className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">Meu Perfil</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-11 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-left"
          onClick={handleHelp}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">Ajuda</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-11 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-left"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">Sair</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
