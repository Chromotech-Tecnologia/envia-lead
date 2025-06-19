
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface IntegrationCodeProps {
  flowId: string;
}

const IntegrationCode = ({ flowId }: IntegrationCodeProps) => {
  const [copied, setCopied] = useState(false);

  const integrationCode = `<script src="https://fuzkdrkhvmaimpgzvimq.supabase.co/storage/v1/object/public/chat-widget/envialead-chat.js" data-flow-id="${flowId}"></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(integrationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Código de Integração</CardTitle>
        <CardDescription>
          Copie e cole este código em seu site para ativar o chat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            value={integrationCode}
            readOnly
            className="min-h-[80px] font-mono text-sm"
          />
          <Button
            onClick={handleCopy}
            className="absolute top-2 right-2"
            size="sm"
            variant="outline"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copiar
              </>
            )}
          </Button>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Como usar:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Copie o código acima</li>
            <li>2. Cole antes da tag &lt;/body&gt; do seu site</li>
            <li>3. O sistema detectará automaticamente a URL e exibirá o fluxo correto</li>
          </ol>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <h4 className="font-semibold text-amber-900 mb-2">Importante:</h4>
          <p className="text-sm text-amber-800">
            Configure as URLs de exibição na aba "URLs" para que o chat apareça apenas nas páginas desejadas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationCode;
