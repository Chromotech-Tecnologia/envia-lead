
(function() {
  'use strict';

  // Configurações
  const SUPABASE_URL = 'https://fuzkdrkhvmaimpgzvimq.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA';

  // Obter o código do fluxo da variável global
  const flowCode = window.enviaLeadId;
  
  if (!flowCode) {
    console.warn('Envia Lead: Código do fluxo não encontrado');
    return;
  }

  // Função para encontrar o fluxo pelo código
  async function findFlowByCode() {
    try {
      // Extrair o ID original do código
      const flowId = flowCode.replace('EL_', '').toLowerCase();
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/flows?select=*,flow_urls(url)&is_active=eq.true`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const flows = await response.json();
      
      // Encontrar fluxo pelo código ou verificar URL
      const currentUrl = window.location.hostname;
      
      const matchingFlow = flows.find(flow => {
        // Primeiro, tentar encontrar pelo código
        const flowIdClean = flow.id.replace(/-/g, '').substring(0, 16);
        if (flowIdClean === flowId) return true;
        
        // Se não encontrar pelo código, verificar URL
        return flow.flow_urls?.some(urlObj => 
          currentUrl.includes(urlObj.url) || urlObj.url.includes(currentUrl)
        );
      });
      
      return matchingFlow;
    } catch (error) {
      console.error('Erro ao buscar fluxo:', error);
      return null;
    }
  }

  // Função para criar o widget de chat
  function createChatWidget(flowData) {
    const buttonPosition = flowData.buttonPosition || flowData.position || 'bottom-right';
    const chatPosition = flowData.chatPosition || 'bottom-right';
    const colors = flowData.colors || {
      primary: '#FF6B35',
      secondary: '#3B82F6',
      text: '#1F2937',
      background: '#FFFFFF'
    };

    // Função para obter classes de posição do botão
    function getButtonPositionClasses(position) {
      const positions = {
        'bottom-right': 'bottom: 24px; right: 24px;',
        'bottom-left': 'bottom: 24px; left: 24px;',
        'top-right': 'top: 24px; right: 24px;',
        'top-left': 'top: 24px; left: 24px;',
        'center-right': 'top: 50%; right: 24px; transform: translateY(-50%);',
        'center-left': 'top: 50%; left: 24px; transform: translateY(-50%);'
      };
      return positions[position] || positions['bottom-right'];
    }

    // Função para obter classes de posição do chat
    function getChatPositionClasses(position) {
      const positions = {
        'bottom-right': 'bottom: 90px; right: 24px;',
        'bottom-left': 'bottom: 90px; left: 24px;',
        'top-right': 'top: 90px; right: 24px;',
        'top-left': 'top: 90px; left: 24px;',
        'center-right': 'top: 50%; right: 24px; transform: translateY(-50%);',
        'center-left': 'top: 50%; left: 24px; transform: translateY(-50%);'
      };
      return positions[position] || positions['bottom-right'];
    }

    // Criar container do widget
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'envialead-chat-widget';
    widgetContainer.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // Botão flutuante
    const floatingButton = document.createElement('button');
    floatingButton.style.cssText = `
      position: fixed;
      ${getButtonPositionClasses(buttonPosition)}
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${colors.primary};
      border: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
      z-index: 9999;
    `;
    
    floatingButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.418 21 12 21C10.2 21 8.53 20.5 7.14 19.64L3 21L4.36 16.86C3.5 15.47 3 13.8 3 12C3 7.582 7.582 3 12 3C16.418 3 21 7.582 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    // Efeito hover
    floatingButton.addEventListener('mouseenter', () => {
      floatingButton.style.transform = 'scale(1.1)';
    });
    
    floatingButton.addEventListener('mouseleave', () => {
      floatingButton.style.transform = 'scale(1)';
    });

    // Container do chat
    const chatContainer = document.createElement('div');
    chatContainer.style.cssText = `
      position: fixed;
      ${getChatPositionClasses(chatPosition)}
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      border: 1px solid #e5e7eb;
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 9998;
    `;

    // Header do chat
    const chatHeader = document.createElement('div');
    chatHeader.style.cssText = `
      background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    chatHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 14px; font-weight: bold;">A</span>
        </div>
        <div>
          <h4 style="margin: 0; font-size: 16px; font-weight: 600;">${flowData.name || 'Chat'}</h4>
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">Online</p>
        </div>
      </div>
      <button id="close-chat" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 4px; border-radius: 4px;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='none'">×</button>
    `;

    // Área de mensagens
    const messagesArea = document.createElement('div');
    messagesArea.style.cssText = `
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9fafb;
    `;

    // Mensagem inicial
    const initialMessage = document.createElement('div');
    initialMessage.style.cssText = `
      background: white;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `;
    initialMessage.textContent = 'Olá! Como posso ajudá-lo hoje?';
    messagesArea.appendChild(initialMessage);

    // Área de input
    const inputArea = document.createElement('div');
    inputArea.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: white;
    `;
    
    inputArea.innerHTML = `
      <div style="display: flex; gap: 8px;">
        <input type="text" placeholder="Digite sua mensagem..." style="
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          outline: none;
          font-size: 14px;
        ">
        <button style="
          background: ${colors.primary};
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Enviar</button>
      </div>
    `;

    // Montar o chat
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(messagesArea);
    chatContainer.appendChild(inputArea);

    // Montar o widget
    widgetContainer.appendChild(floatingButton);
    widgetContainer.appendChild(chatContainer);

    // Event listeners
    let isOpen = false;
    
    floatingButton.addEventListener('click', () => {
      isOpen = !isOpen;
      chatContainer.style.display = isOpen ? 'flex' : 'none';
      
      // Atualizar ícone do botão
      floatingButton.innerHTML = isOpen ? 
        '<span style="color: white; font-size: 20px;">×</span>' :
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.418 21 12 21C10.2 21 8.53 20.5 7.14 19.64L3 21L4.36 16.86C3.5 15.47 3 13.8 3 12C3 7.582 7.582 3 12 3C16.418 3 21 7.582 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    });

    const closeButton = chatHeader.querySelector('#close-chat');
    closeButton.addEventListener('click', () => {
      isOpen = false;
      chatContainer.style.display = 'none';
      floatingButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.418 21 12 21C10.2 21 8.53 20.5 7.14 19.64L3 21L4.36 16.86C3.5 15.47 3 13.8 3 12C3 7.582 7.582 3 12 3C16.418 3 21 7.582 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    });

    // Adicionar ao documento
    document.body.appendChild(widgetContainer);
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function init() {
    const flow = await findFlowByCode();
    if (flow) {
      createChatWidget(flow);
    } else {
      console.warn('Envia Lead: Nenhum fluxo encontrado para o código:', flowCode);
    }
  }
})();
