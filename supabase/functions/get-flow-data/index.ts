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

    // Aceitar diretamente o ID do fluxo (UUID)
    // O widget deve passar o ID real do fluxo, não mais códigos transformados
    let actualFlowId = flowId;
    
    console.log('[get-flow-data] Buscando fluxo com ID:', actualFlowId);

    // Buscar dados do fluxo
    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .select(`
        *,
        button_position,
        chat_position,
        button_offset_x,
        button_offset_y,
        chat_offset_x,
        chat_offset_y,
        chat_width,
        chat_height,
        button_size
      `)
      .eq('id', actualFlowId)
      .single();

    // Verificar se o fluxo existe e está ativo
    if (flowError || !flow || !flow.is_active) {
      const errorMsg = !flow ? 'Fluxo não encontrado' : 
                      !flow.is_active ? 'Fluxo está inativo' : 
                      'Erro ao buscar fluxo';
      console.log(`[get-flow-data] ${errorMsg} para ID: ${actualFlowId}`);
      
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { 
          status: flow && !flow.is_active ? 403 : 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }


    // Buscar perguntas do fluxo
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('flow_id', actualFlowId)
      .order('order_index');

    // Buscar URLs do fluxo
    const { data: urls } = await supabase
      .from('flow_urls')
      .select('url')
      .eq('flow_id', actualFlowId);

    // Verificar se a URL atual está nas URLs permitidas (se houver)
    const currentUrl = req.headers.get('referer') || req.headers.get('origin');
    const allowedUrls = urls?.map(u => u.url) || [];
    
    console.log(`[get-flow-data] URL atual: ${currentUrl}, URLs permitidas:`, allowedUrls);
    
    if (allowedUrls.length > 0 && currentUrl) {
      const isAllowed = allowedUrls.some(allowedUrl => {
        try {
          const allowed = new URL(allowedUrl);
          const current = new URL(currentUrl);
          console.log(`[get-flow-data] Verificando: ${allowed.hostname} vs ${current.hostname}`);
          return allowed.hostname === current.hostname;
        } catch {
          return false;
        }
      });

      if (!isAllowed) {
        console.log(`[get-flow-data] URL não autorizada: ${currentUrl}`);
        return new Response(
          JSON.stringify({ error: 'URL não autorizada para este fluxo' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Registrar visita (audiência) e atualizar conexão (sessão ativa)
    if (currentUrl) {
      console.log(`[get-flow-data] Registrando visita para URL: ${currentUrl}`);
      
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') || 
                      '0.0.0.0';
      const userAgent = req.headers.get('user-agent');
      
      // Gerar session_id único baseado em IP + User Agent + timestamp (simplificado)
      const sessionId = `${clientIp}-${Date.now()}`;
      
      // Sempre registrar uma nova visita (para medir audiência)
      const { error: visitError } = await supabase
        .from('flow_visits')
        .insert({
          flow_id: actualFlowId,
          url: currentUrl,
          ip_address: clientIp,
          user_agent: userAgent,
          session_id: sessionId
        });
        
      if (visitError) {
        console.error('[get-flow-data] Erro ao registrar visita:', visitError);
      } else {
        console.log(`[get-flow-data] Visita registrada com sucesso`);
      }
      
      // Atualizar ou criar conexão (para medir sessões ativas)
      const { data: existingConnection, error: connectionSelectError } = await supabase
        .from('flow_connections')
        .select('id')
        .eq('flow_id', actualFlowId)
        .eq('url', currentUrl)
        .maybeSingle();

      if (connectionSelectError) {
        console.error('[get-flow-data] Erro ao buscar conexão existente:', connectionSelectError);
      }

      if (existingConnection) {
        console.log(`[get-flow-data] Atualizando conexão existente: ${existingConnection.id}`);
        
        const { error: updateError } = await supabase
          .from('flow_connections')
          .update({
            last_ping: new Date().toISOString(),
            is_active: true,
            user_agent: userAgent,
            ip_address: clientIp
          })
          .eq('id', existingConnection.id);
          
        if (updateError) {
          console.error('[get-flow-data] Erro ao atualizar conexão:', updateError);
        }
      } else {
        console.log(`[get-flow-data] Criando nova conexão`);
        
        const { error: insertError } = await supabase
          .from('flow_connections')
          .insert({
            flow_id: actualFlowId,
            url: currentUrl,
            user_agent: userAgent,
            ip_address: clientIp,
            last_ping: new Date().toISOString(),
            is_active: true
          });
          
        if (insertError) {
          console.error('[get-flow-data] Erro ao criar conexão:', insertError);
        }
      }
    }

    // Formatar as perguntas corretamente
    const formattedQuestions = (questions || []).map(q => ({
      id: q.id,
      type: q.type,
      title: q.title,
      placeholder: q.placeholder,
      options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : null,
      required: q.required || false,
      order: q.order_index
    }));

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
      button_position: flow.button_position || 'bottom-right',
      chat_position: flow.chat_position || 'bottom-right',
      button_offset_x: flow.button_offset_x || 0,
      button_offset_y: flow.button_offset_y || 0,
      chat_offset_x: flow.chat_offset_x || 0,
      chat_offset_y: flow.chat_offset_y || 0,
      chat_width: flow.chat_width || 400,
      chat_height: flow.chat_height || 500,
      button_size: flow.button_size || 60,
      whatsapp: flow.whatsapp,
      avatar_url: flow.avatar_url,
      minimum_question: flow.minimum_question || 1,
      questions: formattedQuestions,
      welcomeMessage: flow.welcome_message || 'Olá! Como posso ajudá-lo?',
      showWhatsappButton: flow.show_whatsapp_button !== false
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