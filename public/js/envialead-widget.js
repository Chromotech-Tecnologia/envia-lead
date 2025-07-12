// EnviaLead Chat Widget - Design Idêntico ao Sistema
(function() {
  console.log('[EnviaLead] Iniciando widget integrado...');
  
  // Pegar Flow ID da URL do script
  let flowId = null;
  const scripts = document.getElementsByTagName('script');
  
  for (let script of scripts) {
    if (script.src && script.src.includes('envialead-widget')) {
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
  
  // Buscar dados do fluxo no servidor - usar ID real do fluxo
  loadFlowData(flowId);
  
  // Função para buscar dados do fluxo
  function loadFlowData(flowId) {
    console.log('[EnviaLead] Buscando dados do fluxo:', flowId);
    
    const apiUrl = 'https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/get-flow-data?flow_id=' + flowId;
    
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Referer': window.location.href
      }
    })
    .then(response => response.json())
    .then(result => {
      if (result.success && result.data) {
        console.log('[EnviaLead] Dados do fluxo carregados:', result.data);
        createChatWidget(result.data);
      } else {
        console.error('[EnviaLead] Erro ao carregar fluxo:', result.error);
        // Não criar widget se não conseguir carregar dados
      }
    })
    .catch(error => {
      console.error('[EnviaLead] Erro na requisição:', error);
      // Não criar widget se houver erro
    });
  }
  
  // Função para criar o widget de chat
  function createChatWidget(flowData) {
    console.log('[EnviaLead] Criando widget com dados:', flowData);
    
    // Determinar posição do botão
    const buttonPosition = flowData.button_position || 'bottom-right';
    const buttonOffsetX = flowData.button_offset_x || 0;
    const buttonOffsetY = flowData.button_offset_y || 0;
    const buttonSize = flowData.button_size || 60;
    
    const isButtonLeft = buttonPosition.includes('left');
    const isButtonTop = buttonPosition.includes('top');
    const isButtonCenter = buttonPosition.includes('center');
    
    // Criar botão do chat
    const button = document.createElement('div');
    
    // Determinar o conteúdo do botão baseado no avatar
    if (flowData.avatar_url) {
      if (flowData.avatar_url.startsWith('http') || flowData.avatar_url.startsWith('blob:')) {
        // É uma imagem
        button.innerHTML = `<img src="${flowData.avatar_url}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        // É um emoji
        button.innerHTML = flowData.avatar_url;
      }
    } else {
      // Usar ícone padrão
      button.innerHTML = '💬';
    }
    
    // Calcular posição do botão
    let buttonCSS = `
      position: fixed;
      width: ${buttonSize}px;
      height: ${buttonSize}px;
      background: ${flowData.colors?.primary || '#FF6B35'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${buttonSize * 0.4}px;
      color: white;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.2s ease;
      overflow: hidden;
    `;
    
    // Adicionar posicionamento
    if (isButtonTop) {
      buttonCSS += `top: ${20 + buttonOffsetY}px;`;
    } else {
      buttonCSS += `bottom: ${20 + buttonOffsetY}px;`;
    }
    
    if (isButtonLeft) {
      buttonCSS += `left: ${20 + buttonOffsetX}px;`;
    } else if (isButtonCenter && buttonPosition.includes('center')) {
      buttonCSS += `left: 50%; transform: translateX(-50%);`;
    } else {
      buttonCSS += `right: ${20 + buttonOffsetX}px;`;
    }
    
    button.style.cssText = buttonCSS;
    
    // Efeito hover
    button.onmouseenter = function() {
      button.style.transform = button.style.transform.includes('translateX') ? 
        'translateX(-50%) scale(1.1)' : 'scale(1.1)';
    };
    
    button.onmouseleave = function() {
      button.style.transform = button.style.transform.includes('translateX') ? 
        'translateX(-50%) scale(1)' : 'scale(1)';
    };
    
    // Ação do clique
    button.onclick = function() {
      openChatModal(flowData);
    };
    
    // Adicionar botão à página
    document.body.appendChild(button);
    console.log('[EnviaLead] Widget criado para fluxo:', flowData.name);
  }
  
  // Estado do chat
  let chatState = {
    isOpen: false,
    currentQuestionIndex: 0,
    responses: {},
    isTyping: false,
    messages: []
  };

  // Função para abrir o modal de chat
  function openChatModal(flowData) {
    console.log('[EnviaLead] Abrindo chat para fluxo:', flowData.name);
    
    if (chatState.isOpen) {
      closeChatModal();
      return;
    }
    
    chatState.isOpen = true;
    createChatModal(flowData);
  }

  // Função para fechar o chat
  function closeChatModal() {
    const existingModal = document.getElementById('envialead-chat-modal');
    if (existingModal) {
      existingModal.remove();
    }
    chatState.isOpen = false;
  }

  // Função para criar o modal de chat completo
  function createChatModal(flowData) {
    // Determinar posição do chat
    const chatPosition = flowData.chat_position || 'bottom-right';
    const chatOffsetX = flowData.chat_offset_x || 0;
    const chatOffsetY = flowData.chat_offset_y || 0;
    const chatWidth = flowData.chat_width || 400;
    const chatHeight = flowData.chat_height || 500;
    
    const isChatLeft = chatPosition.includes('left');
    const isChatTop = chatPosition.includes('top');
    const isChatCenter = chatPosition.includes('center');
    
    const modal = document.createElement('div');
    modal.id = 'envialead-chat-modal';
    
    // Calcular posição do modal
    let modalCSS = `
      position: fixed;
      width: ${chatWidth}px;
      height: ${chatHeight}px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 999998;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Adicionar posicionamento do chat
    if (isChatTop) {
      modalCSS += `top: ${20 + chatOffsetY}px;`;
    } else {
      modalCSS += `bottom: ${100 + chatOffsetY}px;`;
    }
    
    if (isChatLeft) {
      modalCSS += `left: ${20 + chatOffsetX}px;`;
    } else if (isChatCenter && chatPosition.includes('center')) {
      modalCSS += `left: 50%; transform: translateX(-50%);`;
    } else {
      modalCSS += `right: ${20 + chatOffsetX}px;`;
    }
    
    modal.style.cssText = modalCSS;

    // Header do chat - Estilo idêntico ao ChatPreviewWindow
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(45deg, ${flowData.colors?.primary || '#FF6B35'}, ${flowData.colors?.secondary || '#3B82F6'});
      color: white;
      padding: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    
    const headerInfo = document.createElement('div');
    headerInfo.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    
    const avatar = document.createElement('div');
    avatar.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      overflow: hidden;
    `;
    
    // Usar o mesmo avatar do botão
    if (flowData.avatar_url) {
      if (flowData.avatar_url.startsWith('http') || flowData.avatar_url.startsWith('blob:')) {
        avatar.innerHTML = `<img src="${flowData.avatar_url}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        avatar.textContent = flowData.avatar_url;
      }
    } else {
      avatar.textContent = '👤';
    }
    
    const titleDiv = document.createElement('div');
    const title = document.createElement('div');
    title.textContent = 'Atendimento';
    title.style.cssText = 'font-weight: 600; font-size: 14px;';
    
    const status = document.createElement('div');
    status.style.cssText = 'font-size: 12px; opacity: 90%; display: flex; align-items: center; gap: 4px;';
    status.innerHTML = '<div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite;"></div>Online agora';
    
    titleDiv.appendChild(title);
    titleDiv.appendChild(status);
    headerInfo.appendChild(avatar);
    headerInfo.appendChild(titleDiv);
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    `;
    closeBtn.onmouseenter = function() {
      this.style.background = 'rgba(255,255,255,0.3)';
    };
    closeBtn.onmouseleave = function() {
      this.style.background = 'rgba(255,255,255,0.2)';
    };
    closeBtn.onclick = closeChatModal;
    
    header.appendChild(headerInfo);
    header.appendChild(closeBtn);

    // Container das mensagens - Fundo igual ao sistema
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'chat-messages';
    messagesContainer.style.cssText = `
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f8fafc;
    `;

    // Container do input
    const inputContainer = document.createElement('div');
    inputContainer.id = 'chat-input-container';
    inputContainer.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e2e8f0;
      background: white;
    `;

    modal.appendChild(header);
    modal.appendChild(messagesContainer);
    modal.appendChild(inputContainer);
    document.body.appendChild(modal);

    // Iniciar conversa
    startConversation(flowData);
  }

  // Função para adicionar mensagem ao chat
  function addMessage(text, isBot = false, flowData) {
    const messagesContainer = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`;
    
    const bubble = document.createElement('div');
    bubble.className = 'max-w-xs px-3 py-2 text-sm';
    bubble.textContent = text;
    
    if (isBot) {
      // Estilo da mensagem do bot - idêntico ao ChatMessages.tsx
      bubble.style.cssText = `
        background-color: white;
        color: ${flowData.colors?.text || '#1F2937'};
        border: 1px solid #e5e7eb;
        border-radius: 18px 18px 18px 4px;
        max-width: 240px;
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.4;
      `;
    } else {
      // Estilo da mensagem do usuário - idêntico ao ChatMessages.tsx
      bubble.style.cssText = `
        background: linear-gradient(45deg, ${flowData.colors?.primary || '#FF6B35'}, ${flowData.colors?.secondary || '#3B82F6'});
        color: white;
        border-radius: 18px 18px 4px 18px;
        max-width: 240px;
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.4;
      `;
    }
    
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll para baixo
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Função para mostrar indicador de digitação
  function showTypingIndicator(flowData) {
    const messagesContainer = document.getElementById('chat-messages');
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'flex justify-start mb-3';
    
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 18px 18px 18px 4px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    
    // Três pontos animados - idêntico ao ChatMessages.tsx
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        background: #9ca3af;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
        animation-delay: ${i * 0.16}s;
      `;
      bubble.appendChild(dot);
    }
    
    typingDiv.appendChild(bubble);
    messagesContainer.appendChild(typingDiv);
    
    // Scroll para baixo
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Função para remover indicador de digitação
  function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  // Função para iniciar a conversa
  function startConversation(flowData) {
    // Mensagem de boas-vindas
    addMessage(flowData.welcomeMessage || 'Olá! Como posso ajudá-lo?', true, flowData);
    
    // Mostrar primeira pergunta após delay
    if (flowData.questions && flowData.questions.length > 0) {
      setTimeout(() => {
        showTypingIndicator(flowData);
        setTimeout(() => {
          hideTypingIndicator();
          showNextQuestion(flowData);
        }, 1500);
      }, 1000);
    } else {
      setTimeout(() => {
        showTypingIndicator(flowData);
        setTimeout(() => {
          hideTypingIndicator();
          showNoQuestionsMessage(flowData);
        }, 1500);
      }, 1000);
    }
  }

  // Função para mostrar a próxima pergunta
  function showNextQuestion(flowData) {
    const question = flowData.questions[chatState.currentQuestionIndex];
    if (!question) {
      showCompletionMessage(flowData);
      return;
    }

    const inputContainer = document.getElementById('chat-input-container');

    // Adicionar mensagem da pergunta
    addMessage(question.title, true, flowData);

    // Criar input baseado no tipo de pergunta
    inputContainer.innerHTML = '';
    
    if (question.type === 'single' || question.type === 'multiple' || question.type === 'select' || question.type === 'radio') {
      // Opções de múltipla escolha
      const options = question.options || [];
      options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.textContent = option;
        optionBtn.style.cssText = `
          display: block;
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: #f1f5f9;
          border: 2px solid #e2e8f0;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          color: #334155;
          text-align: left;
        `;
        
        optionBtn.onmouseover = function() {
          this.style.background = flowData.colors?.primary || '#FF6B35';
          this.style.color = 'white';
          this.style.borderColor = flowData.colors?.primary || '#FF6B35';
        };
        
        optionBtn.onmouseout = function() {
          this.style.background = '#f1f5f9';
          this.style.color = '#334155';
          this.style.borderColor = '#e2e8f0';
        };
        
        optionBtn.onclick = function() {
          handleAnswer(question.id, option, flowData);
        };
        
        inputContainer.appendChild(optionBtn);
      });
    } else {
      // Input de texto
      const inputGroup = document.createElement('div');
      inputGroup.style.cssText = 'display: flex; gap: 8px; align-items: center;';
      
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = question.placeholder || 'Digite sua resposta...';
      textInput.style.cssText = `
        flex: 1;
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 24px;
        outline: none;
        font-size: 14px;
        background: #f8fafc;
      `;
      
      textInput.onfocus = function() {
        this.style.borderColor = flowData.colors?.primary || '#FF6B35';
        this.style.background = 'white';
      };
      
      textInput.onblur = function() {
        this.style.borderColor = '#e2e8f0';
        this.style.background = '#f8fafc';
      };
      
      const sendBtn = document.createElement('button');
      sendBtn.innerHTML = '→';
      sendBtn.style.cssText = `
        padding: 12px;
        width: 44px;
        height: 44px;
        background: ${flowData.colors?.primary || '#FF6B35'};
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      `;
      
      sendBtn.onmouseenter = function() {
        this.style.transform = 'scale(1.05)';
      };
      
      sendBtn.onmouseleave = function() {
        this.style.transform = 'scale(1)';
      };
      
      const handleSend = () => {
        const value = textInput.value.trim();
        if (value) {
          handleAnswer(question.id, value, flowData);
        }
      };
      
      sendBtn.onclick = handleSend;
      textInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
          handleSend();
        }
      };
      
      inputGroup.appendChild(textInput);
      inputGroup.appendChild(sendBtn);
      inputContainer.appendChild(inputGroup);
      
      textInput.focus();
    }
  }

  // Função para lidar com a resposta
  function handleAnswer(questionId, answer, flowData) {
    chatState.responses[questionId] = answer;
    
    // Mostrar resposta do usuário
    addMessage(answer, false, flowData);
    
    // Limpar input
    const inputContainer = document.getElementById('chat-input-container');
    inputContainer.innerHTML = '';
    
    // Próxima pergunta com indicador de digitação
    chatState.currentQuestionIndex++;
    
    setTimeout(() => {
      showTypingIndicator(flowData);
      setTimeout(() => {
        hideTypingIndicator();
        showNextQuestion(flowData);
      }, 1200);
    }, 500);
    
    // Salvar lead parcial no banco
    saveLead(flowData, false);
  }

  // Função para mostrar mensagem de conclusão
  function showCompletionMessage(flowData) {
    const inputContainer = document.getElementById('chat-input-container');

    // Salvar lead completo no banco
    saveLead(flowData, true);

    // Mensagem de agradecimento
    addMessage('✅ Obrigado! Suas respostas foram registradas com sucesso.', true, flowData);

    // Botão do WhatsApp se configurado
    inputContainer.innerHTML = '';
    if (flowData.whatsapp && flowData.showWhatsappButton) {
      setTimeout(() => {
        const whatsappBtn = document.createElement('button');
        whatsappBtn.innerHTML = '💬 Continuar no WhatsApp';
        whatsappBtn.style.cssText = `
          width: 100%;
          padding: 16px;
          background: #25d366;
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        `;
        
        whatsappBtn.onmouseenter = function() {
          this.style.background = '#128c7e';
          this.style.transform = 'translateY(-1px)';
        };
        
        whatsappBtn.onmouseleave = function() {
          this.style.background = '#25d366';
          this.style.transform = 'translateY(0)';
        };
        
        whatsappBtn.onclick = function() {
          const message = 'Olá! Acabei de preencher o formulário no site e gostaria de continuar a conversa.';
          const whatsappUrl = `https://wa.me/${flowData.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        };
        
        inputContainer.appendChild(whatsappBtn);
      }, 1000);
    }
  }

  // Função para mostrar mensagem quando não há perguntas
  function showNoQuestionsMessage(flowData) {
    addMessage('Obrigado pelo contato! Em breve entraremos em contato.', true, flowData);
    
    const inputContainer = document.getElementById('chat-input-container');
    inputContainer.innerHTML = '';
    
    // Salvar lead vazio
    saveLead(flowData, true);
  }

  // Função para salvar lead
  function saveLead(flowData, completed) {
    console.log('[EnviaLead] Salvando lead:', { flowData: flowData.id, responses: chatState.responses, completed });
    
    const leadData = {
      flow_id: flowData.id,
      responses: chatState.responses,
      completed: completed,
      url: window.location.href,
      user_agent: navigator.userAgent
    };

    fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/save-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leadData)
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log('[EnviaLead] Lead salvo com sucesso:', result.data);
      } else {
        console.error('[EnviaLead] Erro ao salvar lead:', result.error);
      }
    })
    .catch(error => {
      console.error('[EnviaLead] Erro na requisição de salvamento:', error);
    });
  }

  // Adicionar estilos de animação
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `;
  document.head.appendChild(style);

})();