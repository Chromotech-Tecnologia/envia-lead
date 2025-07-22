
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[test-email] Iniciando teste de email');

    // Verificar se tem API key do Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error('[test-email] RESEND_API_KEY não configurada');
      return new Response(JSON.stringify({
        success: false,
        error: 'RESEND_API_KEY não configurada. Configure em: https://supabase.com/dashboard/project/fuzkdrkhvmaimpgzvimq/settings/functions'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    console.log('[test-email] RESEND_API_KEY encontrada, iniciando envio');

    const resend = new Resend(resendApiKey);

    // Email de teste para alexandre@chromotech.com.br
    const emailResponse = await resend.emails.send({
      from: "Teste EnviaLead <leads@resend.dev>",
      to: ["alexandre@chromotech.com.br"],
      subject: "🧪 Teste de Email - EnviaLead",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧪 Teste de Email - EnviaLead</h1>
              <p>Este é um email de teste para verificar se o sistema está funcionando</p>
            </div>
            
            <div class="content">
              <h2>✅ Configuração Funcionando!</h2>
              <p>Se você recebeu este email, significa que:</p>
              <ul>
                <li>✅ RESEND_API_KEY está configurada corretamente</li>
                <li>✅ A função de envio de email está funcionando</li>
                <li>✅ O sistema pode enviar emails para leads</li>
              </ul>
              
              <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p><strong>Domínio:</strong> ${Deno.env.get('SUPABASE_URL')}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('[test-email] Email enviado com sucesso:', emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: 'Email de teste enviado com sucesso!',
      data: emailResponse
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
      error: error.message,
      details: error.stack
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
