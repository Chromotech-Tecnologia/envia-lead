// EnviaLead Chat Widget - Chat Completo
(function() {
  console.log('[EnviaLead] Iniciando widget...');
  
  // Pegar Flow ID da URL do script
  let flowId = null;
  const scripts = document.getElementsByTagName('script');
  
  for (let script of scripts) {
    if (script.src && script.src.includes('envialead-chat.js')) {
      const url = new URL(script.src);
      flowId = url.searchParams.get('flow');
      break;
    }
  }
  
  console.log('[EnviaLead] Flow ID da URL:', flowId);
  
  if (!flowId) {
    console.log('[EnviaLead] Nenhum Flow ID encontrado na URL');
    return;
  }

  // Estado do chat
  let flowData = null;
  let isOpen = false;
  let messages = [];
  let currentQuestionIndex = 0;
  let responses = {};
  let waitingForInput = false;
  let questions = [];
  let botMessages = [];

  // Carregar dados do flow
  async function loadFlowData() {
    try {
      const response = await fetch(`https://jzxdjvhfxqjdlmdcpwxb.supabase.co/functions/v1/get-flow-data?flow_id=${flowId}`);
      const data = await response.json();
      flowData = data;
      
      // Processar perguntas e mensagens
      if (flowData.questions) {
        const allItems = flowData.questions
          .map(q => ({
            id: q.id,
            type: q.type,
            title: q.title,
            placeholder: q.placeholder,
            required: q.required,
            order: q.order_index || q.order || 0,
            options: q.options || []
          }))
          .sort((a, b) => a.order - b.order);
        
        questions = allItems.filter(item => item.type !== 'bot_message');
        botMessages = allItems.filter(item => item.type === 'bot_message');
      }
      
      console.log('[EnviaLead] Dados do flow carregados:', flowData);
      createWidget();
    } catch (error) {
      console.error('[EnviaLead] Erro ao carregar dados do flow:', error);
    }
  }

  function createWidget() {
    // Criar botão
    const button = document.createElement('div');
    const buttonSize = flowData?.button_size || 60;
    
    if (flowData?.button_avatar_url) {
      button.innerHTML = `<img src="${flowData.button_avatar_url}" alt="Chat" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`;
    } else {
      button.innerHTML = '💬';
      button.style.fontSize = `${buttonSize * 0.4}px`;
    }
    
    button.style.cssText = `
      position: fixed;
      bottom: ${20 + (flowData?.button_offset_y || 0)}px;
      right: ${20 + (flowData?.button_offset_x || 0)}px;
      width: ${buttonSize}px;
      height: ${buttonSize}px;
      background: ${flowData?.colors?.primary || '#FF6B35'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.3s ease;
    `;
    
    button.onmouseover = () => button.style.transform = 'scale(1.1)';
    button.onmouseout = () => button.style.transform = 'scale(1)';
    button.onclick = toggleChat;
    
    // Criar janela do chat
    const chatWindow = document.createElement('div');
    chatWindow.id = 'envialead-chat-window';
    chatWindow.style.cssText = `
      position: fixed;
      bottom: ${80 + (flowData?.chat_offset_y || 0)}px;
      right: ${20 + (flowData?.chat_offset_x || 0)}px;
      width: ${flowData?.chat_width || 400}px;
      height: ${flowData?.chat_height || 500}px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 999998;
      display: none;
      flex-direction: column;
      overflow: hidden;
    `;
    
    // Header do chat
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(45deg, ${flowData?.colors?.primary || '#FF6B35'}, ${flowData?.colors?.secondary || '#3B82F6'});
      color: ${flowData?.colors?.headerText || '#FFFFFF'};
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    
    const headerContent = document.createElement('div');
    headerContent.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    
    const avatar = document.createElement('div');
    if (flowData?.avatar_url) {
      avatar.innerHTML = `<img src="${flowData.avatar_url}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />`;
    } else {
      avatar.innerHTML = '👤';
      avatar.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px;';
    }
    
    const headerInfo = document.createElement('div');
    headerInfo.innerHTML = `
      <div style="font-weight: 600; font-size: 14px;">${flowData?.attendant_name || 'Atendimento'}</div>
      <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 4px;">
        <div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite;"></div>
        Online agora
      </div>
    `;
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: inherit;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.3s;
    `;
    closeButton.onmouseover = () => closeButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
    closeButton.onmouseout = () => closeButton.style.backgroundColor = 'transparent';
    closeButton.onclick = toggleChat;
    
    headerContent.appendChild(avatar);
    headerContent.appendChild(headerInfo);
    header.appendChild(headerContent);
    header.appendChild(closeButton);
    
    // Área de mensagens
    const messagesArea = document.createElement('div');
    messagesArea.id = 'envialead-messages';
    messagesArea.style.cssText = `
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background-color: ${flowData?.colors?.background || '#F9FAFB'};
    `;
    
    // Área de input
    const inputArea = document.createElement('div');
    inputArea.id = 'envialead-input-area';
    inputArea.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: white;
      display: none;
    `;
    
    const input = document.createElement('input');
    input.id = 'envialead-input';
    input.style.cssText = `
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      outline: none;
      font-size: 14px;
    `;
    
    const sendButton = document.createElement('button');
    sendButton.innerHTML = '→';
    sendButton.style.cssText = `
      position: absolute;
      right: 24px;
      background: ${flowData?.colors?.primary || '#FF6B35'};
      color: white;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    sendButton.onclick = sendMessage;
    
    inputArea.style.position = 'relative';
    inputArea.appendChild(input);
    inputArea.appendChild(sendButton);
    
    chatWindow.appendChild(header);
    chatWindow.appendChild(messagesArea);
    chatWindow.appendChild(inputArea);
    
    document.body.appendChild(button);
    document.body.appendChild(chatWindow);
    
    // Adicionar estilos CSS para animações
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }

  function toggleChat() {
    isOpen = !isOpen;
    const chatWindow = document.getElementById('envialead-chat-window');
    
    if (isOpen) {
      chatWindow.style.display = 'flex';
      if (messages.length === 0) {
        startConversation();
      }
    } else {
      chatWindow.style.display = 'none';
    }
  }

  function startConversation() {
    setTimeout(() => {
      addMessage(flowData?.welcome_message || 'Olá! Como posso ajudá-lo hoje?', true);
      setTimeout(() => {
        showNextQuestion();
      }, 1000);
    }, 500);
  }

  function addMessage(text, isBot) {
    const messagesArea = document.getElementById('envialead-messages');
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      margin-bottom: 16px;
      display: flex;
      ${isBot ? 'justify-content: flex-start' : 'justify-content: flex-end'};
    `;
    
    const messageBubble = document.createElement('div');
    messageBubble.style.cssText = `
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      ${isBot 
        ? `background: #f3f4f6; color: #374151; border-bottom-left-radius: 4px;`
        : `background: ${flowData?.colors?.primary || '#FF6B35'}; color: white; border-bottom-right-radius: 4px;`
      }
    `;
    messageBubble.textContent = text;
    
    messageDiv.appendChild(messageBubble);
    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    messages.push({ text, isBot });
  }

  function showNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
      showCompletion();
      return;
    }

    const question = questions[currentQuestionIndex];
    addMessage(question.title, true);
    
    if (question.type === 'single' && question.options) {
      showOptions(question.options);
    } else {
      showInput(question);
    }
  }

  function showOptions(options) {
    const messagesArea = document.getElementById('envialead-messages');
    const optionsDiv = document.createElement('div');
    optionsDiv.style.cssText = 'margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px;';
    
    options.forEach(option => {
      const button = document.createElement('button');
      button.textContent = option;
      button.style.cssText = `
        padding: 8px 12px;
        background: white;
        border: 1px solid #f97316;
        color: #f97316;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        text-align: left;
        transition: background-color 0.3s;
      `;
      button.onmouseover = () => button.style.backgroundColor = '#fff7ed';
      button.onmouseout = () => button.style.backgroundColor = 'white';
      button.onclick = () => selectOption(option, optionsDiv);
      optionsDiv.appendChild(button);
    });
    
    messagesArea.appendChild(optionsDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function selectOption(option, optionsDiv) {
    optionsDiv.remove();
    addMessage(option, false);
    
    const question = questions[currentQuestionIndex];
    responses[question.id] = option;
    currentQuestionIndex++;
    
    setTimeout(showNextQuestion, 1000);
  }

  function showInput(question) {
    const inputArea = document.getElementById('envialead-input-area');
    const input = document.getElementById('envialead-input');
    
    input.placeholder = question.placeholder || 'Digite sua resposta...';
    input.type = question.type === 'email' ? 'email' : question.type === 'number' ? 'tel' : 'text';
    
    inputArea.style.display = 'block';
    waitingForInput = true;
    
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    };
  }

  function sendMessage() {
    const input = document.getElementById('envialead-input');
    const value = input.value.trim();
    
    if (!value || !waitingForInput) return;
    
    addMessage(value, false);
    
    const question = questions[currentQuestionIndex];
    responses[question.id] = value;
    currentQuestionIndex++;
    
    input.value = '';
    document.getElementById('envialead-input-area').style.display = 'none';
    waitingForInput = false;
    
    setTimeout(showNextQuestion, 1000);
  }

  function showCompletion() {
    const finalMessage = flowData?.final_message_custom || flowData?.final_message || 'Obrigado pelas informações! Em breve entraremos em contato.';
    addMessage(finalMessage, true);
    
    // Salvar lead
    setTimeout(() => {
      saveLead();
    }, 1000);
  }

  async function saveLead() {
    try {
      const leadData = {
        flow_id: flowId,
        responses: responses,
        source_url: window.location.href
      };
      
      await fetch('https://jzxdjvhfxqjdlmdcpwxb.supabase.co/functions/v1/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      
      console.log('[EnviaLead] Lead salvo com sucesso');
    } catch (error) {
      console.error('[EnviaLead] Erro ao salvar lead:', error);
    }
  }

  // Inicializar
  loadFlowData();
})();