import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get('company');
    const clientUrl = url.searchParams.get('url'); // URL passada pelo client-side JS

    if (!companyId) {
      return new Response(
        'console.error("[EnviaLead Loader] Company ID não fornecido");',
        { headers: { ...corsHeaders, 'Content-Type': 'text/javascript' } }
      );
    }

    // Se não recebeu a URL do cliente, retornar um script que detecta a URL e faz a chamada real
    if (!clientUrl) {
      const loaderBootstrap = `
(function() {
  var currentUrl = encodeURIComponent(window.location.href);
  var script = document.createElement('script');
  script.src = '${url.origin}${url.pathname}?company=${companyId}&url=' + currentUrl;
  script.async = true;
  document.head.appendChild(script);
})();
`;
      return new Response(loaderBootstrap, {
        headers: { ...corsHeaders, 'Content-Type': 'text/javascript' }
      });
    }

    // Agora temos a URL real do cliente
    const decodedUrl = decodeURIComponent(clientUrl);
    console.log(`[envialead-loader] Company: ${companyId}, URL: ${decodedUrl}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar todos os fluxos ativos da empresa
    const { data: flows, error: flowsError } = await supabase
      .from('flows')
      .select('id')
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (flowsError || !flows || flows.length === 0) {
      console.log(`[envialead-loader] Nenhum fluxo ativo para empresa: ${companyId}`);
      return new Response(
        'console.log("[EnviaLead Loader] Nenhum fluxo ativo encontrado");',
        { headers: { ...corsHeaders, 'Content-Type': 'text/javascript' } }
      );
    }

    // Buscar URLs de cada fluxo
    const flowIds = flows.map(f => f.id);
    const { data: flowUrls } = await supabase
      .from('flow_urls')
      .select('flow_id, url')
      .in('flow_id', flowIds);

    // Encontrar o fluxo que corresponde à URL atual
    let matchedFlowId: string | null = null;
    let bestMatchLength = -1;

    for (const flow of flows) {
      const urls = (flowUrls || []).filter(u => u.flow_id === flow.id).map(u => u.url);
      
      if (urls.length === 0) continue;

      const validUrls = urls.filter(u => u && u.trim() !== '');
      if (validUrls.length === 0) continue;

      for (const allowedUrl of validUrls) {
        if (urlMatches(decodedUrl, allowedUrl)) {
          try {
            const normalized = allowedUrl.startsWith('http') ? allowedUrl : 'https://' + allowedUrl;
            const pathLength = new URL(normalized).pathname.replace(/\/+$/, '').length;
            if (pathLength > bestMatchLength) {
              bestMatchLength = pathLength;
              matchedFlowId = flow.id;
            }
          } catch {
            if (!matchedFlowId) matchedFlowId = flow.id;
          }
        }
      }
    }

    if (!matchedFlowId) {
      console.log(`[envialead-loader] Nenhum fluxo correspondente para URL: ${decodedUrl}`);
      return new Response(
        'console.log("[EnviaLead Loader] Nenhum fluxo correspondente para esta página");',
        { headers: { ...corsHeaders, 'Content-Type': 'text/javascript' } }
      );
    }

    console.log(`[envialead-loader] Fluxo encontrado: ${matchedFlowId} para URL: ${decodedUrl}`);

    const widgetUrl = `${supabaseUrl}/functions/v1/envialead-widget?flow=${matchedFlowId}`;
    
    const loaderScript = `
(function() {
  console.log('[EnviaLead Loader] Carregando fluxo: ${matchedFlowId}');
  var script = document.createElement('script');
  script.src = '${widgetUrl}';
  script.async = true;
  document.head.appendChild(script);
})();
`;

    return new Response(loaderScript, {
      headers: { ...corsHeaders, 'Content-Type': 'text/javascript' }
    });

  } catch (error) {
    console.error('[envialead-loader] Erro:', error);
    return new Response(
      'console.error("[EnviaLead Loader] Erro interno");',
      { headers: { ...corsHeaders, 'Content-Type': 'text/javascript' } }
    );
  }
});

function urlMatches(currentUrl: string, allowedUrl: string): boolean {
  try {
    if (allowedUrl === '*' || allowedUrl.startsWith('*.')) return true;
    
    const normalizedAllowed = allowedUrl.startsWith('http') ? allowedUrl : 'https://' + allowedUrl;
    const allowed = new URL(normalizedAllowed);
    const current = new URL(currentUrl);
    
    if (allowed.hostname !== current.hostname) return false;
    
    const allowedPath = allowed.pathname.replace(/\/+$/, '');
    if (allowedPath && allowedPath !== '') {
      const currentPath = current.pathname.replace(/\/+$/, '');
      return currentPath === allowedPath || currentPath.startsWith(allowedPath + '/');
    }
    
    return true;
  } catch {
    return false;
  }
}
