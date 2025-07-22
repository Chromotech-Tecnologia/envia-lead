
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadEmailRequest {
  flow_id: string;
  flow_name: string;
  attendant_name?: string;
  responses: Record<string, any>;
  emails: string[];
  completed: boolean;
  url: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: LeadEmailRequest = await req.json();
    const { 
      flow_id, 
      flow_name, 
      attendant_name,
      responses, 
      emails, 
      completed,
      url,
      ip_address,
      user_agent,
      created_at
    } = requestData;

    console.log('[send-lead-email] Processando envio:', {
      flow_name,
      completed,
      emails_count: emails.length,
      responses_count: Object.keys(responses).length
    });

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

    // Preparar assunto do email
    const leadStatus = completed ? 'Completo' : 'Parcial';
    const emailSubject = `🎯 Novo Lead ${leadStatus} - ${flow_name}`;
    
    // Preparar data/hora formatada
    const leadDate = new Date(created_at).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Preparar corpo do email
    let emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background: linear-gradient(45deg, #FF6B35, #3B82F6); 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
            text-align: center;
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
            ${completed ? 'background: #10B981; color: white;' : 'background: #F59E0B; color: white;'}
          }
          .content { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .info-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #3B82F6;
          }
          .info-label { 
            font-weight: bold; 
            color: #555; 
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .info-value {
            color: #333;
            font-size: 14px;
          }
          .responses-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .responses-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .response-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 10px;
            border-left: 4px solid #10B981;
          }
          .response-question {
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
            font-size: 14px;
          }
          .response-answer {
            color: #333;
            font-size: 16px;
            word-wrap: break-word;
          }
          .footer {
            background: #e9ecef;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .cta-section {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
          .cta-text {
            font-size: 16px;
            font-weight: bold;
            color: #856404;
            margin-bottom: 10px;
          }
          .cta-subtitle {
            font-size: 14px;
            color: #856404;
          }
          @media (max-width: 600px) {
            .info-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Novo Lead Capturado</h1>
            <div class="status-badge">
              ${completed ? '✅ COMPLETO' : '⏳ PARCIAL'}
            </div>
          </div>
          
          <div class="content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">📋 Fluxo</div>
                <div class="info-value">${flow_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">👤 Atendente</div>
                <div class="info-value">${attendant_name || 'Atendimento'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">🌐 Site</div>
                <div class="info-value">${url}</div>
              </div>
              <div class="info-item">
                <div class="info-label">📅 Data/Hora</div>
                <div class="info-value">${leadDate}</div>
              </div>
            </div>
            
            ${ip_address ? `
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">🖥️ IP</div>
                  <div class="info-value">${ip_address}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">📱 Dispositivo</div>
                  <div class="info-value">${user_agent ? (user_agent.includes('Mobile') ? 'Mobile' : 'Desktop') : 'N/A'}</div>
                </div>
              </div>
            ` : ''}
          </div>
          
          <div class="responses-section">
            <div class="responses-title">
              💬 Respostas do Lead
            </div>
    `;

    // Adicionar respostas do lead
    const responseCount = Object.keys(responses).length;
    if (responseCount > 0) {
      for (const [question, answer] of Object.entries(responses)) {
        emailBody += `
          <div class="response-item">
            <div class="response-question">${question}</div>
            <div class="response-answer">${answer}</div>
          </div>
        `;
      }
    } else {
      emailBody += `
        <div class="response-item">
          <div class="response-answer" style="color: #666; font-style: italic;">
            Nenhuma resposta foi capturada ainda.
          </div>
        </div>
      `;
    }

    emailBody += `
          </div>
          
          <div class="cta-section">
            <div class="cta-text">
              ⚡ Ação Recomendada
            </div>
            <div class="cta-subtitle">
              ${completed 
                ? 'Lead completo! Entre em contato o mais rápido possível para maximizar a conversão.' 
                : 'Lead parcial - considere fazer remarketing ou aguardar mais interações.'}
            </div>
          </div>
          
          <div class="footer">
            <p>📧 Email enviado automaticamente pelo sistema EnviaLead</p>
            <p>🕒 Processado em ${leadDate}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email para todos os endereços configurados
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
    const successCount = results.filter(r => r.success).length;
    
    console.log(`[send-lead-email] Resultado: ${successCount}/${emails.length} emails enviados`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `${successCount}/${emails.length} emails enviados com sucesso`,
      results,
      lead_info: {
        flow_name,
        completed,
        responses_count: responseCount,
        created_at: leadDate
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('[send-lead-email] Erro geral:', error);
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
