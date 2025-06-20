
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from 'lucide-react';

interface WelcomeMessageSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const WelcomeMessageSettings = ({ flowData, setFlowData }: WelcomeMessageSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Mensagem de Saudação
        </CardTitle>
        <CardDescription>
          Configure a mensagem inicial que aparecerá para o usuário
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
          <Textarea
            id="welcomeMessage"
            value={flowData?.welcomeMessage || 'Olá! Como posso ajudá-lo?'}
            onChange={(e) => setFlowData((prev: any) => {
              const currentData = prev || {};
              return {
                ...currentData,
                welcomeMessage: e.target.value
              };
            })}
            placeholder="Ex: Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo hoje?"
            className="min-h-[80px]"
          />
          <p className="text-sm text-gray-500 mt-1">
            Esta mensagem aparecerá na bolha de boas-vindas e como primeira mensagem do chat
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeMessageSettings;
