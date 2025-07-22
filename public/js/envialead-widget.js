
// EnviaLead Chat Widget - Design Idêntico ao Sistema
(function() {
  // ====== ESTILOS CSS PARA ANIMAÇÕES ======
  const style = document.createElement('style');
  style.textContent = `
    @keyframes typingDots {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-8px); opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes buttonPulse {
      0% { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
      50% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(255,107,53,0.2); }
      100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    }
    
    .envialead-smooth-transition {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `;
  document.head.appendChild(style);
  
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
        console.log('[EnviaLead] Emails configurados:', result.data.flow_emails);
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
    
    // Determinar o conteúdo do botão baseado no avatar do botão flutuante
    const avatarUrl = flowData.button_avatar_url || flowData.avatar_url;
    if (avatarUrl) {
      if (avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:')) {
        // É uma imagem
        button.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        // É um emoji
        button.innerHTML = avatarUrl;
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
      background: linear-gradient(45deg, ${flowData.colors?.primary || '#FF6B35'}, ${flowData.colors?.secondary || '#3B82F6'});
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
      // Esconder botão quando chat abrir
      button.style.display = 'none';
      openChatModal(flowData);
    };
    
    // Adicionar botão à página
    document.body.appendChild(button);
    
    // Guardar referência global para mostrar/esconder o botão
    window.enviaLeadButton = button;
    
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
    
    // Mostrar botão novamente quando chat fechar
    if (window.enviaLeadButton) {
      window.enviaLeadButton.style.display = 'flex';
    }
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
    title.textContent = flowData.attendant_name || 'Atendimento';
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
      background: ${flowData.colors?.background || '#f8fafc'};
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
    messageDiv.style.cssText = 'animation: fadeInUp 0.3s ease-out;';
    
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

  // Função para mostrar indicador de digitação com animação melhorada
  function showTypingIndicator(flowData) {
    console.log('[EnviaLead] Mostrando typing indicator');
    const messagesContainer = document.getElementById('chat-messages');
    
    if (!messagesContainer) {
      console.warn('[EnviaLead] Container de mensagens não encontrado');
      return;
    }
    
    // Remover indicador existente se houver
    hideTypingIndicator();
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.style.cssText = `
      display: flex;
      justify-content: flex-start;
      margin-bottom: 12px;
      opacity: 0;
      transform: translateY(10px);
      animation: fadeInUp 0.3s ease-out forwards;
    `;
    
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 18px 18px 18px 4px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `;
    
    // Três pontos animados com efeito mais suave
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        background: #9ca3af;
        border-radius: 50%;
        animation: typingDots 1.5s infinite ease-in-out;
        animation-delay: ${i * 0.2}s;
      `;
      bubble.appendChild(dot);
    }
    
    typingDiv.appendChild(bubble);
    messagesContainer.appendChild(typingDiv);
    
    // Scroll suave para baixo
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
    
    console.log('[EnviaLead] Typing indicator adicionado ao DOM');
  }

  // Função para remover indicador de digitação
  function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      console.log('[EnviaLead] Removendo typing indicator');
      indicator.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.remove();
        }
      }, 300);
    }
  }

  // Função para iniciar a conversa
  function startConversation(flowData) {
    console.log('[EnviaLead] Iniciando conversa');
    
    // Mensagem de boas-vindas
    addMessage(flowData.welcome_message || 'Olá! Como posso ajudá-lo?', true, flowData);
    
    // Mostrar primeira pergunta após delay
    if (flowData.questions && flowData.questions.length > 0) {
      setTimeout(() => {
        console.log('[EnviaLead] Mostrando typing indicator antes da primeira pergunta');
        showTypingIndicator(flowData);
        setTimeout(() => {
          hideTypingIndicator();
          showNextQuestion(flowData);
        }, 2000); // Aumentado para 2 segundos
      }, 1000);
    } else {
      setTimeout(() => {
        console.log('[EnviaLead] Mostrando typing indicator - sem perguntas');
        showTypingIndicator(flowData);
        setTimeout(() => {
          hideTypingIndicator();
          showNoQuestionsMessage(flowData);
        }, 2000);
      }, 1000);
    }
  }

  // Função para mostrar a próxima pergunta
  function showNextQuestion(flowData) {
    console.log('[EnviaLead] Mostrando próxima pergunta, índice:', chatState.currentQuestionIndex);
    
    const question = flowData.questions[chatState.currentQuestionIndex];
    if (!question) {
      console.log('[EnviaLead] Não há mais perguntas, mostrando conclusão');
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
      const options = Array.isArray(question.options) ? question.options : [];
      
      if (options.length === 0) {
        console.warn('[EnviaLead] Pergunta de múltipla escolha sem opções:', question);
        addMessage('⚠️ Esta pergunta não possui opções configuradas.', true, flowData);
        setTimeout(() => {
          chatState.currentQuestionIndex++;
          showTypingIndicator(flowData);
          setTimeout(() => {
            hideTypingIndicator();
            showNextQuestion(flowData);
          }, 1500);
        }, 1000);
        return;
      }
      
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
      
      // Definir tipo de input baseado no tipo da pergunta
      if (question.type === 'email') {
        textInput.type = 'email';
      } else if (question.type === 'phone' || question.type === 'telefone') {
        textInput.type = 'tel';
      } else {
        textInput.type = 'text';
      }
      
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
      
      // Aplicar máscara durante a digitação
      textInput.oninput = function() {
        const maskedValue = applyInputMask(this.value, question.type);
        this.value = maskedValue;
      };
      
      textInput.onfocus = function() {
        this.style.borderColor = flowData.colors?.primary || '#FF6B35';
        this.style.background = 'white';
      };
      
      textInput.onblur = function() {
        this.style.borderColor = '#e2e8f0';
        this.style.background = '#f8fafc';
      };
      
      const sendBtn = document.createElement('button');
      sendBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m22 2-7 20-4-9-9-4Z"/>
          <path d="M22 2 11 13"/>
        </svg>
      `;
      sendBtn.style.cssText = `
        padding: 8px;
        width: 40px;
        height: 40px;
        background: linear-gradient(45deg, ${flowData.colors?.primary || '#FF6B35'}, ${flowData.colors?.secondary || '#3B82F6'});
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
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
        
        // Validar input obrigatório
        if (question.required && !value) {
          alert('Este campo é obrigatório.');
          textInput.focus();
          return;
        }
        
        // Validar formato específico
        if (value && !validateInput(value, question.type)) {
          let errorMessage = 'Formato inválido.';
          
          if (question.type === 'email') {
            errorMessage = 'Por favor, digite um email válido.';
          } else if (question.type === 'phone' || question.type === 'telefone') {
            errorMessage = 'Por favor, digite um telefone válido.';
          }
          
          alert(errorMessage);
          textInput.focus();
          return;
        }
        
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
    console.log('[EnviaLead] Resposta recebida:', questionId, answer);
    
    chatState.responses[questionId] = answer;
    
    // Mostrar resposta do usuário
    addMessage(answer, false, flowData);
    
    // Limpar input
    const inputContainer = document.getElementById('chat-input-container');
    inputContainer.innerHTML = '';
    
    // Próxima pergunta com indicador de digitação
    chatState.currentQuestionIndex++;
    
    setTimeout(() => {
      console.log('[EnviaLead] Mostrando typing indicator após resposta');
      showTypingIndicator(flowData);
      setTimeout(() => {
        hideTypingIndicator();
        showNextQuestion(flowData);
      }, 1800); // Timing melhorado
    }, 500);
    
    // Salvar lead parcial no banco
    saveLead(flowData, false);
  }

  // Função para mostrar mensagem de conclusão
  function showCompletionMessage(flowData) {
    console.log('[EnviaLead] Mostrando mensagem de conclusão');
    
    const inputContainer = document.getElementById('chat-input-container');

    // Salvar lead completo no banco
    saveLead(flowData, true);

    // Mensagem de agradecimento customizável
    const finalMessage = flowData.final_message_custom || flowData.final_message || 'Obrigado pelo seu contato! Em breve entraremos em contato.';
    addMessage(`✅ ${finalMessage}`, true, flowData);

    // Botão do WhatsApp se configurado - com informações completas
    inputContainer.innerHTML = '';
    if (flowData.whatsapp && flowData.show_whatsapp_button !== false) {
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
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
        `;
        
        whatsappBtn.onmouseenter = function() {
          this.style.background = '#128c7e';
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
        };
        
        whatsappBtn.onmouseleave = function() {
          this.style.background = '#25d366';
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.3)';
        };
        
        whatsappBtn.onclick = function() {
          // Criar mensagem com todas as informações coletadas
          let detailedMessage = flowData.whatsapp_message_template || 'Olá! Acabei de preencher o formulário no site e gostaria de continuar a conversa.\n\nInformações fornecidas:';
          
          // Adicionar todas as respostas à mensagem do WhatsApp
          for (const [question, answer] of Object.entries(chatState.responses)) {
            detailedMessage += `\n• ${question}: ${answer}`;
          }
          
          detailedMessage += `\n\nSite: ${window.location.href}`;
          
          const finalMessage = replaceVariables(detailedMessage, chatState.responses);
          const whatsappUrl = `https://wa.me/${flowData.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(finalMessage)}`;
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

  // Função para substituir variáveis no texto
  function replaceVariables(text, responses) {
    if (!text || !responses) return text;
    
    let result = text;
    
    // Substituir variáveis comuns
    for (const [key, value] of Object.entries(responses)) {
      const placeholders = [
        `#${key}`,
        `{${key}}`,
        `{{${key}}}`,
        `[${key}]`
      ];
      
      placeholders.forEach(placeholder => {
        result = result.replace(new RegExp(placeholder, 'gi'), value);
      });
    }
    
    // Variáveis especiais
    result = result.replace(/#nome/gi, responses.nome || responses.name || 'usuário');
    result = result.replace(/#email/gi, responses.email || '');
    result = result.replace(/#telefone/gi, responses.telefone || responses.phone || '');
    result = result.replace(/#empresa/gi, responses.empresa || responses.company || '');
    
    return result;
  }

  // Função para aplicar máscaras de input
  function applyInputMask(value, type) {
    switch (type) {
      case 'phone':
      case 'telefone':
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length <= 10) {
          return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
          return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
      case 'email':
        return value.toLowerCase().trim();
      default:
        return value;
    }
  }

  // Função para validar inputs
  function validateInput(value, type) {
    switch (type) {
      case 'phone':
      case 'telefone':
        const cleanPhone = value.replace(/\D/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      default:
        return value.trim().length > 0;
    }
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
        
        // Enviar por email se lead completo E há emails configurados
        if (completed && flowData.flow_emails && flowData.flow_emails.length > 0) {
          console.log('[EnviaLead] Lead completo, enviando por email...');
          sendLeadByEmail(flowData, chatState.responses);
        } else if (completed) {
          console.log('[EnviaLead] Lead completo mas sem emails configurados');
        }
      } else {
        console.error('[EnviaLead] Erro ao salvar lead:', result.error);
      }
    })
    .catch(error => {
      console.error('[EnviaLead] Erro na requisição de salvamento:', error);
    });
  }

  // Função para enviar lead por email
  function sendLeadByEmail(flowData, responses) {
    console.log('[EnviaLead] ===== INICIANDO ENVIO DE EMAIL =====');
    console.log('[EnviaLead] FlowData completo:', flowData);
    console.log('[EnviaLead] Respostas:', responses);
    
    // Verificar se há emails configurados - MÚLTIPLAS VERIFICAÇÕES
    let emails = [];
    
    if (flowData.flow_emails && Array.isArray(flowData.flow_emails)) {
      emails = flowData.flow_emails.map(e => e.email).filter(email => email && email.trim());
      console.log('[EnviaLead] Emails de flow_emails:', emails);
    }
    
    if (emails.length === 0 && flowData.emails && Array.isArray(flowData.emails)) {
      emails = flowData.emails.filter(email => email && email.trim());
      console.log('[EnviaLead] Emails de emails:', emails);
    }
    
    if (emails.length === 0) {
      console.warn('[EnviaLead] ❌ NENHUM EMAIL CONFIGURADO PARA RECEBER LEADS');
      console.warn('[EnviaLead] FlowData.flow_emails:', flowData.flow_emails);
      console.warn('[EnviaLead] FlowData.emails:', flowData.emails);
      return;
    }
    
    console.log('[EnviaLead] ✅ Emails encontrados:', emails);
    
    const emailData = {
      flow_id: flowData.id,
      flow_name: flowData.name,
      responses: responses,
      emails: emails,
      url: window.location.href
    };

    console.log('[EnviaLead] Dados para envio:', emailData);

    fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/send-lead-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
      },
      body: JSON.stringify(emailData)
    })
    .then(response => {
      console.log('[EnviaLead] 📧 Status da resposta HTTP:', response.status);
      console.log('[EnviaLead] 📧 Headers da resposta:', [...response.headers.entries()]);
      return response.json();
    })
    .then(result => {
      console.log('[EnviaLead] 📧 Resposta completa da função:', result);
      if (result.success) {
        console.log('[EnviaLead] ✅ EMAIL ENVIADO COM SUCESSO!', result);
        console.log('[EnviaLead] Detalhes do envio:', result.results);
      } else {
        console.error('[EnviaLead] ❌ ERRO AO ENVIAR EMAIL:', result.error);
        if (result.error && result.error.includes('RESEND_API_KEY')) {
          console.error('[EnviaLead] 💡 SOLUÇÃO: Configure RESEND_API_KEY no Supabase');
          console.error('[EnviaLead] 🔗 Link: https://supabase.com/dashboard/project/fuzkdrkhvmaimpgzvimq/settings/functions');
        }
      }
    })
    .catch(error => {
      console.error('[EnviaLead] ❌ ERRO NA REQUISIÇÃO DE EMAIL:', error);
      console.error('[EnviaLead] Stack trace:', error.stack);
    });
    
    console.log('[EnviaLead] ===== FIM DO ENVIO DE EMAIL =====');
  }

  // Função para testar envio de email
  function testEmail(flowData) {
    console.log('[EnviaLead] 🧪 TESTE DE EMAIL INICIADO');
    
    const testData = {
      flow_id: flowData.id,
      flow_name: `TESTE - ${flowData.name}`,
      responses: {
        'teste': 'Este é um email de teste do EnviaLead',
        'email': 'alexandre@chromotech.com.br',
        'nome': 'Teste EnviaLead'
      },
      emails: ['alexandre@chromotech.com.br'],
      url: window.location.href
    };

    fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/send-lead-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
      },
      body: JSON.stringify(testData)
    })
    .then(response => response.json())
    .then(result => {
      console.log('[EnviaLead] 🧪 RESULTADO DO TESTE:', result);
    })
    .catch(error => {
      console.error('[EnviaLead] 🧪 ERRO NO TESTE:', error);
    });
  }

  // Expor função de teste globalmente para debug
  window.enviaLeadTestEmail = function() {
    console.log('[EnviaLead] Executando teste de email via console...');
    // Buscar dados do fluxo primeiro
    loadFlowData(flowId).then(flowData => {
      testEmail(flowData);
    });
  };

})();
