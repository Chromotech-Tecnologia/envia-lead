
// EnviaLead - API Communication
(function(window) {
  'use strict';

  const API_BASE = 'https://fuzkdrkhvmaimpgzvimq.supabase.co';
  const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA';

  const defaultHeaders = {
    'apikey': API_KEY,
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };

  const EnviaLeadAPI = {
    // Convert EL_ format to actual flow ID
    convertFlowId: async function(flowId) {
      if (!flowId.startsWith('EL_')) {
        return flowId;
      }

      console.log('[EnviaLead] Convertendo ID do formato EL_...');
      
      try {
        const response = await fetch(`${API_BASE}/rest/v1/flows?select=*,questions(*),flow_urls(*),flow_emails(*)`, {
          headers: defaultHeaders
        });

        if (response.ok) {
          const allFlows = await response.json();
          console.log('[EnviaLead] Fluxos encontrados:', allFlows.length);
          
          for (const flow of allFlows) {
            const code = `EL_${flow.id.replace(/-/g, '').substring(0, 16).toUpperCase()}`;
            if (code === flowId) {
              console.log('[EnviaLead] Flow ID convertido:', flowId, '->', flow.id);
              return flow.id;
            }
          }
        }
      } catch (error) {
        console.error('[EnviaLead] Erro ao converter Flow ID:', error);
      }

      return flowId;
    },

    // Fetch flow data from API
    fetchFlowData: async function(flowId) {
      try {
        console.log('[EnviaLead] Buscando dados do fluxo...');
        
        const actualFlowId = await this.convertFlowId(flowId);

        const flowResponse = await fetch(`${API_BASE}/rest/v1/flows?id=eq.${actualFlowId}&select=*,questions(*),flow_urls(*),flow_emails(*)`, {
          headers: defaultHeaders
        });

        if (!flowResponse.ok) {
          throw new Error(`HTTP ${flowResponse.status} - ${flowResponse.statusText}`);
        }

        const flows = await flowResponse.json();
        console.log('[EnviaLead] Resposta da API:', flows);

        if (!flows || flows.length === 0) {
          console.error('[EnviaLead] Fluxo não encontrado para ID:', actualFlowId);
          return null;
        }

        const flow = flows[0];
        console.log('[EnviaLead] Fluxo encontrado:', flow.name);
        
        return flow;
      } catch (error) {
        console.error('[EnviaLead] Erro ao buscar dados do fluxo:', error);
        return null;
      }
    },

    // Save lead data
    saveLead: async function(flowId, responses) {
      try {
        const leadData = {
          flow_id: flowId,
          responses: responses,
          completed: true,
          user_agent: navigator.userAgent,
          url: window.location.href
        };

        console.log('[EnviaLead] Salvando lead:', leadData);

        const response = await fetch(`${API_BASE}/rest/v1/leads`, {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify(leadData)
        });

        if (response.ok) {
          console.log('[EnviaLead] Lead salvo com sucesso');
          return true;
        } else {
          console.error('[EnviaLead] Erro ao salvar lead:', response.status);
          return false;
        }
      } catch (error) {
        console.error('[EnviaLead] Erro ao salvar lead:', error);
        return false;
      }
    }
  };

  // Export to global scope
  window.EnviaLeadAPI = EnviaLeadAPI;

})(window);
