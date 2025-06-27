
// EnviaLead Chat Widget - Sistema Simplificado v4.0
// Este arquivo carrega e inicializa o chat widget diretamente

(function() {
  'use strict';

  console.log('[EnviaLead] Inicializando sistema v4.0...');

  // Prevenir carregamento duplo
  if (window.enviaLeadLoaded) {
    console.log('[EnviaLead] Sistema já carregado');
    return;
  }
  window.enviaLeadLoaded = true;

  // Configurações da API
  const API_BASE = 'https://fuzkdrkhvmaimpgzvimq.supabase.co';
  const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA';

  const defaultHeaders = {
    'apikey': API_KEY,
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };

  // Extrair Flow ID
  function extractFlowId() {
    let flowId = null;
    
    // Método 1: Verificar data-flow-id no script atual
    const currentScript = document.currentScript;
    if (currentScript) {
      flowId = currentScript.getAttribute('data-flow-id');
    }
    
    // Método 2: Buscar em todos os scripts com data-flow-id
    if (!flowId) {
      const scripts = document.querySelectorAll('script[data-flow-id]');
      if (scripts.length > 0) {
        flowId = scripts[scripts.length - 1].getAttribute('data-flow-id');
      }
    }
    
    // Método 3: Verificar variável global
    if (!flowId) {
      flowId = window.enviaLeadId;
    }
    
    console.log('[EnviaLead] Flow ID extraído:', flowId);
    return flowId;
  }

  // Converter EL_ format para actual flow ID
  async function convertFlowId(flowId) {
    if (!flowId.startsWith('EL_')) {
      return flowId;
    }

    try {
      const response = await fetch(`${API_BASE}/rest/v1/flows?select=*,questions(*),flow_urls(*),flow_emails(*)`, {
        headers: defaultHeaders
      });

      if (response.ok) {
        const allFlows = await response.json();
        
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
  }

  // Buscar dados do fluxo
  async function fetchFlowData(flowId) {
    try {
      const actualFlowId = await convertFlowId(flowId);
      
      const response = await fetch(`${API_BASE}/rest/v1/flows?id=eq.${actualFlowId}&select=*,questions(*),flow_urls(*),flow_emails(*)`, {
        headers: defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const flows = await response.json();
      
      if (!flows || flows.length === 0) {
        console.log('[EnviaLead] Fluxo não encontrado');
        return null;
      }

      return flows[0];
    } catch (error) {
      console.error('[EnviaLead] Erro ao buscar fluxo:', error);
      return null;
    }
  }

  // Verificar se URL está autorizada
  function isUrlAuthorized(currentUrl, authorizedUrls) {
    if (!authorizedUrls || authorizedUrls.length === 0) {
      return true;
    }

    const validUrls = authorizedUrls.filter(urlObj => urlObj.url && urlObj.url.trim() !== '');
    if (validUrls.length === 0) {
      return true;
    }

    const currentDomain = new URL(currentUrl).hostname;
    
    for (const urlObj of validUrls) {
      const authorizedUrl = urlObj.url;
      
      if (authorizedUrl === '*') {
        return true;
      }
      
      const normalizedAuth = authorizedUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
      const normalizedCurrent = currentUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // Verificar correspondência exata ou contenção
      if (normalizedCurrent === normalizedAuth || normalizedCurrent.includes(normalizedAuth)) {
        return true;
      }
      
      // Verificar domínio
      const authDomain = normalizedAuth.split('/')[0];
      if (currentDomain.includes(authDomain) || authDomain.includes(currentDomain)) {
        return true;
      }
    }

    console.log('[EnviaLead] URL não autorizada:', currentUrl);
    console.log('[EnviaLead] URLs autorizadas:', validUrls.map(u => u.url));
    return false;
  }

  // Criar widget
  function createWidget(flowData) {
    // Remover widget existente
    const existing = document.getElementById('envialead-chat-container');
    if (existing) {
      existing.remove();
    }

    // Injetar estilos
    injectStyles();

    const colors = flowData.colors || {
      primary: '#FF6B35',
      secondary: '#3B82F6',
      text: '#1F2937',
      background: '#FFFFFF'
    };

    const position = flowData.position || 'bottom-right';
    const positionStyles = getPositionStyles(position);

    // Container principal
    const container = document.createElement('div');
    container.id = 'envialead-chat-container';
    container.style.cssText = 'position: fixed; z-index: 10000;';

    // Botão flutuante
    const button = document.createElement('div');
    button.id = 'envialead-floating-button';
    button.style.cssText = `
      ${positionStyles}
      position: fixed;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary});
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
      z-index: 10001;
    `;
    
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
    `;

    // Janela do chat
    const chatWindow = document.createElement('div');
    chatWindow.id = 'envialead-chat-window';
    chatWindow.style.cssText = `
      ${getChatWindowPosition(position)}
      position: fixed;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      z-index: 10002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    chatWindow.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${flowData.name || 'Chat'}</h3>
        <button id="envialead-close-chat" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">×</button>
      </div>
      <div id="envialead-chat-messages" style="flex: 1; padding: 16px; overflow-y: auto; max-height: 350px;"></div>
      <div id="envialead-chat-input-area" style="padding: 16px; border-top: 1px solid #e5e7eb;"></div>
    `;

    container.appendChild(button);
    container.appendChild(chatWindow);
    document.body.appendChild(container);

    // Inicializar chat
    initializeChat(flowData, colors);

    // Event listeners
    button.addEventListener('click', () => toggleChat());
    
    const closeBtn = chatWindow.querySelector('#envialead-close-chat');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => toggleChat());
    }

    console.log('[EnviaLead] Widget criado com sucesso!');
  }

  // Funcionalidade do chat
  let chatOpen = false;
  let currentQuestionIndex = 0;
  let responses = {};
  let questions = [];
  let flowData = null;
  let colors = null;

  function initializeChat(flow, flowColors) {
    flowData = flow;
    colors = flowColors;
    questions = flow.questions ? flow.questions
      .map(q => ({
        id: q.id,
        type: q.type,
        title: q.title,
        placeholder: q.placeholder,
        required: q.required,
        order: q.order_index || 0,
        options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : []
      }))
      .sort((a, b) => a.order - b.order) : [];
    
    console.log('[EnviaLead] Chat inicializado com', questions.length, 'perguntas');
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    const chatWindow = document.getElementById('envialead-chat-window');
    
    if (chatOpen) {
      chatWindow.style.display = 'flex';
      if (currentQuestionIndex === 0) {
        setTimeout(() => showNextQuestion(), 500);
      }
    } else {
      chatWindow.style.display = 'none';
    }
  }

  function addMessage(text, isBot = true) {
    const messagesContainer = document.getElementById('envialead-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      ${isBot ? 'justify-content: flex-start' : 'justify-content: flex-end'};
    `;
    
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      ${isBot ? 
        `background: white; color: ${colors.text}; border: 1px solid #e5e7eb; border-radius: 18px 18px 18px 4px;` : 
        `background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; border-radius: 18px 18px 4px 18px;`
      }
    `;
    bubble.textContent = text;
    
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
      showCompletion();
      return;
    }

    const question = questions[currentQuestionIndex];
    
    setTimeout(() => {
      addMessage(question.title, true);
      showQuestionInput(question);
    }, 1000);
  }

  function showQuestionInput(question) {
    const inputArea = document.getElementById('envialead-chat-input-area');
    
    let inputHTML = '';
    
    switch (question.type) {
      case 'text':
      case 'email':
      case 'phone':
        inputHTML = `
          <input type="${question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text'}" 
                 id="question-input" 
                 placeholder="${question.placeholder || 'Digite sua resposta...'}" 
                 style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none;">
          <button id="send-answer" style="margin-top: 8px; width: 100%; padding: 12px; background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Enviar</button>
        `;
        break;
        
      case 'select':
        const options = question.options || [];
        inputHTML = `
          <select id="question-input" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; background: white;">
            <option value="">Selecione uma opção...</option>
            ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
          </select>
          <button id="send-answer" style="margin-top: 8px; width: 100%; padding: 12px; background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Enviar</button>
        `;
        break;
    }
    
    inputArea.innerHTML = inputHTML;
    
    const sendBtn = document.getElementById('send-answer');
    const input = document.getElementById('question-input');
    
    const sendAnswer = () => {
      const answer = input ? input.value.trim() : '';
      
      if (question.required && !answer) {
        alert('Por favor, responda esta pergunta.');
        return;
      }
      
      responses[question.id] = answer;
      addMessage(answer, false);
      currentQuestionIndex++;
      inputArea.innerHTML = '';
      setTimeout(() => showNextQuestion(), 1000);
    };
    
    if (sendBtn) {
      sendBtn.addEventListener('click', sendAnswer);
    }
    
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendAnswer();
        }
      });
      input.focus();
    }
  }

  function showCompletion() {
    addMessage('Obrigado pelas informações! Em breve entraremos em contato.', true);
    
    // Salvar lead
    saveLead();
  }

  async function saveLead() {
    try {
      const leadData = {
        flow_id: flowData.id,
        responses: responses,
        completed: true,
        user_agent: navigator.userAgent,
        url: window.location.href,
        created_at: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE}/rest/v1/leads`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        console.log('[EnviaLead] Lead salvo com sucesso');
      }
    } catch (error) {
      console.error('[EnviaLead] Erro ao salvar lead:', error);
    }
  }

  // Utilitários
  function getPositionStyles(position) {
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;'
    };
    return positions[position] || positions['bottom-right'];
  }

  function getChatWindowPosition(position) {
    const positions = {
      'bottom-right': 'bottom: 90px; right: 20px;',
      'bottom-left': 'bottom: 90px; left: 20px;',
      'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
    };
    return positions[position] || positions['bottom-right'];
  }

  function injectStyles() {
    if (document.getElementById('envialead-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'envialead-styles';
    style.textContent = `
      #envialead-floating-button:hover {
        transform: scale(1.1) !important;
      }
      #envialead-chat-window * {
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
  }

  // Inicialização principal
  async function initialize() {
    const flowId = extractFlowId();
    const currentUrl = window.location.href;
    
    console.log('[EnviaLead] Inicializando com Flow ID:', flowId);
    console.log('[EnviaLead] URL atual:', currentUrl);

    if (!flowId) {
      console.error('[EnviaLead] Flow ID não encontrado');
      return;
    }

    const flow = await fetchFlowData(flowId);
    
    if (!flow) {
      console.error('[EnviaLead] Fluxo não encontrado');
      return;
    }

    console.log('[EnviaLead] Fluxo carregado:', flow.name);

    if (!flow.is_active) {
      console.log('[EnviaLead] Fluxo está inativo');
      return;
    }

    // Verificar URLs autorizadas
    if (!isUrlAuthorized(currentUrl, flow.flow_urls)) {
      console.log('[EnviaLead] URL não autorizada para este fluxo');
      return;
    }

    console.log('[EnviaLead] Criando widget...');
    createWidget(flow);
  }

  // Iniciar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
