
// EnviaLead Chat Widget - Sistema Modular Corrigido
// Este arquivo carrega todos os módulos necessários na ordem correta

(function() {
  'use strict';

  console.log('[EnviaLead] Inicializando sistema modular v3.1...');

  // Prevenir carregamento duplo
  if (window.enviaLeadLoading || window.enviaLeadLoaded) {
    console.log('[EnviaLead] Sistema já está carregando ou carregado');
    return;
  }
  window.enviaLeadLoading = true;

  // Lista dos módulos na ordem correta de carregamento
  const modules = [
    'js/envialead-utils.js',
    'js/envialead-api.js', 
    'js/envialead-widget.js',
    'js/envialead-chat.js',
    'js/envialead-core.js'
  ];

  let loadedModules = 0;
  const totalModules = modules.length;

  // Determinar o caminho base do script atual
  const currentScript = document.currentScript || 
    (function() {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
  
  const scriptSrc = currentScript ? currentScript.src : '';
  const basePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);
  
  console.log('[EnviaLead] Caminho base:', basePath);

  function loadNextModule() {
    if (loadedModules >= totalModules) {
      console.log('[EnviaLead] Todos os módulos carregados, iniciando sistema...');
      window.enviaLeadLoading = false;
      window.enviaLeadLoaded = true;
      
      // Aguardar um pouco para garantir que todos os módulos foram processados
      setTimeout(initializeSystem, 100);
      return;
    }

    const moduleUrl = modules[loadedModules];
    const script = document.createElement('script');
    
    script.onload = function() {
      console.log('[EnviaLead] Módulo carregado:', moduleUrl);
      loadedModules++;
      loadNextModule();
    };
    
    script.onerror = function() {
      console.error('[EnviaLead] Erro ao carregar módulo:', moduleUrl);
      console.error('[EnviaLead] URL completa tentada:', basePath + moduleUrl);
      // Continuar mesmo com erro para não travar o carregamento
      loadedModules++;
      loadNextModule();
    };
    
    script.src = basePath + moduleUrl;
    script.defer = true;
    document.head.appendChild(script);
  }

  function initializeSystem() {
    console.log('[EnviaLead] Verificando dependências...');
    
    // Verificar se todos os módulos foram carregados
    const requiredModules = ['EnviaLeadUtils', 'EnviaLeadAPI', 'EnviaLeadWidget', 'EnviaLeadChat'];
    const missingModules = requiredModules.filter(module => !window[module]);
    
    if (missingModules.length > 0) {
      console.error('[EnviaLead] Módulos não encontrados:', missingModules);
      // Tentar inicializar mesmo assim após um delay
      setTimeout(initializeSystem, 500);
      return;
    }

    console.log('[EnviaLead] Todas as dependências carregadas, inicializando...');

    // Extrair Flow ID
    const flowId = window.EnviaLeadUtils.extractFlowId();
    const currentUrl = window.location.href;
    const currentDomain = window.location.hostname;
    
    console.log('[EnviaLead] Flow ID encontrado:', flowId);
    console.log('[EnviaLead] URL atual:', currentUrl);
    console.log('[EnviaLead] Domínio atual:', currentDomain);

    if (!flowId) {
      console.error('[EnviaLead] ID do fluxo não fornecido');
      return;
    }

    // Inicializar o sistema
    loadFlow(flowId, currentUrl, currentDomain);
  }

  async function loadFlow(flowId, currentUrl, currentDomain) {
    try {
      console.log('[EnviaLead] Carregando fluxo:', flowId);
      
      const flowData = await window.EnviaLeadAPI.fetchFlowData(flowId);
      
      if (!flowData) {
        console.error('[EnviaLead] Não foi possível carregar o fluxo');
        return;
      }

      console.log('[EnviaLead] Fluxo carregado:', flowData.name);

      // Verificar se o fluxo está ativo
      if (!flowData.is_active) {
        console.log('[EnviaLead] Fluxo está inativo, não exibindo widget');
        return;
      }

      // Verificar URLs autorizadas
      const authorizedUrls = flowData.flow_urls?.map(urlObj => urlObj.url) || [];
      console.log('[EnviaLead] URLs autorizadas:', authorizedUrls);
      
      if (!window.EnviaLeadUtils.isUrlAuthorized(currentUrl, currentDomain, authorizedUrls)) {
        console.log('[EnviaLead] URL não autorizada para este fluxo');
        return;
      }

      console.log('[EnviaLead] Criando widget do chat...');
      createWidget(flowData);

    } catch (error) {
      console.error('[EnviaLead] Erro ao carregar fluxo:', error);
    }
  }

  function createWidget(flowData) {
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
    setupEventListeners();

    console.log('[EnviaLead] Widget criado com sucesso!');
  }

  function setupEventListeners() {
    const floatingButton = document.getElementById('envialead-floating-button');
    if (floatingButton) {
      floatingButton.addEventListener('click', () => {
        console.log('[EnviaLead] Botão flutuante clicado');
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
          console.log('[EnviaLead] Botão fechar chat clicado');
          window.EnviaLeadChat.toggleChat();
        });
      }
    }, 100);
  }

  // Iniciar carregamento dos módulos
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNextModule);
  } else {
    loadNextModule();
  }

})();
