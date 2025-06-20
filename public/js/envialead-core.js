
// EnviaLead - Core Initialization and Main Logic
(function() {
  'use strict';
  
  console.log('[EnviaLead] Script iniciado v3.0 - Modular');
  
  if (window.enviaLeadLoaded) {
    console.log('[EnviaLead] Script já carregado');
    return;
  }
  window.enviaLeadLoaded = true;

  const EnviaLeadCore = {
    init: function() {
      console.log('[EnviaLead] Inicializando core...');
      
      // Verificar dependências
      if (!this.checkDependencies()) {
        console.error('[EnviaLead] Dependências não encontradas');
        return;
      }

      const flowId = window.EnviaLeadUtils.extractFlowId();
      const currentUrl = window.location.href;
      const currentDomain = window.location.hostname;
      
      console.log('[EnviaLead] Flow ID:', flowId);
      console.log('[EnviaLead] URL atual:', currentUrl);
      console.log('[EnviaLead] Domínio atual:', currentDomain);

      if (!flowId) {
        console.error('[EnviaLead] ID do fluxo não fornecido');
        return;
      }

      this.loadFlow(flowId, currentUrl, currentDomain);
    },

    checkDependencies: function() {
      const required = ['EnviaLeadUtils', 'EnviaLeadAPI', 'EnviaLeadWidget', 'EnviaLeadChat'];
      for (const dep of required) {
        if (!window[dep]) {
          console.error('[EnviaLead] Dependência não encontrada:', dep);
          return false;
        }
      }
      return true;
    },

    loadFlow: async function(flowId, currentUrl, currentDomain) {
      try {
        const flowData = await window.EnviaLeadAPI.fetchFlowData(flowId);
        
        if (!flowData) {
          console.error('[EnviaLead] Não foi possível carregar o fluxo');
          return;
        }

        // Verificar se o fluxo está ativo
        if (!flowData.is_active) {
          console.log('[EnviaLead] Fluxo está inativo');
          return;
        }

        // Verificar URLs autorizadas
        const authorizedUrls = flowData.flow_urls?.map(urlObj => urlObj.url) || [];
        if (!window.EnviaLeadUtils.isUrlAuthorized(currentUrl, currentDomain, authorizedUrls)) {
          return;
        }

        console.log('[EnviaLead] Criando widget do chat...');
        this.createWidget(flowData);

      } catch (error) {
        console.error('[EnviaLead] Erro ao carregar fluxo:', error);
      }
    },

    createWidget: function(flowData) {
      console.log('[EnviaLead] Criando widget para fluxo:', flowData.name);

      // Remover widget existente
      window.EnviaLeadWidget.removeExistingWidget();

      // Injetar estilos CSS
      window.EnviaLeadUtils.injectStyles();

      // Configurações padrão
      const colors = flowData.colors || {
        primary: '#FF6B35',
        secondary: '#3B82F6',
        text: '#1F2937',
        background: '#FFFFFF'
      };

      const buttonPosition = flowData.button_position || flowData.position || 'bottom-right';
      const chatPosition = flowData.chat_position || flowData.position || 'bottom-right';
      const welcomeMessage = flowData.welcome_message || 'Olá! Como posso ajudá-lo?';

      // Criar elementos do widget
      const chatContainer = window.EnviaLeadWidget.createMainContainer(buttonPosition);
      const floatingButton = window.EnviaLeadWidget.createFloatingButton(colors, buttonPosition);
      const welcomeBubble = window.EnviaLeadWidget.createWelcomeBubble(welcomeMessage, colors);
      const chatWindow = window.EnviaLeadWidget.createChatWindow(chatPosition, colors, flowData);

      // Montar estrutura
      chatContainer.appendChild(floatingButton);
      chatContainer.appendChild(welcomeBubble);
      chatContainer.appendChild(chatWindow);
      document.body.appendChild(chatContainer);

      console.log('[EnviaLead] Widget adicionado ao DOM');

      // Inicializar chat
      window.EnviaLeadChat.init(flowData, colors);

      // Configurar event listeners
      this.setupEventListeners();

      console.log('[EnviaLead] Widget criado com sucesso');
    },

    setupEventListeners: function() {
      const floatingButton = document.getElementById('envialead-floating-button');
      if (floatingButton) {
        floatingButton.addEventListener('click', () => {
          window.EnviaLeadChat.toggleChat();
        });
      }

      // Event listeners após inserção no DOM
      setTimeout(() => {
        const closeWelcomeBtn = document.getElementById('envialead-close-welcome');
        if (closeWelcomeBtn) {
          closeWelcomeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const welcomeBubble = document.getElementById('envialead-welcome-bubble');
            if (welcomeBubble) {
              welcomeBubble.style.opacity = '0';
              setTimeout(() => {
                welcomeBubble.style.display = 'none';
              }, 300);
            }
          });
        }

        const closeChatBtn = document.getElementById('envialead-close-chat');
        if (closeChatBtn) {
          closeChatBtn.addEventListener('click', () => {
            window.EnviaLeadChat.toggleChat();
          });
        }
      }, 100);
    }
  };

  // Inicializar quando DOM estiver pronto
  function initialize() {
    console.log('[EnviaLead] Inicializando sistema modular...');
    EnviaLeadCore.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    setTimeout(initialize, 100);
  }

})();
