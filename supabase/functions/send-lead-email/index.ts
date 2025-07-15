import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadEmailRequest {
  flow_id: string;
  flow_name: string;
  responses: Record<string, any>;
  emails: string[];
  url: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: LeadEmailRequest = await req.json();
    const { flow_id, flow_name, responses, emails, url } = requestData;

    console.log('[send-lead-email] Enviando emails para:', emails);

    // Verificar se tem API key do Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error('[send-lead-email] RESEND_API_KEY não configurada');
      return new Response(JSON.stringify({
        success: false,
        error: 'Serviço de email não configurado'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const resend = new Resend(resendApiKey);

    // Prepare email content
    const emailSubject = `Novo Lead - ${flow_name}`;
    
    let emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(45deg, #FF6B35, #3B82F6); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .response-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .response-table th, .response-table td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #ddd; 
          }
          .response-table th { background: #e9ecef; font-weight: bold; }
          .info-section { margin: 15px 0; }
          .info-label { font-weight: bold; color: #555; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Novo Lead Capturado</h1>
            <p>Um novo lead foi gerado através do seu fluxo de conversação</p>
          </div>
          
          <div class="content">
            <div class="info-section">
              <div class="info-label">📋 Fluxo:</div>
              <div>${flow_name}</div>
            </div>
            
            <div class="info-section">
              <div class="info-label">🌐 Site:</div>
              <div>${url}</div>
            </div>
            
            <div class="info-section">
              <div class="info-label">📅 Data:</div>
              <div>${new Date().toLocaleString('pt-BR')}</div>
            </div>
            
            <h2>💬 Respostas do Lead:</h2>
            <table class="response-table">
              <thead>
                <tr>
                  <th>Pergunta</th>
                  <th>Resposta</th>
                </tr>
              </thead>
              <tbody>
    `;

    // Add responses to email
    for (const [question, answer] of Object.entries(responses)) {
      emailBody += `
        <tr>
          <td>${question}</td>
          <td><strong>${answer}</strong></td>
        </tr>
      `;
    }

    emailBody += `
              </tbody>
            </table>
            
            <div style="margin-top: 30px; padding: 15px; background: #e3f2fd; border-radius: 5px;">
              <p><strong>💡 Dica:</strong> Entre em contato com este lead o mais rápido possível para aumentar suas chances de conversão!</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to all configured addresses
    const emailPromises = emails.map(async (email) => {
      try {
        const emailResponse = await resend.emails.send({
          from: "EnviaLead <leads@resend.dev>",
          to: [email],
          subject: emailSubject,
          html: emailBody,
        });

        console.log(`[send-lead-email] Email enviado para: ${email}`, emailResponse);
        return { email, success: true, id: emailResponse.data?.id };
      } catch (error) {
        console.error(`[send-lead-email] Erro ao enviar para ${email}:`, error);
        return { email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Emails processados',
      results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('[send-lead-email] Erro:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
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