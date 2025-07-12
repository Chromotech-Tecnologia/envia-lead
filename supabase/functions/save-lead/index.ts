// Edge Function para salvar leads do widget
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

    // Buscar dados do fluxo para pegar company_id
    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .select('company_id')
      .eq('id', flow_id)
      .single();

    if (flowError || !flow) {
      return new Response(
        JSON.stringify({ error: 'Fluxo não encontrado' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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
        responses: responses,
        completed: completed || false,
        ip_address: ip_address,
        user_agent: user_agent
      })
      .select()
      .single();

    if (leadError) {
      console.error('Erro ao salvar lead:', leadError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar lead no banco de dados' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Lead salvo com sucesso:', lead.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: lead.id,
        message: completed ? 'Lead completo salvo' : 'Lead parcial salvo'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na function save-lead:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});