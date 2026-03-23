import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verifica se a URL atual corresponde à URL permitida (hostname + path)
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get('company');

    if (!companyId) {
      return new Response(
        'console.error("[EnviaLead Loader] Company ID não fornecido");',
        { headers: { ...corsHeaders, 'Content-Type': 'text/javascript' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const currentUrl = req.headers.get('referer') || req.headers.get('origin');
    
    console.log(`[envialead-loader] Company: ${companyId}, URL: ${currentUrl}`);

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

    // Domínios da plataforma (sempre autorizados)
    const platformDomains = ['envialead.com.br', 'envialead.lovable.app', 'localhost', '127.0.0.1'];
    const isPlatformDomain = currentUrl ? platformDomains.some(domain => {
      try {
        const u = new URL(currentUrl);
        return u.hostname.includes(domain) || domain.includes(u.hostname);
      } catch {
        return currentUrl.includes(domain);
      }
    }) : false;

    // Encontrar o fluxo que corresponde à URL atual
    let matchedFlowId: string | null = null;
    let bestMatchLength = -1;

    for (const flow of flows) {
      const urls = (flowUrls || []).filter(u => u.flow_id === flow.id).map(u => u.url);
      
      // Se o fluxo não tem URLs configuradas, pular (não exibir em qualquer página)
      if (urls.length === 0) {
        // Se é domínio da plataforma e não há outro match, usar este como fallback
        if (isPlatformDomain && !matchedFlowId) {
          matchedFlowId = flow.id;
        }
        continue;
      }

      const validUrls = urls.filter(u => u && u.trim() !== '');
      if (validUrls.length === 0) continue;

      for (const allowedUrl of validUrls) {
        if (!currentUrl) continue;
        
        if (urlMatches(currentUrl, allowedUrl)) {
          // Calcular especificidade: URLs com path mais longo são mais específicas
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
      console.log(`[envialead-loader] Nenhum fluxo correspondente para URL: ${currentUrl}`);
      return new Response(
        'console.log("[EnviaLead Loader] Nenhum fluxo correspondente para esta página");',
        { headers: { ...corsHeaders, 'Content-Type': 'text/javascript' } }
      );
    }

    console.log(`[envialead-loader] Fluxo encontrado: ${matchedFlowId} para URL: ${currentUrl}`);

    // Injetar o script do widget com o flow_id correspondente
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
