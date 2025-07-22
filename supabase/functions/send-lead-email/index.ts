
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

    console.log('[send-lead-email] Iniciando processamento:', {
      flow_name,
      completed,
      emails_count: emails.length,
      responses_count: Object.keys(responses).length,
      url
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
    
    // Email verificado (único que funciona no modo teste do Resend)
    const verifiedEmail = 'alexandre.areds@gmail.com';
    console.log('[send-lead-email] Email verificado configurado:', verifiedEmail);

    // Preparar assunto do email
    const leadStatus = completed ? 'COMPLETO' : 'PARCIAL';
    const statusIcon = completed ? '✅' : '⏳';
    const emailSubject = `${statusIcon} Novo Lead ${leadStatus} - ${flow_name}`;
    
    // Preparar data/hora formatada
    const leadDate = new Date(created_at).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log('[send-lead-email] Dados preparados:', {
      subject: emailSubject,
      date: leadDate,
      attendant: attendant_name || 'Atendimento'
    });

    // Preparar corpo do email com design melhorado
    let emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            margin: 0; 
            padding: 0;
            background-color: #f9fafb;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white; 
            padding: 30px 20px; 
            border-radius: 12px; 
            margin-bottom: 30px; 
            text-align: center;
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 700;
            margin-top: 15px;
            ${completed ? 'background: #10b981; color: white;' : 'background: #f59e0b; color: white;'}
          }
          .content { 
            background: #f8fafc; 
            padding: 25px; 
            border-radius: 12px; 
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
          }
          .info-item {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .info-label { 
            font-weight: 600; 
            color: #6b7280; 
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .info-value {
            color: #1f2937;
            font-size: 16px;
            font-weight: 500;
          }
          .responses-section {
            background: white;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            border: 1px solid #e5e7eb;
          }
          .responses-title {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .response-item {
            background: #f8fafc;
            padding: 18px;
            border-radius: 8px;
            margin-bottom: 12px;
            border-left: 4px solid #10b981;
          }
          .response-question {
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .response-answer {
            color: #1f2937;
            font-size: 16px;
            word-wrap: break-word;
          }
          .footer {
            background: #f3f4f6;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
          }
          .cta-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            text-align: center;
          }
          .cta-text {
            font-size: 18px;
            font-weight: 700;
            color: #92400e;
            margin-bottom: 10px;
          }
          .cta-subtitle {
            font-size: 15px;
            color: #92400e;
            line-height: 1.5;
          }
          .alert {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .alert-text {
            color: #dc2626;
            font-size: 14px;
            margin: 0;
            font-weight: 500;
          }
          .highlight {
            background: #eff6ff;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
          }
          @media (max-width: 600px) {
            .info-grid {
              grid-template-columns: 1fr;
            }
            .container {
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Novo Lead Capturado!</h1>
            <p>Sistema EnviaLead - Notificação Automática</p>
            <div class="status-badge">
              ${completed ? '✅ LEAD COMPLETO' : '⏳ LEAD PARCIAL'}
            </div>
          </div>
          
          <div class="content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">📋 Fluxo de Captura</div>
                <div class="info-value">${flow_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">👤 Atendente Responsável</div>
                <div class="info-value">${attendant_name || 'Atendimento Padrão'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">🌐 Origem do Lead</div>
                <div class="info-value">${url}</div>
              </div>
              <div class="info-item">
                <div class="info-label">📅 Data e Hora</div>
                <div class="info-value">${leadDate}</div>
              </div>
            </div>
            
            ${ip_address || user_agent ? `
              <div class="info-grid">
                ${ip_address ? `
                  <div class="info-item">
                    <div class="info-label">🖥️ Endereço IP</div>
                    <div class="info-value">${ip_address}</div>
                  </div>
                ` : ''}
                ${user_agent ? `
                  <div class="info-item">
                    <div class="info-label">📱 Dispositivo</div>
                    <div class="info-value">${user_agent.includes('Mobile') ? '📱 Mobile' : '💻 Desktop'}</div>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
          
          <div class="responses-section">
            <div class="responses-title">
              💬 Respostas Coletadas
            </div>
    `;

    // Adicionar respostas do lead
    const responseCount = Object.keys(responses).length;
    if (responseCount > 0) {
      console.log('[send-lead-email] Processando respostas:', responses);
      
      for (const [question, answer] of Object.entries(responses)) {
        emailBody += `
          <div class="response-item">
            <div class="response-question">${question}</div>
            <div class="response-answer">${answer}</div>
          </div>
        `;
      }
    } else {
      console.log('[send-lead-email] Nenhuma resposta coletada');
      emailBody += `
        <div class="response-item">
          <div class="response-answer" style="color: #6b7280; font-style: italic;">
            ⚠️ Nenhuma resposta foi coletada ainda. O usuário pode ter abandonado o fluxo.
          </div>
        </div>
      `;
    }

    emailBody += `
          </div>
          
          <div class="cta-section">
            <div class="cta-text">
              ${completed ? '🚀 Ação Imediata Recomendada' : '⏰ Aguarde Mais Interações'}
            </div>
            <div class="cta-subtitle">
              ${completed 
                ? 'Lead completo capturado! Entre em contato o mais rápido possível para maximizar suas chances de conversão.' 
                : 'Lead parcial detectado. Considere implementar remarketing ou aguardar que o usuário complete o fluxo.'}
            </div>
          </div>
          
          <div class="footer">
            <p><strong>📧 Email enviado automaticamente pelo sistema EnviaLead</strong></p>
            <p>🕒 Processado em ${leadDate}</p>
            <p>🔧 Para configurar notificações, acesse: <span class="highlight">dashboard.envialead.com</span></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email para todos os endereços configurados
    console.log('[send-lead-email] Iniciando envio para emails:', emails);
    
    const emailPromises = emails.map(async (email) => {
      try {
        console.log('[send-lead-email] Processando email:', email);
        
        // Verificar se precisa usar fallback
        const needsFallback = email !== verifiedEmail;
        const targetEmail = needsFallback ? verifiedEmail : email;
        
        let finalEmailBody = emailBody;
        
        // Adicionar aviso de fallback se necessário
        if (needsFallback) {
          console.log('[send-lead-email] Usando fallback para:', email);
          const fallbackAlert = `
            <div class="alert">
              <p class="alert-text">
                ⚠️ <strong>IMPORTANTE:</strong> Este email foi enviado para <strong>${verifiedEmail}</strong> 
                porque o destinatário original (<strong>${email}</strong>) não está verificado no sistema Resend. 
                <br><br>
                Para receber emails diretamente em <strong>${email}</strong>, 
                <a href="https://resend.com/domains" target="_blank">verifique o domínio em resend.com/domains</a>
              </p>
            </div>
          `;
          finalEmailBody = finalEmailBody.replace('<div class="content">', fallbackAlert + '<div class="content">');
        }

        const emailResponse = await resend.emails.send({
          from: "EnviaLead <leads@resend.dev>",
          to: [targetEmail],
          subject: emailSubject,
          html: finalEmailBody,
        });

        console.log('[send-lead-email] Email enviado com sucesso:', {
          originalEmail: email,
          sentTo: targetEmail,
          id: emailResponse.data?.id
        });

        return { 
          email, 
          success: true, 
          id: emailResponse.data?.id, 
          sent_to: targetEmail,
          fallback_used: needsFallback
        };
      } catch (error) {
        console.error('[send-lead-email] Erro ao enviar email:', {
          email,
          error: error.message
        });
        return { 
          email, 
          success: false, 
          error: error.message 
        };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log('[send-lead-email] Resultado final:', {
      total: emails.length,
      success: successCount,
      failures: failureCount,
      results
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: `${successCount}/${emails.length} emails enviados com sucesso`,
      results,
      lead_info: {
        flow_name,
        completed,
        responses_count: responseCount,
        created_at: leadDate,
        url
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
      error: error.message,
      details: 'Erro interno do servidor ao processar envio de email'
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
