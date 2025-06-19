
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from 'lucide-react';

interface UrlSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const UrlSettings = ({ flowData, setFlowData }: UrlSettingsProps) => {
  const addUrl = () => {
    setFlowData(prev => ({
      ...prev,
      urls: [...prev.urls, '']
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>URLs de Exibição</CardTitle>
        <CardDescription>
          Configure em quais páginas este chat será exibido
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {flowData.urls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => {
                const newUrls = [...flowData.urls];
                newUrls[index] = e.target.value;
                setFlowData(prev => ({...prev, urls: newUrls}));
              }}
              placeholder="Ex: www.seusite.com/produtos"
            />
            {flowData.urls.length > 1 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const newUrls = flowData.urls.filter((_, i) => i !== index);
                  setFlowData(prev => ({...prev, urls: newUrls}));
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" onClick={addUrl}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar URL
        </Button>
      </CardContent>
    </Card>
  );
};

export default UrlSettings;
