
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from 'lucide-react';

interface EmailSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const EmailSettings = ({ flowData, setFlowData }: EmailSettingsProps) => {
  const addEmail = () => {
    setFlowData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>E-mails Destinatários</CardTitle>
        <CardDescription>
          E-mails que receberão os leads capturados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {flowData.emails.map((email, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                const newEmails = [...flowData.emails];
                newEmails[index] = e.target.value;
                setFlowData(prev => ({...prev, emails: newEmails}));
              }}
              placeholder="email@exemplo.com"
            />
            {flowData.emails.length > 1 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const newEmails = flowData.emails.filter((_, i) => i !== index);
                  setFlowData(prev => ({...prev, emails: newEmails}));
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" onClick={addEmail}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar E-mail
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
