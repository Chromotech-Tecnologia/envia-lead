import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserManagement from "@/components/UserManagement";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Configurações
        </h1>
        <p className="text-gray-600">
          Gerencie usuários e configurações da empresa
        </p>
      </div>
      
      <UserManagement />
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>
            Outras configurações do sistema em breve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Mais opções de configuração serão adicionadas aqui
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;