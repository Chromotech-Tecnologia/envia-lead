
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se RESEND_API_KEY está configurada
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'RESEND_API_KEY não configurada',
        message: 'Configure a chave da API do Resend nas configurações do projeto'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Testar chamada para send-lead-email com dados de exemplo
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const testData = {
      flow_id: 'test-flow-id',
      flow_name: 'Teste de Email',
      attendant_name: 'Teste',
      responses: {
        'Nome': 'João Silva',
        'Email': 'joao@teste.com',
        'Telefone': '(11) 99999-9999',
        'Mensagem': 'Teste de envio de email'
      },
      emails: ['teste@empresa.com'],
      completed: true,
      url: 'https://teste.com',
      ip_address: '127.0.0.1',
      user_agent: 'Test User Agent',
      created_at: new Date().toISOString()
    };

    const emailResponse = await supabase.functions.invoke('send-lead-email', {
      body: testData
    });

    if (emailResponse.error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro ao chamar send-lead-email',
        details: emailResponse.error
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Sistema de email funcionando corretamente',
      resend_configured: true,
      test_result: emailResponse.data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('[test-email] Erro:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
