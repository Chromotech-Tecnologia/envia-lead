
// EnviaLead Chat Widget - API System v6.0
// Este arquivo funciona como uma API que busca dados do servidor e exibe o chat

(function() {
  'use strict';

  console.log('[EnviaLead] Inicializando API do chat v6.0...');

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

  // Extrair Flow ID do script
  function extractFlowId() {
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
    
    console.log('[EnviaLead] Flow ID final extraído:', flowId);
    return flowId;
  }

  // Converter EL_ format para actual flow ID
  async function convertFlowId(flowId) {
    console.log('[EnviaLead] Convertendo Flow ID:', flowId);
    
    if (!flowId || !flowId.startsWith('EL_')) {
      console.log('[EnviaLead] Flow ID já no formato correto ou inválido');
      return flowId;
    }

    try {
      const response = await fetch(`${API_BASE}/rest/v1/flows?select=*`, {
        headers: defaultHeaders
      });

      if (response.ok) {
        const allFlows = await response.json();
        console.log('[EnviaLead] Total de fluxos encontrados:', allFlows.length);
        
        for (const flow of allFlows) {
          const code = `EL_${flow.id.replace(/-/g, '').substring(0, 16).toUpperCase()}`;
          if (code === flowId) {
            console.log('[EnviaLead] Flow ID convertido:', flowId, '->', flow.id);
            return flow.id;
          }
        }
        
        console.log('[EnviaLead] Nenhum fluxo encontrado para o código:', flowId);
      }
    } catch (error) {
      console.error('[EnviaLead] Erro ao converter Flow ID:', error);
    }

    return flowId;
  }

  // Buscar dados do fluxo da API
  async function fetchFlowData(flowId) {
    try {
      console.log('[EnviaLead] Buscando dados do fluxo:', flowId);
      
      const actualFlowId = await convertFlowId(flowId);
      console.log('[EnviaLead] Flow ID após conversão:', actualFlowId);

      if (!actualFlowId) {
        throw new Error('Flow ID inválido');
      }

      const response = await fetch(`${API_BASE}/rest/v1/flows?id=eq.${actualFlowId}&select=*,questions(*),flow_urls(*),flow_emails(*)`, {
        headers: defaultHeaders
      });

      console.log('[EnviaLead] Status da resposta:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }

      const flows = await response.json();
      console.log('[EnviaLead] Resposta da API:', flows);

      if (!flows || flows.length === 0) {
        console.error('[EnviaLead] Fluxo não encontrado para ID:', actualFlowId);
        return null;
      }

      const flow = flows[0];
      console.log('[EnviaLead] Fluxo encontrado:', flow.name);
      console.log('[EnviaLead] Fluxo ativo:', flow.is_active);
      
      return flow;
    } catch (error) {
      console.error('[EnviaLead] Erro ao buscar dados do fluxo:', error);
      return null;
    }
  }

  // Verificar se URL está autorizada
  function isUrlAuthorized(currentUrl, authorizedUrls) {
    console.log('[EnviaLead] Verificando autorização de URL...');
    console.log('[EnviaLead] URL atual:', currentUrl);
    console.log('[EnviaLead] URLs autorizadas:', authorizedUrls);
    
    if (!authorizedUrls || authorizedUrls.length === 0) {
      console.log('[EnviaLead] Nenhuma URL configurada, permitindo em qualquer domínio');
      return true;
    }

    const validUrls = authorizedUrls.filter(urlObj => urlObj.url && urlObj.url.trim() !== '');
    if (validUrls.length === 0) {
      console.log('[EnviaLead] Nenhuma URL válida configurada, permitindo em qualquer domínio');
      return true;
    }

    const currentDomain = new URL(currentUrl).hostname;
    
    for (const urlObj of validUrls) {
      const authorizedUrl = urlObj.url;
      console.log('[EnviaLead] Verificando URL autorizada:', authorizedUrl);
      
      if (authorizedUrl === '*') {
        console.log('[EnviaLead] Wildcard encontrado, permitindo acesso');
        return true;
      }
      
      const normalizedAuth = authorizedUrl.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');
      const normalizedCurrent = currentUrl.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');
      
      if (normalizedCurrent === normalizedAuth || 
          normalizedCurrent.includes(normalizedAuth) || 
          currentDomain.includes(normalizedAuth.split('/')[0])) {
        console.log('[EnviaLead] URL autorizada');
        return true;
      }
    }

    console.log('[EnviaLead] URL não autorizada');
    return false;
  }

  // Salvar lead na API
  async function saveLead(flowId, responses) {
    try {
      const leadData = {
        flow_id: flowId,
        responses: responses,
        completed: true,
        user_agent: navigator.userAgent,
        url: window.location.href,
        created_at: new Date().toISOString()
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

  // Variáveis globais do chat
  let chatOpen = false;
  let currentQuestionIndex = 0;
  let responses = {};
  let questions = [];
  let flowData = null;
  let colors = null;

  // Inicializar chat
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
        order: q.order_index || q.order || 0,
        options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : []
      }))
      .sort((a, b) => a.order - b.order) : [];
    
    console.log('[EnviaLead] Chat inicializado com', questions.length, 'perguntas');
  }

  // Toggle chat
  function toggleChat() {
    chatOpen = !chatOpen;
    console.log('[EnviaLead] Toggle chat:', chatOpen);
    
    const chatWindow = document.getElementById('envialead-chat-window');
    const welcomeBubble = document.getElementById('envialead-welcome-bubble');
    const floatingButton = document.getElementById('envialead-floating-button');
    
    if (chatOpen) {
      chatWindow.style.display = 'flex';
      if (welcomeBubble) welcomeBubble.style.display = 'none';
      floatingButton.innerHTML = '×';
      if (currentQuestionIndex === 0) {
        setTimeout(() => showNextQuestion(), 500);
      }
    } else {
      chatWindow.style.display = 'none';
      floatingButton.innerHTML = '💬';
    }
  }

  // Adicionar mensagem
  function addMessage(text, isBot = true) {
    const chatMessages = document.getElementById('envialead-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      ${isBot ? 'justify-content: flex-start' : 'justify-content: flex-end'};
      animation: messageSlideIn 0.3s ease-out;
    `;
    
    const messageBubble = document.createElement('div');
    messageBubble.style.cssText = `
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
    messageBubble.textContent = text;
    
    messageDiv.appendChild(messageBubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Mostrar indicador de digitação
  function showTypingIndicator() {
    const chatMessages = document.getElementById('envialead-chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-start;
    `;
    
    typingDiv.innerHTML = `
      <div style="background: white; border: 1px solid #e5e7eb; padding: 10px 14px; border-radius: 18px 18px 18px 4px; font-size: 14px;">
        <div style="display: flex; gap: 4px; align-items: center;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite;"></div>
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite 0.2s;"></div>
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite 0.4s;"></div>
        </div>
      </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
  }

  // Remover indicador de digitação
  function removeTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) {
      typing.remove();
    }
  }

  // Mostrar próxima pergunta
  function showNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
      showCompletion();
      return;
    }

    const question = questions[currentQuestionIndex];
    console.log('[EnviaLead] Mostrando pergunta:', question.title);
    
    const typing = showTypingIndicator();
    
    setTimeout(() => {
      removeTypingIndicator();
      addMessage(question.title, true);
      showQuestionInput(question);
    }, 1500);
  }

  // Mostrar input da pergunta
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
                 style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                 onfocus="this.style.borderColor='${colors.primary}'"
                 onblur="this.style.borderColor='#e5e7eb'"
                 ${question.required ? 'required' : ''}>
          <button id="send-answer" style="margin-top: 8px; width: 100%; padding: 12px; background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Enviar</button>
        `;
        break;
        
      case 'select':
        const options = question.options || [];
        inputHTML = `
          <select id="question-input" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; background: white;" ${question.required ? 'required' : ''}>
            <option value="">Selecione uma opção...</option>
            ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
          </select>
          <button id="send-answer" style="margin-top: 8px; width: 100%; padding: 12px; background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Enviar</button>
        `;
        break;
        
      case 'radio':
        const radioOptions = question.options || [];
        inputHTML = `
          <div style="margin-bottom: 12px; max-height: 200px; overflow-y: auto;">
            ${radioOptions.map((opt, idx) => `
              <label style="display: block; margin-bottom: 8px; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s; background: white;" 
                     onmouseover="this.style.borderColor='${colors.primary}'; this.style.backgroundColor='#f8fafc';" 
                     onmouseout="this.style.borderColor='#e5e7eb'; this.style.backgroundColor='white';"
                     onclick="this.querySelector('input').checked=true; this.style.borderColor='${colors.primary}'; this.style.backgroundColor='#f0f9ff';">
                <input type="radio" name="question-radio" value="${opt}" style="margin-right: 10px;" ${question.required ? 'required' : ''}>
                ${opt}
              </label>
            `).join('')}
          </div>
          <button id="send-answer" style="width: 100%; padding: 12px; background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Enviar</button>
        `;
        break;
    }
    
    inputArea.innerHTML = inputHTML;
    
    const sendBtn = document.getElementById('send-answer');
    const input = document.getElementById('question-input');
    
    const sendAnswer = () => {
      let answer = '';
      
      if (question.type === 'radio') {
        const selected = document.querySelector('input[name="question-radio"]:checked');
        answer = selected ? selected.value : '';
      } else {
        answer = input ? input.value.trim() : '';
      }
      
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

  // Mostrar finalização
  function showCompletion() {
    addMessage('Obrigado pelas informações! Em breve entraremos em contato.', true);
    
    saveLead(flowData.id, responses);
    
    if (flowData.whatsapp) {
      setTimeout(() => showWhatsAppButton(), 2000);
    }
  }

  // Mostrar botão WhatsApp
  function showWhatsAppButton() {
    const inputArea = document.getElementById('envialead-chat-input-area');
    
    let messageText = 'Olá! Gostaria de continuar nossa conversa. Aqui estão minhas informações:\n\n';
    
    questions.forEach(q => {
      if (responses[q.id]) {
        messageText += `${q.title}: ${responses[q.id]}\n`;
      }
    });
    
    const whatsappNumber = flowData.whatsapp.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
    
    inputArea.innerHTML = `
      <a href="${whatsappUrl}" target="_blank" style="display: block; width: 100%; padding: 12px; background: #25d366; color: white; text-decoration: none; border-radius: 8px; text-align: center; font-size: 14px; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#22c55e'" onmouseout="this.style.background='#25d366'">
        💬 Continuar no WhatsApp
      </a>
    `;
  }

  // Criar widget
  function createWidget(flowData) {
    console.log('[EnviaLead] Criando widget para fluxo:', flowData.name);

    const existing = document.getElementById('envialead-chat-container');
    if (existing) {
      existing.remove();
    }

    injectStyles();

    const colors = flowData.colors || {
      primary: '#FF6B35',
      secondary: '#3B82F6',
      text: '#1F2937',
      background: '#FFFFFF'
    };

    const position = flowData.position || 'bottom-right';
    const positionStyles = getPositionStyles(position);

    const container = document.createElement('div');
    container.id = 'envialead-chat-container';
    container.style.cssText = `
      position: fixed;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ${positionStyles}
    `;

    const button = document.createElement('div');
    button.id = 'envialead-floating-button';
    button.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary});
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      font-size: 24px;
    `;
    button.innerHTML = '💬';

    const welcomeBubble = document.createElement('div');
    welcomeBubble.id = 'envialead-welcome-bubble';
    welcomeBubble.style.cssText = `
      position: absolute;
      bottom: 70px;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 12px 16px;
      max-width: 250px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: block;
      opacity: 1;
      transition: all 0.3s ease;
    `;

    const welcomeMessage = flowData.welcome_message || 'Olá! Como posso ajudá-lo?';
    welcomeBubble.innerHTML = `
      <div style="position: relative;">
        <button id="envialead-close-welcome" style="position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border: none; background: #f3f4f6; border-radius: 50%; cursor: pointer; font-size: 12px;">×</button>
        <p style="margin: 0; font-size: 14px; color: ${colors.text};">${welcomeMessage}</p>
      </div>
    `;

    const chatWindow = document.createElement('div');
    chatWindow.id = 'envialead-chat-window';
    const chatWindowPosition = getChatWindowPosition(position);
    chatWindow.style.cssText = `
      position: fixed;
      ${chatWindowPosition}
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 10001;
    `;

    const chatHeader = document.createElement('div');
    chatHeader.style.cssText = `
      background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary});
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    chatHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        ${flowData.avatar_url ? 
          `<img src="${flowData.avatar_url}" style="width: 32px; height: 32px; border-radius: 50%;" alt="Avatar">` : 
          '<div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">👤</div>'
        }
        <div>
          <div style="font-weight: 600; font-size: 14px;">${flowData.name || 'Atendimento'}</div>
          <div style="font-size: 12px; opacity: 0.9;">Online</div>
        </div>
      </div>
      <button id="envialead-close-chat" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
    `;

    const chatMessages = document.createElement('div');
    chatMessages.id = 'envialead-chat-messages';
    chatMessages.style.cssText = `
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9fafb;
    `;

    const chatInputArea = document.createElement('div');
    chatInputArea.id = 'envialead-chat-input-area';
    chatInputArea.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: white;
    `;

    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(chatMessages);
    chatWindow.appendChild(chatInputArea);

    container.appendChild(button);
    container.appendChild(welcomeBubble);
    container.appendChild(chatWindow);
    document.body.appendChild(container);

    initializeChat(flowData, colors);

    button.addEventListener('click', toggleChat);
    
    setTimeout(() => {
      const closeWelcomeBtn = document.getElementById('envialead-close-welcome');
      if (closeWelcomeBtn) {
        closeWelcomeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          welcomeBubble.style.display = 'none';
        });
      }
      
      const closeChatBtn = document.getElementById('envialead-close-chat');
      if (closeChatBtn) {
        closeChatBtn.addEventListener('click', toggleChat);
      }
    }, 100);

    console.log('[EnviaLead] Widget criado com sucesso!');
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
      'top-right': 'top: 90px; right: 20px;',
      'top-left': 'top: 90px; left: 20px;'
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

  // Inicialização principal
  async function initialize() {
    try {
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

      if (!flow.is_active) {
        console.log('[EnviaLead] Fluxo está inativo');
        return;
      }

      if (!isUrlAuthorized(currentUrl, flow.flow_urls)) {
        console.log('[EnviaLead] URL não autorizada para este fluxo');
        return;
      }

      console.log('[EnviaLead] Criando widget...');
      createWidget(flow);
    } catch (error) {
      console.error('[EnviaLead] Erro na inicialização:', error);
    }
  }

  // Iniciar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    setTimeout(initialize, 100);
  }

})();
