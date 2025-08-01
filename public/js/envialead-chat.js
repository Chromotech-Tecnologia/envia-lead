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
  let isTyping = false;
  let showCompletion = false;

  // Função para substituir variáveis no texto
  function replaceVariables(text, responses) {
    let processedText = text;
    
    // Criar mapeamento de IDs de perguntas para labels mais amigáveis
    const variableMap = {};
    
    questions.forEach((question, index) => {
      const questionTitle = question.title.toLowerCase();
      const answer = responses[question.id] || '';
      
      // Mapear variáveis baseadas no conteúdo da pergunta
      if (questionTitle.includes('nome')) {
        variableMap['#nome'] = answer;
        variableMap['#name'] = answer;
      }
      if (questionTitle.includes('telefone') || questionTitle.includes('celular')) {
        variableMap['#telefone'] = answer;
        variableMap['#phone'] = answer;
      }
      if (questionTitle.includes('email') || questionTitle.includes('e-mail')) {
        variableMap['#email'] = answer;
      }
      if (questionTitle.includes('empresa') || questionTitle.includes('company')) {
        variableMap['#empresa'] = answer;
        variableMap['#company'] = answer;
      }
      if (questionTitle.includes('cidade') || questionTitle.includes('city')) {
        variableMap['#cidade'] = answer;
        variableMap['#city'] = answer;
      }
      
      // Mapear também por posição para templates genéricos
      variableMap[`#resposta${index + 1}`] = answer;
      variableMap[`#answer${index + 1}`] = answer;
    });
    
    // Substituir as variáveis no texto
    Object.keys(variableMap).forEach(variable => {
      if (variableMap[variable]) {
        const regex = new RegExp(variable, 'gi');
        processedText = processedText.replace(regex, variableMap[variable]);
      }
    });
    
    console.log('[EnviaLead] Texto original:', text);
    console.log('[EnviaLead] Variáveis mapeadas:', variableMap);
    console.log('[EnviaLead] Texto processado:', processedText);
    
    return processedText;
  }

  // Carregar dados do flow
  async function loadFlowData() {
    try {
      const response = await fetch(`https://jzxdjvhfxqjdlmdcpwxb.supabase.co/functions/v1/get-flow-data?flow_id=${flowId}`);
      const data = await response.json();
      flowData = data;
      
      // Processar perguntas e mensagens com a mesma lógica do preview
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
        
        // Separar perguntas e mensagens do bot
        questions = allItems.filter(item => item.type !== 'bot_message');
        botMessages = allItems.filter(item => item.type === 'bot_message');
        
        console.log('[EnviaLead] Perguntas processadas:', questions);
        console.log('[EnviaLead] Mensagens do bot:', botMessages);
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
    sendButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(90 12 12)"/>
      </svg>
    `;
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
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    `;
    sendButton.onmouseover = () => sendButton.style.transform = 'scale(1.1)';
    sendButton.onmouseout = () => sendButton.style.transform = 'scale(1)';
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

  function addMessage(text, isBot) {
    // Se for mensagem do bot, processar variáveis
    const processedText = isBot ? replaceVariables(text, responses) : text;
    
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
    messageBubble.textContent = processedText;
    
    messageDiv.appendChild(messageBubble);
    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    messages.push({ text: processedText, isBot });
  }

  function showTypingIndicator() {
    const messagesArea = document.getElementById('envialead-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.style.cssText = `
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-start;
    `;
    
    const typingBubble = document.createElement('div');
    typingBubble.style.cssText = `
      background: #f3f4f6;
      padding: 12px 16px;
      border-radius: 18px 18px 18px 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    
    // Criar pontos de digitação
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 6px;
        height: 6px;
        background: #9ca3af;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
        animation-delay: ${i * 0.2}s;
      `;
      typingBubble.appendChild(dot);
    }
    
    // Adicionar animação de digitação
    if (!document.getElementById('typing-animation-style')) {
      const style = document.createElement('style');
      style.id = 'typing-animation-style';
      style.textContent = `
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    typingDiv.appendChild(typingBubble);
    messagesArea.appendChild(typingDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    isTyping = true;
  }

  function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
    isTyping = false;
  }

  function startConversation() {
    setTimeout(() => {
      addMessage(flowData?.welcome_message || 'Olá! Como posso ajudá-lo hoje?', true);
      setTimeout(() => {
        showTypingIndicator();
        setTimeout(() => {
          hideTypingIndicator();
          showNextQuestion();
        }, 1500);
      }, 1000);
    }, 500);
  }

  function showNextQuestion() {
    // Não mostrar digitação se já estamos mostrando
    if (isTyping) {
      return;
    }
    
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      if (question) {
        addMessage(question.title, true);
        waitingForInput = true;
        
        if (question.type === 'single' && question.options && question.options.length > 0) {
          showOptions(question.options);
        } else if (question.type === 'multiple' && question.options && question.options.length > 0) {
          showOptions(question.options);
        } else {
          showInput(question);
        }
      }
    } else {
      showCompletion();
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
    
    // Mostrar digitação antes da próxima pergunta
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      setTimeout(showNextQuestion, 500);
    }, 1500);
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
    
    // Mostrar digitação antes da próxima pergunta
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      setTimeout(showNextQuestion, 500);
    }, 1500);
  }

  function showCompletion() {
    const finalMessage = flowData?.final_message_custom || flowData?.final_message || 'Obrigado pelas informações! Em breve entraremos em contato.';
    addMessage(finalMessage, true);
    
    // Mostrar botão do WhatsApp se configurado
    if (flowData?.whatsapp && flowData?.show_whatsapp_button !== false) {
      setTimeout(() => {
        showWhatsappButton();
      }, 1000);
    }
    
    // Salvar lead
    setTimeout(() => {
      saveLead();
    }, 1000);
  }

  function showWhatsappButton() {
    const messagesArea = document.getElementById('envialead-messages');
    const whatsappDiv = document.createElement('div');
    whatsappDiv.style.cssText = `
      margin-bottom: 16px;
      display: flex;
      justify-content: center;
      padding: 0 20px;
    `;
    
    const whatsappButton = document.createElement('button');
    whatsappButton.innerHTML = '💬 Continuar no WhatsApp';
    whatsappButton.style.cssText = `
      padding: 12px 24px;
      background: #25D366;
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
      width: 100%;
      max-width: 250px;
    `;
    
    whatsappButton.onmouseover = () => {
      whatsappButton.style.backgroundColor = '#128C7E';
      whatsappButton.style.transform = 'scale(1.05)';
    };
    whatsappButton.onmouseout = () => {
      whatsappButton.style.backgroundColor = '#25D366';
      whatsappButton.style.transform = 'scale(1)';
    };
    
    whatsappButton.onclick = () => {
      // Usar template personalizado com variáveis substituídas
      let messageText = flowData?.whatsapp_message_template || 'Olá, meu nome é #nome e gostaria de mais informações.';
      
      // Substituir variáveis no template
      messageText = replaceVariables(messageText, responses);
      
      const whatsappNumber = flowData.whatsapp.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
      
      console.log('[EnviaLead] Abrindo WhatsApp:', whatsappUrl);
      console.log('[EnviaLead] Mensagem processada:', messageText);
      
      window.open(whatsappUrl, '_blank');
    };
    
    whatsappDiv.appendChild(whatsappButton);
    messagesArea.appendChild(whatsappDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
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