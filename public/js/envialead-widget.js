(function() {
  'use strict';

  // Obter o script atual para capturar parâmetros
  const scriptTag = document.currentScript || document.querySelector('script[src*="envialead-widget.js"]');
  
  if (!scriptTag) {
    console.error('[EnviaLead] Script tag não encontrado');
    return;
  }

  const flowId = scriptTag.getAttribute('data-flow-id');
  
  if (!flowId) {
    console.error('[EnviaLead] Flow ID não fornecido');
    return;
  }

  console.log('[EnviaLead] Inicializando widget para flow:', flowId);

  // Adicionar CSS das animações no head
  const style = document.createElement('style');
  style.textContent = `
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

    @keyframes typingDots {
      0%, 20% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.5);
        opacity: 0.7;
      }
      80%, 100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes buttonPulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7);
      }
      70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(255, 107, 53, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(255, 107, 53, 0);
      }
    }

    .envialead-typing-dots {
      animation: typingDots 1.4s infinite ease-in-out;
    }
  `;
  document.head.appendChild(style);

  // Função para carregar dados do fluxo
  function loadFlowData(flowId) {
    console.log('[EnviaLead] Carregando dados do fluxo:', flowId);
    
    return fetch(`https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/get-flow-data?flow_id=${flowId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
      }
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
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
  
  // ============ FUNÇÕES DE UTILIDADE ============
  
  // Funções de máscara e validação
  function maskPhone(value) {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 10) {
      return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  }

  function maskEmail(value) {
    return value.toLowerCase().trim();
  }

  function validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function applyInputMask(value, type) {
    switch (type) {
      case 'phone':
      case 'telefone':
        return maskPhone(value);
      case 'email':
        return maskEmail(value);
      default:
        return value;
    }
  }

  function validateInput(value, type) {
    switch (type) {
      case 'phone':
      case 'telefone':
        return validatePhone(value);
      case 'email':
        return validateEmail(value);
      default:
        return value.trim().length > 0;
    }
  }
  
  // Função para substituir variáveis
  function replaceVariables(text, responses) {
    if (!text || !responses) return text;
    
    let result = text;
    for (const [key, value] of Object.entries(responses)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
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
    button.id = 'envialead-chat-button';
    
    // CSS do botão
    let buttonCSS = `
      position: fixed;
      width: ${buttonSize}px;
      height: ${buttonSize}px;
      background: linear-gradient(45deg, ${flowData.colors?.primary || '#FF6B35'}, ${flowData.colors?.secondary || '#3B82F6'});
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      animation: buttonPulse 2s infinite;
    `;
    
    // Adicionar posicionamento do botão
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
    
    // Ícone do botão
    button.innerHTML = `
      <svg width="${buttonSize * 0.5}" height="${buttonSize * 0.5}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    `;
    
    // Adicionar hover effect
    button.onmouseenter = function() {
      this.style.transform = 'scale(1.1)';
      this.style.animation = 'none';
    };
    
    button.onmouseleave = function() {
      this.style.transform = 'scale(1)';
      this.style.animation = 'buttonPulse 2s infinite';
    };
    
    // Event listener para abrir chat
    button.onclick = function() {
      openChatModal(flowData);
    };
    
    // Adicionar botão ao DOM
    document.body.appendChild(button);
    
    // Armazenar referência global
    window.enviaLeadButton = button;
    
    console.log('[EnviaLead] Widget criado e adicionado ao DOM');
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
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    `;
    avatar.textContent = (flowData.attendant_name || 'Atendente').charAt(0).toUpperCase();
    
    const headerText = document.createElement('div');
    headerText.innerHTML = `
      <div style="font-weight: 600; font-size: 14px;">${flowData.attendant_name || 'Atendente'}</div>
      <div style="font-size: 12px; opacity: 0.9;">Online agora</div>
    `;
    
    headerInfo.appendChild(avatar);
    headerInfo.appendChild(headerText);
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    `;
    closeBtn.onmouseenter = function() {
      this.style.background = 'rgba(255,255,255,0.2)';
    };
    closeBtn.onmouseleave = function() {
      this.style.background = 'none';
    };
    closeBtn.onclick = closeChatModal;
    
    header.appendChild(headerInfo);
    header.appendChild(closeBtn);

    // Container de mensagens
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'envialead-messages';
    messagesContainer.style.cssText = `
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // Container de input
    const inputContainer = document.createElement('div');
    inputContainer.id = 'envialead-input';
    inputContainer.style.cssText = `
      padding: 20px;
      border-top: 1px solid #e2e8f0;
      background: white;
    `;

    modal.appendChild(header);
    modal.appendChild(messagesContainer);
    modal.appendChild(inputContainer);
    
    document.body.appendChild(modal);
    
    // Ocultar botão quando chat abrir
    if (window.enviaLeadButton) {
      window.enviaLeadButton.style.display = 'none';
    }

    // Iniciar conversa
    startConversation(flowData);
  }

  // Função para adicionar mensagem ao chat
  function addMessage(text, isBot, flowData) {
    const messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      display: flex;
      justify-content: ${isBot ? 'flex-start' : 'flex-end'};
      margin-bottom: 12px;
      opacity: 0;
      transform: translateY(10px);
      animation: fadeInUp 0.3s ease-out forwards;
    `;

    const bubble = document.createElement('div');
    bubble.textContent = text;
    
    if (isBot) {
      bubble.style.cssText = `
        background-color: white;
        border: 1px solid #e5e7eb;
        color: #374151;
        border-radius: 18px 18px 18px 4px;
        max-width: 240px;
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.4;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      `;
    } else {
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

  // Função para mostrar indicador de digitação (três pontos)
  function showTypingIndicator(flowData) {
    console.log('[EnviaLead] ⌨️ Mostrando typing indicator');
    
    const messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) {
      console.error('[EnviaLead] ❌ Container de mensagens não encontrado para typing indicator');
      return;
    }
    
    // Verificar se já existe um indicador
    if (document.getElementById('typing-indicator')) {
      console.log('[EnviaLead] ⚠️ Typing indicator já existe, removendo o anterior');
      hideTypingIndicator();
    }
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.style.cssText = `
      display: flex;
      justify-content: flex-start;
      margin-bottom: 12px;
      opacity: 0;
      transform: translateY(10px);
      animation: fadeInUp 0.5s ease-out forwards;
    `;
    
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 18px 18px 18px 4px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      max-width: 60px;
    `;
    
    // Três pontos animados com efeito mais visível
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        background: #6b7280;
        border-radius: 50%;
        animation: typingDots 1.4s infinite ease-in-out;
        animation-delay: ${i * 0.2}s;
      `;
      bubble.appendChild(dot);
    }
    
    typingDiv.appendChild(bubble);
    messagesContainer.appendChild(typingDiv);
    
    // Força o scroll para baixo
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
    
    console.log('[EnviaLead] ✅ Typing indicator adicionado ao DOM com ID:', typingDiv.id);
  }

  // Função para remover indicador de digitação
  function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      console.log('[EnviaLead] ⌨️ Removendo typing indicator');
      indicator.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        if (indicator && indicator.parentNode) {
          indicator.remove();
          console.log('[EnviaLead] ✅ Typing indicator removido do DOM');
        }
      }, 300);
    } else {
      console.warn('[EnviaLead] ⚠️ Tentativa de remover typing indicator inexistente');
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
        console.log('[EnviaLead] 🎯 Mostrando typing indicator antes da primeira pergunta');
        showTypingIndicator(flowData);
        setTimeout(() => {
          hideTypingIndicator();
          setTimeout(() => {
            showNextQuestion(flowData);
          }, 200); // Pequeno delay após remover o typing
        }, 2500); // Aumentado para 2.5 segundos
      }, 1200);
    } else {
      setTimeout(() => {
        console.log('[EnviaLead] 🎯 Mostrando typing indicator - sem perguntas');
        showTypingIndicator(flowData);
        setTimeout(() => {
          hideTypingIndicator();
          setTimeout(() => {
            showNoQuestionsMessage(flowData);
          }, 200);
        }, 2500);
      }, 1200);
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

    // Adicionar pergunta como mensagem do bot
    addMessage(question.title, true, flowData);
    
    // Criar input baseado no tipo da pergunta
    createQuestionInput(question, flowData);
  }

  // Função para criar input da pergunta
  function createQuestionInput(question, flowData) {
    const inputContainer = document.getElementById('envialead-input');
    if (!inputContainer) return;

    // Limpar container
    inputContainer.innerHTML = '';

    if (question.type === 'select' && question.options) {
      // Criar botões para opções múltiplas
      question.options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.textContent = option;
        optionBtn.style.cssText = `
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: #f1f5f9;
          border: 2px solid #e2e8f0;
          border-radius: 24px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          transition: all 0.2s;
        `;
        
        optionBtn.onmouseenter = function() {
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
          let errorMsg = 'Formato inválido.';
          if (question.type === 'email') {
            errorMsg = 'Por favor, digite um email válido.';
          } else if (question.type === 'phone' || question.type === 'telefone') {
            errorMsg = 'Por favor, digite um telefone válido (10 ou 11 dígitos).';
          }
          alert(errorMsg);
          textInput.focus();
          return;
        }
        
        // Remove máscara para salvar valor limpo (especialmente para telefone)
        let cleanValue = value;
        if (question.type === 'phone' || question.type === 'telefone') {
          cleanValue = value.replace(/\D/g, '');
        }
        
        handleAnswer(question.id, cleanValue, flowData);
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
      
      // Focar no input
      setTimeout(() => textInput.focus(), 100);
    }
  }

  // Função para processar resposta
  function handleAnswer(questionId, answer, flowData) {
    console.log('[EnviaLead] 📝 Processando resposta:', { questionId, answer });
    
    // Salvar resposta
    chatState.responses[questionId] = answer;
    
    // Adicionar resposta do usuário
    addMessage(answer, false, flowData);
    
    // Avançar para próxima pergunta
    chatState.currentQuestionIndex++;
    
    // Verificar se há mais perguntas
    if (chatState.currentQuestionIndex < flowData.questions.length) {
      // Mostrar typing indicator antes da próxima pergunta
      setTimeout(() => {
        console.log('[EnviaLead] 🎯 Mostrando typing para próxima pergunta');
        showTypingIndicator(flowData);
        setTimeout(() => {
          hideTypingIndicator();
          setTimeout(() => {
            showNextQuestion(flowData);
          }, 200);
        }, 2000); // 2 segundos de typing
      }, 800);
    } else {
      // Conversa finalizada
      setTimeout(() => {
        console.log('[EnviaLead] 🎯 Mostrando typing para conclusão');
        showTypingIndicator(flowData);
        setTimeout(() => {
          hideTypingIndicator();
          setTimeout(() => {
            showCompletionMessage(flowData);
          }, 200);
        }, 2000); // 2 segundos de typing
      }, 800);
    }
  }

  // Função para mostrar mensagem de conclusão
  function showCompletionMessage(flowData) {
    console.log('[EnviaLead] Mostrando mensagem de conclusão');
    
    // Salvar lead no banco
    saveLead(chatState.responses, flowData);
    
    // Mensagem final
    const finalMessage = flowData.final_message || 'Obrigado! Suas informações foram enviadas com sucesso.';
    const processedMessage = replaceVariables(finalMessage, chatState.responses);
    addMessage(processedMessage, true, flowData);
    
    // Limpar input
    const inputContainer = document.getElementById('envialead-input');
    if (inputContainer) {
      if (flowData.whatsapp_number) {
        const whatsappBtn = document.createElement('button');
        const whatsappMessage = replaceVariables(flowData.whatsapp_message || 'Olá! Gostaria de mais informações.', chatState.responses);
        const whatsappUrl = `https://wa.me/${flowData.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
        
        whatsappBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          Continuar no WhatsApp
        `;
        whatsappBtn.style.cssText = `
          width: 100%;
          padding: 12px 16px;
          background: #25D366;
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s;
        `;
        whatsappBtn.onmouseenter = function() {
          this.style.background = '#128C7E';
        };
        whatsappBtn.onmouseleave = function() {
          this.style.background = '#25D366';
        };
        whatsappBtn.onclick = function() {
          window.open(whatsappUrl, '_blank');
        };
        
        inputContainer.innerHTML = '';
        inputContainer.appendChild(whatsappBtn);
      } else {
        inputContainer.innerHTML = '';
      }
    }
  }

  // Função para mostrar mensagem quando não há perguntas
  function showNoQuestionsMessage(flowData) {
    const inputContainer = document.getElementById('envialead-input');
    if (inputContainer) {
      inputContainer.innerHTML = '<div style="text-align: center; color: #666; font-size: 14px;">Conversa finalizada</div>';
    }
  }

  // Função para salvar lead no banco de dados
  async function saveLead(responses, flowData) {
    console.log('[EnviaLead] 💾 Salvando lead no banco...');
    console.log('[EnviaLead] Dados do lead:', { responses, flowId: flowData.id });
    
    const leadData = {
      flow_id: flowData.id,
      responses: responses,
      url: window.location.href,
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    };

    try {
      const response = await fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/save-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
        },
        body: JSON.stringify(leadData)
      });

      const result = await response.json();
      console.log('[EnviaLead] ✅ Lead salvo com sucesso:', result);
      
      if (result.success) {
        // Após salvar, enviar email
        console.log('[EnviaLead] 📧 Iniciando envio de email...');
        await sendLeadByEmail(responses, flowData);
        return result;
      } else {
        console.error('[EnviaLead] ❌ Erro ao salvar lead:', result.error);
        return null;
      }
    } catch (error) {
      console.error('[EnviaLead] ❌ Erro na requisição de salvamento:', error);
      return null;
    }
  }

  // Função para enviar email com os dados do lead
  async function sendLeadByEmail(responses, flowData) {
    console.log('[EnviaLead] ===== INICIANDO ENVIO DE EMAIL =====');
    console.log('[EnviaLead] 📧 Responses recebidas:', responses);
    console.log('[EnviaLead] 📧 FlowData recebido:', {
      id: flowData.id,
      name: flowData.name,
      flow_emails: flowData.flow_emails,
      emails: flowData.emails
    });
    
    let emails = [];
    
    if (flowData.flow_emails && Array.isArray(flowData.flow_emails)) {
      emails = flowData.flow_emails.map(e => e.email).filter(email => email && email.trim());
      console.log('[EnviaLead] 📧 Emails de flow_emails:', emails);
    }
    
    if (emails.length === 0 && flowData.emails && Array.isArray(flowData.emails)) {
      emails = flowData.emails.filter(email => email && email.trim());
      console.log('[EnviaLead] 📧 Emails de emails:', emails);
    }
    
    if (emails.length === 0) {
      console.warn('[EnviaLead] ❌ NENHUM EMAIL CONFIGURADO PARA RECEBER LEADS');
      console.warn('[EnviaLead] FlowData.flow_emails:', flowData.flow_emails);
      console.warn('[EnviaLead] FlowData.emails:', flowData.emails);
      console.warn('[EnviaLead] ⚠️ Verifique se os emails estão configurados no fluxo');
      return Promise.resolve();
    }
    
    console.log('[EnviaLead] ✅ Emails encontrados para envio:', emails);
    
    const emailData = {
      flow_id: flowData.id,
      flow_name: flowData.name,
      responses: responses,
      emails: emails,
      url: window.location.href
    };

    console.log('[EnviaLead] 📧 Dados completos para envio:', emailData);

    try {
      const response = await fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/send-lead-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
        },
        body: JSON.stringify(emailData)
      });

      console.log('[EnviaLead] 📧 Status da resposta HTTP:', response.status);
      console.log('[EnviaLead] 📧 Response OK:', response.ok);

      const result = await response.json();
      console.log('[EnviaLead] 📧 Resposta completa da função:', result);

      if (result.success) {
        console.log('[EnviaLead] ✅ EMAIL ENVIADO COM SUCESSO!', result);
        console.log('[EnviaLead] 📊 Detalhes do envio:', result.results);
      } else {
        console.error('[EnviaLead] ❌ ERRO AO ENVIAR EMAIL:', result.error);
        if (result.error && result.error.includes('RESEND_API_KEY')) {
          console.error('[EnviaLead] 💡 SOLUÇÃO: Configure RESEND_API_KEY no Supabase');
          console.error('[EnviaLead] 🔗 Link: https://supabase.com/dashboard/project/fuzkdrkhvmaimpgzvimq/settings/functions');
        }
      }
    } catch (error) {
      console.error('[EnviaLead] ❌ ERRO NA REQUISIÇÃO DE EMAIL:', error);
      console.error('[EnviaLead] Stack trace:', error.stack);
    }
    
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

  // Inicializar o widget
  loadFlowData(flowId);

})();