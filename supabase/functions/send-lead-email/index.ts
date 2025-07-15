import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    // Prepare email content
    const emailSubject = `Novo Lead - ${flow_name}`;
    
    let emailBody = `
      <h2>Novo Lead Capturado</h2>
      <p><strong>Fluxo:</strong> ${flow_name}</p>
      <p><strong>Site:</strong> ${url}</p>
      <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      
      <h3>Respostas:</h3>
      <table style="border-collapse: collapse; width: 100%;">
    `;

    // Add responses to email
    for (const [question, answer] of Object.entries(responses)) {
      emailBody += `
        <tr style="border: 1px solid #ddd;">
          <td style="padding: 8px; font-weight: bold; background: #f5f5f5;">${question}</td>
          <td style="padding: 8px;">${answer}</td>
        </tr>
      `;
    }

    emailBody += '</table>';

    // Send email to all configured addresses
    const emailPromises = emails.map(async (email) => {
      try {
        // Here you would integrate with your email service
        // For now, we'll just log the email data
        console.log(`[send-lead-email] Email seria enviado para: ${email}`);
        console.log(`[send-lead-email] Assunto: ${emailSubject}`);
        console.log(`[send-lead-email] Conteúdo:`, emailBody);
        
        return { email, success: true };
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