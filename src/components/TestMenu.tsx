
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Globe, Wifi, WifiOff, TestTube, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFlowConnections } from "@/hooks/useFlowConnections";

const TestMenu = () => {
  const [testFlow, setTestFlow] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  
  const { connectionStatus, activeConnections } = useFlowConnections(testFlow?.id);

  // Buscar fluxo de teste existente
  useEffect(() => {
    fetchTestFlow();
  }, []);

  const fetchTestFlow = async () => {
    try {
      const { data: flows, error } = await supabase
        .from('flows')
        .select('*')
        .eq('name', 'Fluxo de Teste - EnviaLead')
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar fluxo de teste:', error);
        return;
      }

      if (flows) {
        setTestFlow(flows);
        console.log('Fluxo de teste encontrado:', flows);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
    }
  };

  const createTestFlow = async () => {
    setCreating(true);
    try {
      // Buscar o company_id do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Usuário não autenticado",
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Perfil não encontrado",
        });
        return;
      }

      // Criar fluxo de teste
      const { data: newFlow, error: flowError } = await supabase
        .from('flows')
        .insert({
          name: 'Fluxo de Teste - EnviaLead',
          description: 'Fluxo para testar a integração do chat no site https://teste.envialead.com.br/',
          company_id: profile.company_id,
          is_active: true,
          colors: {
            primary: '#FF6B35',
            secondary: '#3B82F6',
            text: '#1F2937',
            background: '#FFFFFF'
          },
          position: 'bottom-right',
          minimum_question: 1
        })
        .select()
        .single();

      if (flowError) {
        console.error('Erro ao criar fluxo:', flowError);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao criar fluxo de teste",
        });
        return;
      }

      // Adicionar URL de teste
      await supabase
        .from('flow_urls')
        .insert({
          flow_id: newFlow.id,
          url: 'https://teste.envialead.com.br/'
        });

      // Adicionar pergunta simples
      await supabase
        .from('questions')
        .insert({
          flow_id: newFlow.id,
          type: 'text',
          title: 'Qual é o seu nome?',
          placeholder: 'Digite seu nome aqui...',
          required: true,
          order_index: 0
        });

      setTestFlow(newFlow);
      toast({
        title: "Sucesso!",
        description: "Fluxo de teste criado com sucesso",
      });

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao criar fluxo de teste",
      });
    } finally {
      setCreating(false);
    }
  };

  const generateTestCode = () => {
    if (!testFlow) return '';
    
    const flowCode = `EL_${testFlow.id.replace(/-/g, '').substring(0, 16).toUpperCase()}`;
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site de Teste - Envialead</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 100px;
        }
        h1 { color: #333; }
        p { color: #777; }
    </style>
</head>
<body>
    <h1>Bem-vindo ao Site de Teste!</h1>
    <p>Se tudo estiver certo, o pop-up do Envialead vai aparecer nesta página.</p>
    
<script>
(function(a,b,c,d){
  try {
    var e=b.head||b.getElementsByTagName("head")[0];
    var f=b.createElement("script");
    f.setAttribute("src",c);
    f.setAttribute("data-flow-id",d);
    f.setAttribute("charset","UTF-8");
    f.defer=true;
    a.enviaLeadId=d;
    e.appendChild(f);
    console.log('[EnviaLead] Script carregado com Flow ID:', d);
  } catch(g){console.error('[EnviaLead] Erro ao carregar script:',g);}
})(window,document,"https://fuzkdrkhvmaimpgzvimq.supabase.co/storage/v1/object/public/chat-widget/js/envialead-chat.js","${flowCode}")
</script>

</body>
</html>`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateTestCode());
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "Cole este código em https://teste.envialead.com.br/",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Menu de Teste - EnviaLead
          </CardTitle>
          <CardDescription>
            Ferramenta para testar a integração do chat no site https://teste.envialead.com.br/
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!testFlow ? (
            <div className="text-center py-8">
              <TestTube className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum fluxo de teste encontrado</h3>
              <p className="text-gray-600 mb-4">
                Crie um fluxo específico para testar no site https://teste.envialead.com.br/
              </p>
              <Button 
                onClick={createTestFlow} 
                disabled={creating}
                className="envia-lead-gradient"
              >
                <Plus className="w-4 h-4 mr-2" />
                {creating ? 'Criando...' : 'Criar Fluxo de Teste'}
              </Button>
            </div>
          ) : (
            <>
              {/* Status da Conexão */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Status da Conexão</h4>
                  <Badge 
                    variant={connectionStatus.isConnected ? "default" : "secondary"}
                    className={connectionStatus.isConnected ? "bg-green-500" : ""}
                  >
                    {connectionStatus.isConnected ? (
                      <>
                        <Wifi className="w-3 h-3 mr-1" />
                        Conectado
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 mr-1" />
                        Desconectado
                      </>
                    )}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Fluxo ID: <code className="bg-gray-200 px-1 rounded">{testFlow.id}</code></p>
                  <p>Code: <code className="bg-gray-200 px-1 rounded">EL_{testFlow.id.replace(/-/g, '').substring(0, 16).toUpperCase()}</code></p>
                  <p>Sites conectados: <strong>{connectionStatus.totalConnections}</strong></p>
                </div>

                {activeConnections.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h5 className="font-medium text-green-700">✅ Conexões Ativas:</h5>
                    {activeConnections.map((conn, index) => (
                      <div key={conn.id} className="text-sm bg-green-50 p-2 rounded border-l-4 border-green-400">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <code className="text-xs">{new URL(conn.url).hostname}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Código para Teste */}
              <div className="space-y-3">
                <h4 className="font-semibold">Código HTML Completo para Teste</h4>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs max-h-64">
                    <code>{generateTestCode()}</code>
                  </pre>
                  <Button
                    onClick={handleCopyCode}
                    size="sm"
                    className="absolute top-2 right-2 envia-lead-gradient hover:opacity-90"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copiado!" : "Copiar"}
                  </Button>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">📋 Instruções de Teste:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Copie o código HTML completo acima</li>
                  <li>2. Acesse https://teste.envialead.com.br/</li>
                  <li>3. Cole o código substituindo todo o conteúdo</li>
                  <li>4. Salve e recarregue a página</li>
                  <li>5. O chat deve aparecer no canto inferior direito</li>
                  <li>6. Monitore o status da conexão aqui</li>
                </ol>
              </div>

              {/* Debug */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">🔍 Debug:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Abra o console do navegador (F12)</li>
                  <li>• Procure por logs com "[EnviaLead]"</li>
                  <li>• Verifique se não há erros de carregamento</li>
                  <li>• URL autorizada: https://teste.envialead.com.br/</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestMenu;
