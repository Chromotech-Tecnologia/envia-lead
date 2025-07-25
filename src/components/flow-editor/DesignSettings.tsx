
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Palette, Upload } from 'lucide-react';
import PositionSettings from './PositionSettings';
import AvatarUploader from '../AvatarUploader';
import { supabase } from '@/integrations/supabase/client';

interface DesignSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const DesignSettings = ({ flowData, setFlowData }: DesignSettingsProps) => {
  const [userCompanyId, setUserCompanyId] = React.useState<string>('');

  // Get user company ID
  React.useEffect(() => {
    const getUserCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserCompanyId(profile.company_id);
        }
      }
    };
    
    getUserCompany();
  }, []);

  const handleAvatarSelect = (url: string) => {
    setFlowData(prev => ({...prev, avatar_url: url}));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Cores do Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <Input
                id="primaryColor"
                type="color"
                value={flowData.colors?.primary || '#FF6B35'}
                onChange={(e) => setFlowData(prev => ({
                  ...prev,
                  colors: { ...prev.colors, primary: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <Input
                id="secondaryColor"
                type="color"
                value={flowData.colors?.secondary || '#3B82F6'}
                onChange={(e) => setFlowData(prev => ({
                  ...prev,
                  colors: { ...prev.colors, secondary: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="textColor">Cor do Texto</Label>
              <Input
                id="textColor"
                type="color"
                value={flowData.colors?.text || '#1F2937'}
                onChange={(e) => setFlowData(prev => ({
                  ...prev,
                  colors: { ...prev.colors, text: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="backgroundColor">Cor de Fundo do Chat</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={flowData.colors?.background || '#F9FAFB'}
                onChange={(e) => setFlowData(prev => ({
                  ...prev,
                  colors: { ...prev.colors, background: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="headerTextColor">Cor do Texto do Cabeçalho</Label>
              <Input
                id="headerTextColor"
                type="color"
                value={flowData.colors?.headerText || '#FFFFFF'}
                onChange={(e) => setFlowData(prev => ({
                  ...prev,
                  colors: { ...prev.colors, headerText: e.target.value }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Atendente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="attendantName">Nome do Atendente</Label>
              <Input
                id="attendantName"
                value={flowData.attendant_name || 'Atendimento'}
                onChange={(e) => setFlowData(prev => ({...prev, attendant_name: e.target.value}))}
                placeholder="Digite o nome do atendente"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatar do Chat</CardTitle>
        </CardHeader>
        <CardContent>
          {userCompanyId && (
            <AvatarUploader
              onAvatarSelect={(url) => setFlowData(prev => ({...prev, avatar_url: url}))}
              selectedAvatar={flowData.avatar_url}
              companyId={userCompanyId}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatar do Botão Flutuante</CardTitle>
        </CardHeader>
        <CardContent>
          {userCompanyId && (
            <AvatarUploader
              onAvatarSelect={(url) => setFlowData(prev => ({...prev, button_avatar_url: url}))}
              selectedAvatar={flowData.button_avatar_url}
              companyId={userCompanyId}
            />
          )}
        </CardContent>
      </Card>

      <PositionSettings flowData={flowData} setFlowData={setFlowData} />

    </div>
  );
};

export default DesignSettings;
