
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface IntegrationCodeProps {
  flow?: any;
  flowData: any;
}

const IntegrationCode = ({ flow, flowData }: IntegrationCodeProps) => {
  const { toast } = useToast();

  const copyIntegrationCode = () => {
    const integrationCode = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://envialead.com/chat.js';
    script.setAttribute('data-flow-id', '${flow?.id || 'FLOW_ID'}');
    script.setAttribute('data-position', '${flowData.position}');
    script.setAttribute('data-primary-color', '${flowData.colors.primary}');
    document.head.appendChild(script);
  })();
</script>`;

    navigator.clipboard.writeText(integrationCode).then(() => {
      toast({
        title: "Código copiado!",
        description: "O código de integração foi copiado para a área de transferência.",
      });
    }).catch(() => {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Tente novamente.",
        variant: "destructive",
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Código de Integração</CardTitle>
        <CardDescription>
          Copie e cole este código no <code>&lt;head&gt;</code> do seu site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <code className="text-sm block whitespace-pre-wrap">
            {`<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://envialead.com/chat.js';
    script.setAttribute('data-flow-id', '${flow?.id || 'FLOW_ID'}');
    script.setAttribute('data-position', '${flowData.position}');
    script.setAttribute('data-primary-color', '${flowData.colors.primary}');
    document.head.appendChild(script);
  })();
</script>`}
          </code>
        </div>
        <Button onClick={copyIntegrationCode} variant="outline" className="flex items-center gap-2">
          <Copy className="w-4 h-4" />
          Copiar Código
        </Button>
      </CardContent>
    </Card>
  );
};

export default IntegrationCode;
