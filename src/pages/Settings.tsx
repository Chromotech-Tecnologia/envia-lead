import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserManagement from "@/components/UserManagement";

const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-gradient-primary">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie usuários e configurações da empresa
        </p>
      </div>
      
      <UserManagement />
      
      <Card className="glass-card border-0 shadow-3d">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Configurações Gerais</CardTitle>
          <CardDescription>
            Outras configurações do sistema em breve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Mais opções de configuração serão adicionadas aqui
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
