// Edge Function para buscar dados do fluxo para o widget
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
    const url = new URL(req.url);
    const flowId = url.searchParams.get('flow_id');

    if (!flowId) {
      return new Response(
        JSON.stringify({ error: 'Flow ID é obrigatório' }),
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

    // Buscar dados do fluxo
    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', flowId)
      .eq('is_active', true)
      .single();

    if (flowError || !flow) {
      return new Response(
        JSON.stringify({ error: 'Fluxo não encontrado ou inativo' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Buscar perguntas do fluxo
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('flow_id', flowId)
      .order('order_index');

    // Buscar URLs do fluxo
    const { data: urls } = await supabase
      .from('flow_urls')
      .select('url')
      .eq('flow_id', flowId);

    // Verificar se a URL atual está nas URLs permitidas (se houver)
    const currentUrl = req.headers.get('referer') || req.headers.get('origin');
    const allowedUrls = urls?.map(u => u.url) || [];
    
    if (allowedUrls.length > 0 && currentUrl) {
      const isAllowed = allowedUrls.some(allowedUrl => {
        try {
          const allowed = new URL(allowedUrl);
          const current = new URL(currentUrl);
          return allowed.hostname === current.hostname;
        } catch {
          return false;
        }
      });

      if (!isAllowed) {
        return new Response(
          JSON.stringify({ error: 'URL não autorizada para este fluxo' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Registrar ou atualizar conexão
    if (currentUrl) {
      // Primeiro tentar atualizar conexão existente
      const { data: existingConnection } = await supabase
        .from('flow_connections')
        .select('id')
        .eq('flow_id', flowId)
        .eq('url', currentUrl)
        .single();

      if (existingConnection) {
        // Atualizar conexão existente
        await supabase
          .from('flow_connections')
          .update({
            last_ping: new Date().toISOString(),
            is_active: true,
            user_agent: req.headers.get('user-agent'),
            ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       '0.0.0.0'
          })
          .eq('id', existingConnection.id);
      } else {
        // Criar nova conexão
        await supabase
          .from('flow_connections')
          .insert({
            flow_id: flowId,
            url: currentUrl,
            user_agent: req.headers.get('user-agent'),
            ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       '0.0.0.0',
            last_ping: new Date().toISOString(),
            is_active: true
          });
      }
    }

    // Retornar dados do fluxo
    const flowData = {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      colors: flow.colors || {
        primary: '#FF6B35',
        secondary: '#3B82F6',
        text: '#1F2937',
        background: '#FFFFFF'
      },
      position: flow.position || 'bottom-right',
      whatsapp: flow.whatsapp,
      avatar_url: flow.avatar_url,
      minimum_question: flow.minimum_question || 1,
      questions: questions || []
    };

    return new Response(
      JSON.stringify({ success: true, data: flowData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na function get-flow-data:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});