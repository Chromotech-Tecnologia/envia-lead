
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

    // Flow ID extraction utilities
    extractFlowId: function() {
      let flowId = null;
      const currentScript = document.currentScript;
      
      if (currentScript) {
        flowId = currentScript.getAttribute('data-flow-id');
      }
      
      // Fallback: buscar em todos os scripts
      if (!flowId) {
        const scripts = document.querySelectorAll('script[data-flow-id]');
        if (scripts.length > 0) {
          flowId = scripts[scripts.length - 1].getAttribute('data-flow-id');
        }
      }
      
      // Fallback: usar variável global
      if (!flowId) {
        flowId = window.enviaLeadId;
      }
      
      return flowId;
    },

    // URL validation utilities
    isUrlAuthorized: function(currentUrl, currentDomain, authorizedUrls) {
      if (!authorizedUrls || authorizedUrls.length === 0) {
        console.log('[EnviaLead] Nenhuma URL configurada, permitindo em qualquer domínio');
        return true;
      }

      for (const authorizedUrl of authorizedUrls) {
        if (authorizedUrl === '*') {
          return true;
        }
        
        // Normalizar URLs para comparação
        const normalizedAuth = authorizedUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        const normalizedCurrent = currentUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        console.log('[EnviaLead] Comparando:', normalizedCurrent, 'com', normalizedAuth);
        
        // Verificar correspondência exata ou se a URL atual contém a autorizada
        if (normalizedCurrent === normalizedAuth || 
            normalizedCurrent.includes(normalizedAuth) ||
            currentDomain.includes(normalizedAuth.split('/')[0])) {
          console.log('[EnviaLead] URL autorizada encontrada:', authorizedUrl);
          return true;
        }
      }

      console.log('[EnviaLead] URL não autorizada. Atual:', currentUrl, 'Autorizadas:', authorizedUrls);
      return false;
    },

    // CSS injection utility
    injectStyles: function() {
      if (document.getElementById('envialead-styles')) return;
      
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
      `;
      document.head.appendChild(style);
    }
  };

  // Export to global scope
  window.EnviaLeadUtils = EnviaLeadUtils;

})(window);
