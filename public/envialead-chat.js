
(function() {
  'use strict';

  // Configurações
  const SUPABASE_URL = 'https://fuzkdrkhvmaimpgzvimq.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA';

  // Função para encontrar o fluxo baseado na URL atual
  async function findFlowByUrl() {
    const currentUrl = window.location.hostname;
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/flows?select=*,flow_urls(url)&is_active=eq.true`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const flows = await response.json();
      
      // Encontrar fluxo que corresponde à URL atual
      const matchingFlow = flows.find(flow => 
        flow.flow_urls?.some(urlObj => 
          currentUrl.includes(urlObj.url) || urlObj.url.includes(currentUrl)
        )
      );
      
      return matchingFlow;
    } catch (error) {
      console.error('Erro ao buscar fluxo:', error);
      return null;
    }
  }

  // Função para criar o widget de chat
  function createChatWidget(flowData) {
    const position = flowData.position || 'bottom-right';
    const colors = flowData.colors || {
      primary: '#FF6B35',
      secondary: '#3B82F6',
      text: '#1F2937',
      background: '#FFFFFF'
    };

    // Criar container do widget
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'envialead-chat-widget';
    widgetContainer.style.cssText = `
      position: fixed;
      ${position.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
      ${position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // Botão flutuante
    const floatingButton = document.createElement('button');
    floatingButton.style.cssText = `
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
      width: 320px;
      height: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      border: 1px solid #e5e7eb;
      display: none;
      flex-direction: column;
      overflow: hidden;
      position: absolute;
      ${position.includes('bottom') ? 'bottom: 70px;' : 'top: 70px;'}
      ${position.includes('right') ? 'right: 0;' : 'left: 0;'}
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
      <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${flowData.name || 'Chat'}</h3>
      <button id="close-chat" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 4px;">×</button>
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
      <input type="text" placeholder="Digite sua mensagem..." style="
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        outline: none;
        font-size: 14px;
      ">
    `;

    // Montar o chat
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(messagesArea);
    chatContainer.appendChild(inputArea);

    // Montar o widget
    widgetContainer.appendChild(floatingButton);
    widgetContainer.appendChild(chatContainer);

    // Event listeners
    floatingButton.addEventListener('click', () => {
      chatContainer.style.display = chatContainer.style.display === 'none' ? 'flex' : 'none';
    });

    const closeButton = chatHeader.querySelector('#close-chat');
    closeButton.addEventListener('click', () => {
      chatContainer.style.display = 'none';
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
    const flow = await findFlowByUrl();
    if (flow) {
      createChatWidget(flow);
    }
  }
})();
