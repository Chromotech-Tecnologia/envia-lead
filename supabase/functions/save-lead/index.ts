
// Edge Function para salvar leads do widget e enviar por email
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const leadData = await req.json();
    const { flow_id, responses, completed, user_agent } = leadData;

    console.log('[save-lead] Dados recebidos:', { flow_id, responses, completed, user_agent });

    if (!flow_id || !responses) {
      return new Response(
        JSON.stringify({ error: 'Flow ID e respostas são obrigatórios' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados do fluxo para pegar company_id e nome
    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .select('company_id, name, attendant_name')
      .eq('id', flow_id)
      .single();

    if (flowError || !flow) {
      console.error('[save-lead] Erro ao buscar fluxo:', flowError);
      return new Response(
        JSON.stringify({ error: 'Fluxo não encontrado' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('[save-lead] Fluxo encontrado:', flow.name);

    // Buscar perguntas do fluxo para converter IDs em títulos
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, title, type')
      .eq('flow_id', flow_id)
      .order('order_index');

    if (questionsError) {
      console.error('[save-lead] Erro ao buscar perguntas:', questionsError);
    }

    // Converter respostas de ID para títulos legíveis
    const readableResponses: Record<string, string> = {};
    const questionMap = new Map(questions?.map(q => [q.id, q.title]) || []);

    for (const [questionId, answer] of Object.entries(responses)) {
      const questionTitle = questionMap.get(questionId) || `Pergunta ${questionId}`;
      readableResponses[questionTitle] = String(answer);
    }

    console.log('[save-lead] Respostas convertidas:', readableResponses);

    // Pegar IP address
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') || 
                      '0.0.0.0';

    // Salvar lead no banco
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        flow_id: flow_id,
        company_id: flow.company_id,
        responses: readableResponses, // Usar respostas legíveis
        completed: completed || false,
        ip_address: ip_address,
        user_agent: user_agent
      })
      .select()
      .single();

    if (leadError) {
      console.error('[save-lead] Erro ao salvar lead:', leadError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar lead no banco de dados' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('[save-lead] Lead salvo com sucesso:', lead.id);

    // Buscar emails configurados para o fluxo
    const { data: emailsData, error: emailsError } = await supabase
      .from('flow_emails')
      .select('email')
      .eq('flow_id', flow_id);

    if (emailsError) {
      console.error('[save-lead] Erro ao buscar emails:', emailsError);
    }

    const emails = emailsData?.map(item => item.email) || [];
    console.log('[save-lead] Emails encontrados:', emails);

    // Enviar por email se houver emails configurados
    if (emails.length > 0) {
      try {
        console.log('[save-lead] Enviando email para leads...');
        
        // Chamar função de envio de email
        const emailResponse = await supabase.functions.invoke('send-lead-email', {
          body: {
            flow_id: flow_id,
            flow_name: flow.name,
            attendant_name: flow.attendant_name,
            responses: readableResponses,
            emails: emails,
            completed: completed || false,
            url: leadData.url || 'URL não informada',
            ip_address: ip_address,
            user_agent: user_agent,
            created_at: new Date().toISOString()
          }
        });

        if (emailResponse.error) {
          console.error('[save-lead] Erro ao enviar email:', emailResponse.error);
        } else {
          console.log('[save-lead] Email enviado com sucesso:', emailResponse.data);
        }
      } catch (emailError) {
        console.error('[save-lead] Erro ao chamar função de email:', emailError);
      }
    } else {
      console.log('[save-lead] Nenhum email configurado para este fluxo');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: lead.id,
        message: completed ? 'Lead completo salvo e email enviado' : 'Lead parcial salvo e email enviado',
        emails_sent: emails.length > 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[save-lead] Erro geral:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
