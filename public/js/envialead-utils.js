
// EnviaLead - Utility Functions
(function(window) {
  'use strict';

  const EnviaLeadUtils = {
    // Position styling utilities
    getPositionStyles: function(position) {
      const positions = {
        'bottom-right': 'bottom: 20px; right: 20px;',
        'bottom-left': 'bottom: 20px; left: 20px;',
        'top-right': 'top: 20px; right: 20px;',
        'top-left': 'top: 20px; left: 20px;',
        'center-right': 'top: 50%; right: 20px; transform: translateY(-50%);',
        'center-left': 'top: 50%; left: 20px; transform: translateY(-50%);'
      };
      
      return positions[position] || positions['bottom-right'];
    },

    getChatWindowPosition: function(position) {
      const positions = {
        'bottom-right': 'bottom: 90px; right: 20px;',
        'bottom-left': 'bottom: 90px; left: 20px;',
        'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
      };
      
      return positions[position] || positions['bottom-right'];
    },

    // Flow ID extraction utilities - Melhorado
    extractFlowId: function() {
      let flowId = null;
      
      console.log('[EnviaLead] Extraindo Flow ID...');
      
      // Método 1: Verificar data-flow-id no script atual
      const currentScript = document.currentScript;
      if (currentScript) {
        flowId = currentScript.getAttribute('data-flow-id');
        console.log('[EnviaLead] Flow ID do script atual:', flowId);
      }
      
      // Método 2: Buscar em todos os scripts com data-flow-id
      if (!flowId) {
        const scripts = document.querySelectorAll('script[data-flow-id]');
        console.log('[EnviaLead] Scripts com data-flow-id encontrados:', scripts.length);
        if (scripts.length > 0) {
          flowId = scripts[scripts.length - 1].getAttribute('data-flow-id');
          console.log('[EnviaLead] Flow ID dos scripts:', flowId);
        }
      }
      
      // Método 3: Verificar variável global
      if (!flowId) {
        flowId = window.enviaLeadId;
        console.log('[EnviaLead] Flow ID da variável global:', flowId);
      }
      
      // Método 4: Buscar em scripts que contenham envialead
      if (!flowId) {
        const allScripts = document.getElementsByTagName('script');
        for (let i = 0; i < allScripts.length; i++) {
          const script = allScripts[i];
          if (script.src && script.src.includes('envialead')) {
            const srcFlowId = script.getAttribute('data-flow-id');
            if (srcFlowId) {
              flowId = srcFlowId;
              console.log('[EnviaLead] Flow ID encontrado em script EnviaLead:', flowId);
              break;
            }
          }
        }
      }
      
      console.log('[EnviaLead] Flow ID final extraído:', flowId);
      return flowId;
    },

    // URL validation utilities - Melhorado
    isUrlAuthorized: function(currentUrl, currentDomain, authorizedUrls) {
      console.log('[EnviaLead] Verificando autorização de URL...');
      console.log('[EnviaLead] URL atual:', currentUrl);
      console.log('[EnviaLead] Domínio atual:', currentDomain);
      console.log('[EnviaLead] URLs autorizadas:', authorizedUrls);
      
      if (!authorizedUrls || authorizedUrls.length === 0) {
        console.log('[EnviaLead] Nenhuma URL configurada, permitindo em qualquer domínio');
        return true;
      }

      // Filtrar URLs vazias
      const validUrls = authorizedUrls.filter(url => url && url.trim() !== '');
      if (validUrls.length === 0) {
        console.log('[EnviaLead] Nenhuma URL válida configurada, permitindo em qualquer domínio');
        return true;
      }

      for (const authorizedUrl of validUrls) {
        console.log('[EnviaLead] Verificando URL autorizada:', authorizedUrl);
        
        if (authorizedUrl === '*') {
          console.log('[EnviaLead] Wildcard encontrado, permitindo acesso');
          return true;
        }
        
        // Normalizar URLs para comparação
        const normalizedAuth = authorizedUrl.toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/\/$/, '');
        const normalizedCurrent = currentUrl.toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/\/$/, '');
        
        console.log('[EnviaLead] Comparando:', normalizedCurrent, 'com', normalizedAuth);
        
        // Verificar correspondência exata
        if (normalizedCurrent === normalizedAuth) {
          console.log('[EnviaLead] Correspondência exata encontrada');
          return true;
        }
        
        // Verificar se a URL atual contém a autorizada
        if (normalizedCurrent.includes(normalizedAuth)) {
          console.log('[EnviaLead] URL atual contém a autorizada');
          return true;
        }
        
        // Verificar domínio
        const authDomain = normalizedAuth.split('/')[0];
        if (currentDomain.includes(authDomain) || authDomain.includes(currentDomain)) {
          console.log('[EnviaLead] Domínio autorizado:', authDomain);
          return true;
        }
      }

      console.log('[EnviaLead] URL não autorizada');
      console.log('[EnviaLead] URL atual:', currentUrl);
      console.log('[EnviaLead] URLs autorizadas:', validUrls);
      return false;
    },

    // CSS injection utility
    injectStyles: function() {
      if (document.getElementById('envialead-styles')) {
        console.log('[EnviaLead] Estilos já injetados');
        return;
      }
      
      console.log('[EnviaLead] Injetando estilos CSS...');
      
      const style = document.createElement('style');
      style.id = 'envialead-styles';
      style.textContent = `
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatSlideIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
        @keyframes messageSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Estilos específicos do EnviaLead */
        #envialead-chat-container * {
          box-sizing: border-box;
        }
        
        #envialead-floating-button:hover {
          transform: scale(1.1) !important;
        }
        
        #envialead-chat-window {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
      `;
      document.head.appendChild(style);
      
      console.log('[EnviaLead] Estilos CSS injetados com sucesso');
    }
  };

  // Export to global scope
  window.EnviaLeadUtils = EnviaLeadUtils;
  console.log('[EnviaLead] Módulo EnviaLeadUtils carregado');

})(window);
