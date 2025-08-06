
(function() {
  console.log('[EnviaLead] Widget carregado');
  
  // CSS DINÂMICO BASEADO NO FLOW DATA
  const createDynamicStyles = (flowData) => {
    const buttonSize = flowData?.button_size || 60;
    const chatWidth = flowData?.chat_width || 360;
    const chatHeight = flowData?.chat_height || 520;
    const primaryColor = flowData?.colors?.primary || '#FF6B35';
    const secondaryColor = flowData?.colors?.secondary || '#3B82F6';
    const backgroundColor = flowData?.colors?.background || '#F9FAFB';
    const textColor = flowData?.colors?.text || '#374151';
    const headerTextColor = flowData?.colors?.headerText || '#FFFFFF';
    
    return `
      #envialead-widget-container {
        position: fixed;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      
      #envialead-button {
        background-color: ${primaryColor};
        color: white;
        border: none;
        border-radius: 50%;
        width: ${buttonSize}px;
        height: ${buttonSize}px;
        font-size: ${buttonSize * 0.5}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        position: fixed;
      }
      
      #envialead-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0,0,0,0.3);
      }
      
      #envialead-button img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
      
      #envialead-welcome-bubble {
        position: fixed;
        background-color: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 16px;
        max-width: 250px;
        width: max-content;
        word-wrap: break-word;
        z-index: 9998;
        display: none;
      }
      
      #envialead-welcome-bubble .close-button {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        background-color: #f3f4f6;
        border: none;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }
      
      #envialead-welcome-bubble .close-button:hover {
        background-color: #e5e7eb;
      }
      
      #envialead-chat-window {
        position: fixed;
        width: ${chatWidth}px;
        height: ${chatHeight}px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        overflow: hidden;
        display: none;
        z-index: 10000;
        border: 1px solid #e5e7eb;
      }
      
      #envialead-header {
        background: linear-gradient(45deg, ${primaryColor}, ${secondaryColor});
        color: ${headerTextColor};
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 600;
        font-size: 14px;
      }
      
      #envialead-header .header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      #envialead-header .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.2);
        font-size: 20px;
      }
      
      #envialead-header .avatar img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
      
      #envialead-header .attendant-info .name {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 2px;
      }
      
      #envialead-header .attendant-info .status {
        font-size: 12px;
        opacity: 0.9;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      #envialead-header .status-dot {
        width: 8px;
        height: 8px;
        background-color: #10b981;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
      
      #envialead-header .close-button {
        background: none;
        border: none;
        color: ${headerTextColor};
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      
      #envialead-header .close-button:hover {
        background: rgba(255,255,255,0.2);
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    
      #envialead-messages {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
        background-color: ${backgroundColor};
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    
    .envialead-message {
      margin-bottom: 12px;
      padding: 12px 16px;
      border-radius: 18px;
      max-width: 85%;
      clear: both;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .envialead-bot-message {
      background-color: white;
      color: #374151;
      float: left;
      border: 1px solid #e5e7eb;
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .envialead-user-message {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      color: white;
      float: right;
      border-radius: 18px 18px 4px 18px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    #envialead-input-container {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background-color: white;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .envialead-input-field {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }
    
    .envialead-input-field:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .envialead-input-field.error {
      border-color: #ef4444;
      background-color: #fef2f2;
      animation: shake 0.5s ease-in-out;
    }
    
    .envialead-input-field.success {
      border-color: #10b981;
      background-color: #f0fdf4;
    }
    
    .envialead-textarea {
      resize: vertical;
      min-height: 80px;
      border-radius: 12px;
    }
    
    .envialead-send-button {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    
      .envialead-send-button::before {
        content: "→";
        font-size: 16px;
        font-weight: bold;
      }
    
    .envialead-send-button:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    
    .envialead-send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    #envialead-whatsapp-button {
      background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 24px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin: 12px 16px;
      font-weight: 600;
      font-size: 14px;
      display: none;
      width: calc(100% - 32px);
    }
    
    #envialead-whatsapp-button:hover {
      background: linear-gradient(135deg, #128c7e 0%, #0d7c66 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    }
    
    .envialead-radio-group {
      margin: 8px 0;
    }
    
      .envialead-option-button {
        display: block;
        width: fit-content;
        padding: 8px 16px;
        margin: 4px 0;
        background: white;
        border: 2px solid ${primaryColor}20;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        color: ${primaryColor};
        text-align: left;
      }
      
      .envialead-option-button:hover {
        background-color: ${primaryColor}10;
        border-color: ${primaryColor}40;
      }
    
    .envialead-typing-container {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 12px;
    }
    
    .envialead-typing-bubble {
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 12px 16px;
      max-width: 85%;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
      .envialead-typing-dot {
        width: 8px;
        height: 8px;
        background-color: #9ca3af;
        border-radius: 50%;
        animation: envialead-typing-bounce 1.4s infinite ease-in-out;
      }
      
      .envialead-typing-dot:nth-child(1) { animation-delay: -0.32s; }
      .envialead-typing-dot:nth-child(2) { animation-delay: -0.16s; }
      .envialead-typing-dot:nth-child(3) { animation-delay: 0s; }
      
      @keyframes envialead-typing-bounce {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1.2);
          opacity: 1;
        }
      }
    `;
  };
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    
    .envialead-error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      margin-left: 16px;
      font-weight: 500;
    }
    
    .envialead-success-message {
      color: #10b981;
      font-size: 12px;
      margin-top: 4px;
      margin-left: 16px;
      font-weight: 500;
    }
  `;
  
  // Função para criar elementos DOM dinamicamente
  const createWidgetElements = (flowData) => {
    console.log('[EnviaLead] Criando elementos DOM com flowData:', flowData);
    
    // Criar container principal
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'envialead-widget-container';
    
    // Criar botão flutuante
    const chatButton = document.createElement('button');
    chatButton.id = 'envialead-button';
    
    // Aplicar avatar ou ícone no botão
    if (flowData?.button_avatar_url) {
      if (flowData.button_avatar_url.length <= 2 && !flowData.button_avatar_url.startsWith('http')) {
        // É um emoji
        chatButton.innerHTML = flowData.button_avatar_url;
      } else {
        // É uma URL de imagem
        const img = document.createElement('img');
        img.src = flowData.button_avatar_url;
        img.alt = 'Chat';
        img.onerror = () => {
          console.error('Erro ao carregar avatar do botão:', flowData.button_avatar_url);
          chatButton.innerHTML = '💬';
        };
        chatButton.appendChild(img);
      }
    } else {
      chatButton.innerHTML = '💬';
    }
    
    // Criar balão de boas-vindas
    const welcomeBubble = document.createElement('div');
    welcomeBubble.id = 'envialead-welcome-bubble';
    welcomeBubble.innerHTML = `
      <button class="close-button">×</button>
      <p style="margin: 0; padding-right: 16px; font-size: 14px; color: ${flowData?.colors?.text || '#374151'};">
        ${flowData?.welcome_message || 'Olá! Como posso ajudá-lo hoje?'}
      </p>
    `;
    
    // Criar janela do chat
    const chatWindow = document.createElement('div');
    chatWindow.id = 'envialead-chat-window';
    
    // Criar header do chat
    const chatHeader = document.createElement('div');
    chatHeader.id = 'envialead-header';
    
    const headerContent = document.createElement('div');
    headerContent.className = 'header-content';
    
    // Avatar no header
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    if (flowData?.avatar_url) {
      if (flowData.avatar_url.length <= 2 && !flowData.avatar_url.startsWith('http')) {
        // É um emoji
        avatar.innerHTML = flowData.avatar_url;
      } else {
        // É uma URL de imagem
        const img = document.createElement('img');
        img.src = flowData.avatar_url;
        img.alt = 'Avatar';
        img.onerror = () => {
          console.error('Erro ao carregar avatar do chat:', flowData.avatar_url);
          avatar.innerHTML = '👤';
        };
        avatar.appendChild(img);
      }
    } else {
      avatar.innerHTML = '👤';
    }
    
    // Info do atendente
    const attendantInfo = document.createElement('div');
    attendantInfo.className = 'attendant-info';
    attendantInfo.innerHTML = `
      <div class="name">${flowData?.attendant_name || 'Atendimento'}</div>
      <div class="status">
        <div class="status-dot"></div>
        Online agora
      </div>
    `;
    
    headerContent.appendChild(avatar);
    headerContent.appendChild(attendantInfo);
    
    // Botão de fechar
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '×';
    
    chatHeader.appendChild(headerContent);
    chatHeader.appendChild(closeButton);
    
    // Container de mensagens
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'envialead-messages';
    
    // Container de input
    const inputContainer = document.createElement('div');
    inputContainer.id = 'envialead-input-container';
    
    // Botão do WhatsApp
    const whatsAppButton = document.createElement('button');
    whatsAppButton.id = 'envialead-whatsapp-button';
    whatsAppButton.innerHTML = '💬 Continuar no WhatsApp';
    
    // Montar estrutura
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(messagesContainer);
    chatWindow.appendChild(inputContainer);
    chatWindow.appendChild(whatsAppButton);
    
    widgetContainer.appendChild(chatButton);
    widgetContainer.appendChild(welcomeBubble);
    widgetContainer.appendChild(chatWindow);
    
    return { widgetContainer, chatButton, welcomeBubble, chatWindow, chatHeader, messagesContainer, inputContainer, whatsAppButton, closeButton };
  };
  
  // Variáveis globais
  window.enviaLeadData = {};
  window.enviaLeadCurrentQuestion = 0;
  // INICIALIZAR VAZIO AQUI E REINICIALIZAR NO enviaLeadInit
  window.enviaLeadResponses = {};
  
  // MÁSCARAS E VALIDAÇÕES CORRIGIDAS
  const inputMasks = {
    // Máscara de telefone brasileira rigorosa
    applyPhoneMask: function(input) {
      console.log('[EnviaLead] Aplicando máscara de telefone');
      
      input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        console.log('[EnviaLead] Telefone digitado:', value);
        
        // Limitar a 11 dígitos
        if (value.length > 11) {
          value = value.substring(0, 11);
        }
        
        // Aplicar máscara progressiva
        if (value.length <= 2) {
          value = value.replace(/(\d{0,2})/, '($1');
        } else if (value.length <= 6) {
          value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
        } else if (value.length <= 10) {
          value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
          value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
        
        e.target.value = value;
        console.log('[EnviaLead] Máscara aplicada:', value);
      });
      
      input.addEventListener('blur', function(e) {
        const isValid = inputMasks.validatePhone(e.target.value);
        console.log('[EnviaLead] Validação telefone:', isValid);
        
        if (isValid) {
          e.target.classList.remove('error');
          e.target.classList.add('success');
          inputMasks.removeErrorMessage(e.target);
          inputMasks.showSuccessMessage(e.target, 'Telefone válido!');
        } else {
          e.target.classList.remove('success');
          e.target.classList.add('error');
          inputMasks.removeSuccessMessage(e.target);
          inputMasks.showErrorMessage(e.target, 'Digite um telefone válido com DDD');
        }
      });
    },
    
    // Máscara de email rigorosa
    applyEmailMask: function(input) {
      console.log('[EnviaLead] Aplicando máscara de email');
      
      input.addEventListener('input', function(e) {
        // Remove espaços e converte para lowercase
        e.target.value = e.target.value.replace(/\s/g, '').toLowerCase();
      });
      
      input.addEventListener('blur', function(e) {
        const isValid = inputMasks.validateEmail(e.target.value);
        console.log('[EnviaLead] Validação email:', isValid);
        
        if (isValid) {
          e.target.classList.remove('error');
          e.target.classList.add('success');
          inputMasks.removeErrorMessage(e.target);
          inputMasks.showSuccessMessage(e.target, 'Email válido!');
        } else {
          e.target.classList.remove('success');
          e.target.classList.add('error');
          inputMasks.removeSuccessMessage(e.target);
          inputMasks.showErrorMessage(e.target, 'Digite um email válido (ex: nome@dominio.com)');
        }
      });
    },
    
    // Validação rigorosa de telefone
    validatePhone: function(phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      console.log('[EnviaLead] Validando telefone limpo:', cleanPhone);
      
      // Deve ter 10 ou 11 dígitos
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        console.log('[EnviaLead] Telefone inválido: tamanho incorreto');
        return false;
      }
      
      // Verificar DDD válido (11 a 99)
      const ddd = parseInt(cleanPhone.substring(0, 2));
      if (ddd < 11 || ddd > 99) {
        console.log('[EnviaLead] Telefone inválido: DDD inválido');
        return false;
      }
      
      if (cleanPhone.length === 11) {
        // Celular: deve começar com 9
        const firstDigit = cleanPhone.substring(2, 3);
        if (firstDigit !== '9') {
          console.log('[EnviaLead] Celular inválido: não começa com 9');
          return false;
        }
      } else if (cleanPhone.length === 10) {
        // Fixo: deve começar com 2, 3, 4 ou 5
        const firstDigit = cleanPhone.substring(2, 3);
        if (!['2', '3', '4', '5'].includes(firstDigit)) {
          console.log('[EnviaLead] Fixo inválido: não começa com 2,3,4,5');
          return false;
        }
      }
      
      console.log('[EnviaLead] Telefone válido!');
      return true;
    },
    
    // Validação rigorosa de email
    validateEmail: function(email) {
      if (!email || email.trim() === '') {
        return false;
      }
      // Regex ainda mais rigorosa
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(email) && 
                     email.length >= 5 && 
                     email.includes('.') && 
                     email.split('@').length === 2 &&
                     !email.includes('..') &&
                     !email.startsWith('.') &&
                     !email.endsWith('.');
      console.log('[EnviaLead] Validando email:', email, 'Válido:', isValid);
      return isValid;
    },
    
    // Mostrar mensagem de erro
    showErrorMessage: function(input, message) {
      this.removeErrorMessage(input);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'envialead-error-message';
      errorDiv.textContent = message;
      input.parentNode.appendChild(errorDiv);
    },
    
    // Mostrar mensagem de sucesso
    showSuccessMessage: function(input, message) {
      this.removeSuccessMessage(input);
      const successDiv = document.createElement('div');
      successDiv.className = 'envialead-success-message';
      successDiv.textContent = message;
      input.parentNode.appendChild(successDiv);
    },
    
    // Remover mensagem de erro
    removeErrorMessage: function(input) {
      const existing = input.parentNode.querySelector('.envialead-error-message');
      if (existing) existing.remove();
    },
    
    // Remover mensagem de sucesso
    removeSuccessMessage: function(input) {
      const existing = input.parentNode.querySelector('.envialead-success-message');
      if (existing) existing.remove();
    }
  };
  
  // FUNÇÃO DE SUBSTITUIÇÃO DE VARIÁVEIS COMPLETAMENTE CORRIGIDA
  function replaceVariables(text, responses) {
    console.log('[EnviaLead] ==> INÍCIO replaceVariables');
    console.log('[EnviaLead] Texto original:', text);
    console.log('[EnviaLead] Respostas recebidas:', responses);
    console.log('[EnviaLead] Perguntas disponíveis:', window.enviaLeadData.questions);
    
    if (!text || !responses || Object.keys(responses).length === 0) {
      console.warn('[EnviaLead] Parâmetros inválidos para substituição');
      return text;
    }
    
    let result = text;
    
    // ESTRATÉGIA 1: Mapear variáveis comuns baseado nas respostas diretas
    const commonVariables = {
      '#nome': null,
      '#name': null,
      '#email': null,
      '#telefone': null,
      '#phone': null,
      '#empresa': null,
      '#company': null,
      '#cidade': null,
      '#city': null
    };
    
    // Procurar nas respostas por palavras-chave
    Object.keys(responses).forEach(key => {
      const value = responses[key];
      if (!value) return;
      
      const keyLower = key.toLowerCase();
      console.log(`[EnviaLead] Analisando resposta: ${key} = ${value}`);
      
      // Mapear por palavras-chave no título da pergunta
      if (keyLower.includes('nome') || keyLower.includes('name')) {
        commonVariables['#nome'] = value;
        commonVariables['#name'] = value;
        console.log(`[EnviaLead] Mapeado nome: ${value}`);
      }
      if (keyLower.includes('email') || keyLower.includes('e-mail')) {
        commonVariables['#email'] = value;
        console.log(`[EnviaLead] Mapeado email: ${value}`);
      }
      if (keyLower.includes('telefone') || keyLower.includes('celular') || keyLower.includes('phone')) {
        commonVariables['#telefone'] = value;
        commonVariables['#phone'] = value;
        console.log(`[EnviaLead] Mapeado telefone: ${value}`);
      }
      if (keyLower.includes('empresa') || keyLower.includes('company')) {
        commonVariables['#empresa'] = value;
        commonVariables['#company'] = value;
        console.log(`[EnviaLead] Mapeado empresa: ${value}`);
      }
      if (keyLower.includes('cidade') || keyLower.includes('city')) {
        commonVariables['#cidade'] = value;
        commonVariables['#city'] = value;
        console.log(`[EnviaLead] Mapeado cidade: ${value}`);
      }
    });
    
    // ESTRATÉGIA 2: Se não encontrou pelas palavras-chave, usar primeira resposta para nome
    if (!commonVariables['#nome'] && !commonVariables['#name']) {
      const firstResponse = Object.values(responses)[0];
      if (firstResponse) {
        commonVariables['#nome'] = firstResponse;
        commonVariables['#name'] = firstResponse;
        console.log(`[EnviaLead] Usando primeira resposta como nome: ${firstResponse}`);
      }
    }
    
    // ESTRATÉGIA 3: Mapear por posição das perguntas
    if (window.enviaLeadData.questions && Array.isArray(window.enviaLeadData.questions)) {
      window.enviaLeadData.questions.forEach((question, index) => {
        const answerId = responses[question.id];
        const answerTitle = responses[question.title];
        const answer = answerId || answerTitle;
        
        if (answer) {
          commonVariables[`#resposta${index + 1}`] = answer;
          commonVariables[`#answer${index + 1}`] = answer;
          console.log(`[EnviaLead] Mapeado por posição ${index + 1}: ${answer}`);
        }
      });
    }
    
    console.log('[EnviaLead] Variáveis mapeadas:', commonVariables);
    
    // APLICAR SUBSTITUIÇÕES
    Object.keys(commonVariables).forEach(variable => {
      const value = commonVariables[variable];
      if (value) {
        const regex = new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const before = result;
        result = result.replace(regex, value);
        if (before !== result) {
          console.log(`[EnviaLead] ✅ Substituído ${variable} por "${value}"`);
        }
      }
    });
    
    console.log('[EnviaLead] Resultado final:', result);
    console.log('[EnviaLead] ==> FIM replaceVariables');
    
    return result;
  }
  
  // SIMULAÇÃO DE DIGITAÇÃO CORRIGIDA DEFINITIVAMENTE
  function showTypingIndicator() {
    console.log('[EnviaLead] Iniciando simulação de digitação');
    
    const messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) {
      console.error('[EnviaLead] Container de mensagens não encontrado');
      return;
    }
    
    // Remove indicador anterior se existir
    const existingIndicator = document.getElementById('envialead-typing-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
      console.log('[EnviaLead] Indicador anterior removido');
    }
    
    // Criar container principal do typing indicator
    const typingContainer = document.createElement('div');
    typingContainer.id = 'envialead-typing-indicator';
    typingContainer.className = 'envialead-typing-container';
    
    // Criar bolha de digitação
    const typingBubble = document.createElement('div');
    typingBubble.className = 'envialead-typing-bubble';
    
    // Criar os três pontos animados
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'envialead-typing-dot';
      typingBubble.appendChild(dot);
    }
    
    typingContainer.appendChild(typingBubble);
    messagesContainer.appendChild(typingContainer);
    
    // Scroll para o final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    console.log('[EnviaLead] Indicador de digitação criado e exibido');
    
    // Verificar se foi criado corretamente e as animações estão funcionando
    setTimeout(() => {
      const createdIndicator = document.getElementById('envialead-typing-indicator');
      const dots = createdIndicator ? createdIndicator.querySelectorAll('.envialead-typing-dot') : [];
      console.log('[EnviaLead] Indicador criado:', !!createdIndicator, 'Pontos criados:', dots.length);
      
      if (dots.length === 3) {
        console.log('[EnviaLead] ✅ Simulação de digitação funcionando no site destino');
      } else {
        console.error('[EnviaLead] ❌ Problema na criação dos pontos de digitação');
      }
    }, 100);
  }
  
  function hideTypingIndicator() {
    console.log('[EnviaLead] Escondendo indicador de digitação');
    
    const typingIndicator = document.getElementById('envialead-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
      console.log('[EnviaLead] Indicador de digitação removido');
    } else {
      console.log('[EnviaLead] Nenhum indicador de digitação encontrado para remover');
    }
  }
  
  // FUNÇÃO DE ARMAZENAMENTO DE RESPOSTA CORRIGIDA
  function storeResponse(questionId, questionTitle, answer) {
    console.log('[EnviaLead] ==> ARMAZENANDO RESPOSTA');
    console.log('[EnviaLead] Question ID:', questionId);
    console.log('[EnviaLead] Question Title:', questionTitle);
    console.log('[EnviaLead] Answer:', answer);
    
    // Armazenar por ID e por título
    window.enviaLeadResponses[questionId] = answer;
    window.enviaLeadResponses[questionTitle] = answer;
    
    // MAPEAMENTO IMEDIATO PARA VARIÁVEIS COMUNS
    const titleLower = questionTitle.toLowerCase();
    
    if (titleLower.includes('nome') || titleLower.includes('name')) {
      window.enviaLeadResponses['#nome'] = answer;
      window.enviaLeadResponses['#name'] = answer;
      console.log('[EnviaLead] Mapeado imediatamente para #nome/#name');
    }
    if (titleLower.includes('email') || titleLower.includes('e-mail')) {
      window.enviaLeadResponses['#email'] = answer;
      console.log('[EnviaLead] Mapeado imediatamente para #email');
    }
    if (titleLower.includes('telefone') || titleLower.includes('celular') || titleLower.includes('phone')) {
      window.enviaLeadResponses['#telefone'] = answer;
      window.enviaLeadResponses['#phone'] = answer;
      console.log('[EnviaLead] Mapeado imediatamente para #telefone/#phone');
    }
    if (titleLower.includes('empresa') || titleLower.includes('company')) {
      window.enviaLeadResponses['#empresa'] = answer;
      window.enviaLeadResponses['#company'] = answer;
      console.log('[EnviaLead] Mapeado imediatamente para #empresa/#company');
    }
    if (titleLower.includes('cidade') || titleLower.includes('city')) {
      window.enviaLeadResponses['#cidade'] = answer;
      window.enviaLeadResponses['#city'] = answer;
      console.log('[EnviaLead] Mapeado imediatamente para #cidade/#city');
    }
    
    console.log('[EnviaLead] Estado atual do enviaLeadResponses:', window.enviaLeadResponses);
    console.log('[EnviaLead] ==> FIM ARMAZENAMENTO');
  }
  
  // Função para calcular posicionamento dinâmico
  const calculatePosition = (basePosition, offsetX = 0, offsetY = 0) => {
    const positions = {
      'bottom-right': { bottom: `${20 + offsetY}px`, right: `${20 + offsetX}px` },
      'bottom-left': { bottom: `${20 + offsetY}px`, left: `${20 + offsetX}px` },
      'bottom-center': { bottom: `${20 + offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` },
      'top-right': { top: `${20 + offsetY}px`, right: `${20 + offsetX}px` },
      'top-left': { top: `${20 + offsetY}px`, left: `${20 + offsetX}px` },
      'top-center': { top: `${20 + offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` },
    };
    return positions[basePosition] || positions['bottom-right'];
  };

  // Função para aplicar posicionamento aos elementos
  const applyPositioning = (flowData, elements) => {
    const { chatButton, welcomeBubble, chatWindow } = elements;
    
    // Posicionar botão
    const buttonPosition = calculatePosition(
      flowData?.button_position || 'bottom-right',
      flowData?.button_offset_x || 0,
      flowData?.button_offset_y || 0
    );
    Object.assign(chatButton.style, buttonPosition);
    
    // Posicionar balão de boas-vindas
    const bubblePosition = calculatePosition(
      flowData?.button_position || 'bottom-right',
      (flowData?.button_offset_x || 0) + (flowData?.button_position?.includes('right') ? -80 : 80),
      (flowData?.button_offset_y || 0) + 80
    );
    Object.assign(welcomeBubble.style, bubblePosition);
    
    // Posicionar janela do chat
    const chatPosition = calculatePosition(
      flowData?.chat_position || flowData?.button_position || 'bottom-right',
      flowData?.chat_offset_x || flowData?.button_offset_x || 0,
      (flowData?.chat_offset_y || flowData?.button_offset_y || 0) + (flowData?.button_size || 60) + 20
    );
    Object.assign(chatWindow.style, chatPosition);
  };

  // Função para inicializar o widget
  window.enviaLeadInit = function(flowId) {
    console.log('[EnviaLead] ==> INICIALIZANDO WIDGET');
    console.log('[EnviaLead] Flow ID:', flowId);
    
    // REINICIALIZAR RESPOSTAS - CORREÇÃO CRÍTICA
    window.enviaLeadResponses = {};
    window.enviaLeadCurrentQuestion = 0;
    console.log('[EnviaLead] Respostas reinicializadas');
    
    // Obter dados do flow
    fetch(`https://fuzkdrkhvmaimpgzvimq.supabase.co/rest/v1/flows?id=eq.${flowId}`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        window.enviaLeadData = data[0];
        console.log('[EnviaLead] Dados do flow carregados:', window.enviaLeadData);
        
        // Criar elementos DOM com dados do flow
        const elements = createWidgetElements(window.enviaLeadData);
        
        // Injetar CSS dinâmico
        const dynamicStyles = createDynamicStyles(window.enviaLeadData);
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = dynamicStyles;
        document.head.appendChild(styleSheet);
        
        // Aplicar posicionamento
        applyPositioning(window.enviaLeadData, elements);
        
        // Adicionar elementos ao DOM
        document.body.appendChild(elements.widgetContainer);
        
        // Configurar eventos
        let welcomeBubbleVisible = true;
        
        // Evento do botão principal
        elements.chatButton.addEventListener('click', function() {
          const isVisible = elements.chatWindow.style.display === 'block';
          elements.chatWindow.style.display = isVisible ? 'none' : 'block';
          
          // Esconder/mostrar balão de boas-vindas
          if (!isVisible) {
            elements.welcomeBubble.style.display = 'none';
            // Iniciar conversa se ainda não começou
            startConversation();
          } else if (welcomeBubbleVisible) {
            elements.welcomeBubble.style.display = 'block';
          }
          
          console.log('[EnviaLead] Chat window toggled:', !isVisible);
        });
        
        // Evento do botão de fechar do chat
        elements.closeButton.addEventListener('click', function() {
          elements.chatWindow.style.display = 'none';
          if (welcomeBubbleVisible) {
            elements.welcomeBubble.style.display = 'block';
          }
        });
        
        // Evento do botão de fechar do balão
        const bubbleCloseButton = elements.welcomeBubble.querySelector('.close-button');
        if (bubbleCloseButton) {
          bubbleCloseButton.addEventListener('click', function() {
            elements.welcomeBubble.style.display = 'none';
            welcomeBubbleVisible = false;
          });
        }
        
        // Mostrar balão de boas-vindas inicialmente
        elements.welcomeBubble.style.display = 'block';
        
        // Obter perguntas do flow
        fetch(`https://fuzkdrkhvmaimpgzvimq.supabase.co/rest/v1/questions?flow_id=eq.${flowId}&order=order_index`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
          }
        })
        .then(response => response.json())
        .then(questions => {
          // Processar perguntas incluindo mensagens de bot
          const processedQuestions = questions
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
          
          window.enviaLeadData.questions = processedQuestions;
          console.log('[EnviaLead] Perguntas processadas:', window.enviaLeadData.questions);
          
          console.log('[EnviaLead] ==> WIDGET INICIALIZADO COM SUCESSO');
        })
        .catch(error => {
          console.error('[EnviaLead] Erro ao obter perguntas:', error);
        });
      } else {
        console.error('[EnviaLead] Flow não encontrado');
      }
    })
    .catch(error => {
      console.error('[EnviaLead] Erro ao obter dados do flow:', error);
    });
  };
  
  // Função para iniciar conversa quando o chat for aberto
  const startConversation = () => {
    const messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer || messagesContainer.children.length > 0) return;
    
    // Adicionar mensagem de boas-vindas
    setTimeout(() => {
      addMessage(window.enviaLeadData.welcome_message || 'Olá! Como posso ajudá-lo?', true);
      
      // Filtrar apenas perguntas (não mensagens de bot)
      const realQuestions = window.enviaLeadData.questions.filter(q => q.type !== 'bot_message');
      
      if (realQuestions.length > 0) {
        setTimeout(() => {
          showTypingIndicator();
          setTimeout(() => {
            hideTypingIndicator();
            showQuestion(realQuestions[0]);
          }, 2000);
        }, 1000);
      }
    }, 500);
  };
  
  // Função para mostrar botão do WhatsApp
  function showWhatsAppButton() {
    console.log('[EnviaLead] ==> MOSTRANDO BOTÃO WHATSAPP');
    
    const whatsAppButton = document.getElementById('envialead-whatsapp-button');
    if (!whatsAppButton) return;
    
    // Preparar mensagem do WhatsApp com substituição de variáveis
    let whatsappMessage = window.enviaLeadData.whatsapp_message_template || 
      window.enviaLeadData.whatsapp_message ||
      'Olá! Vim através do seu site e gostaria de saber mais informações.';
    
    whatsappMessage = replaceVariables(whatsappMessage, window.enviaLeadResponses);
    
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappNumber = (window.enviaLeadData.whatsapp || '').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodedMessage}`;
    
    whatsAppButton.style.display = 'block';
    whatsAppButton.onclick = function() {
      window.open(whatsappUrl, '_blank');
    };
      
      // Corrigir mensagem do WhatsApp - usar whatsapp_message_template que é o campo correto
      console.log('[EnviaLead] Dados do flow completos:', window.enviaLeadData);
      
      let message = '';
      if (window.enviaLeadData.whatsapp_message_template && window.enviaLeadData.whatsapp_message_template.trim()) {
        message = window.enviaLeadData.whatsapp_message_template;
        console.log('[EnviaLead] Usando whatsapp_message_template configurado:', message);
      } else {
        message = 'Olá! Gostaria de saber mais informações.';
        console.log('[EnviaLead] Usando mensagem padrão pois whatsapp_message_template está vazio');
      }
      
      // Substituir variáveis no template
      message = replaceVariables(message, window.enviaLeadResponses);
      console.log('[EnviaLead] Mensagem final após substituição:', message);
      
      // Verificar se ainda há variáveis não substituídas
      const originalMessage = window.enviaLeadData.whatsapp_message_template || message;
      if (originalMessage !== message) {
        console.log('[EnviaLead] ✅ Variáveis substituídas com sucesso!');
      } else if (message.includes('#')) {
        console.warn('[EnviaLead] ⚠️ Ainda há variáveis não substituídas');
        
        // Fallback: usar primeira resposta como nome se template contém #nome
        if (message.includes('#nome') || message.includes('#name')) {
          const firstResponse = Object.values(window.enviaLeadResponses)[0];
          if (firstResponse) {
            message = message.replace(/#nome/gi, firstResponse);
            message = message.replace(/#name/gi, firstResponse);
            console.log('[EnviaLead] Aplicado fallback para nome:', firstResponse);
          }
        }
      }
      
      // Preparar URL do WhatsApp
      const whatsappNumber = window.enviaLeadData.whatsapp ? window.enviaLeadData.whatsapp.replace(/\D/g, '') : '';
      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      console.log('[EnviaLead] Número WhatsApp:', whatsappNumber);
      console.log('[EnviaLead] Mensagem final:', message);
      console.log('[EnviaLead] URL final:', whatsappURL);
      
      // Abrir WhatsApp
      window.open(whatsappURL, '_blank');
    });
  }
  
  // Função para adicionar mensagem
  function addMessage(message, isBot = false) {
    console.log('[EnviaLead] Adicionando mensagem:', message);
    
    const messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) {
      console.error('[EnviaLead] Container de mensagens não encontrado');
      return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `envialead-message ${isBot ? 'envialead-bot-message' : 'envialead-user-message'}`;
    messageElement.innerHTML = `<div class="envialead-message-content">${message}</div>`;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    console.log('[EnviaLead] Mensagem adicionada:', { message, isBot });
  }
  
  // Função para mostrar pergunta COM MÁSCARA APLICADA
  function showQuestion(question) {
    console.log('[EnviaLead] ==> MOSTRANDO PERGUNTA');
    console.log('[EnviaLead] Pergunta:', question);
    
    const inputContainer = document.getElementById('envialead-input-container');
    if (!inputContainer) {
      console.error('[EnviaLead] Container de input não encontrado');
      return;
    }
    
    // Limpar container anterior
    inputContainer.innerHTML = '';
    
    // Adicionar pergunta às mensagens
    addMessage(question.title, true);
    
    // Criar input baseado no tipo da pergunta
    let inputHTML = '';
    
    switch (question.type) {
      case 'text':
        inputHTML = `
          <input 
            type="text" 
            id="envialead-text-input" 
            placeholder="${question.placeholder || 'Digite sua resposta...'}"
            class="envialead-input-field"
            ${question.required ? 'required' : ''}
          />
          <button id="envialead-send-button" class="envialead-send-button"></button>
        `;
        break;
        
      case 'email':
        inputHTML = `
          <input 
            type="email" 
            id="envialead-email-input" 
            placeholder="${question.placeholder || 'Digite seu email...'}"
            class="envialead-input-field"
            ${question.required ? 'required' : ''}
          />
          <button id="envialead-send-button" class="envialead-send-button"></button>
        `;
        break;
        
      case 'phone':
        inputHTML = `
          <input 
            type="tel" 
            id="envialead-phone-input" 
            placeholder="${question.placeholder || 'Digite seu telefone...'}"
            class="envialead-input-field"
            ${question.required ? 'required' : ''}
          />
          <button id="envialead-send-button" class="envialead-send-button"></button>
        `;
        break;
        
      case 'textarea':
        inputHTML = `
          <textarea 
            id="envialead-textarea-input" 
            placeholder="${question.placeholder || 'Digite sua resposta...'}"
            class="envialead-input-field envialead-textarea"
            rows="3"
            ${question.required ? 'required' : ''}
          ></textarea>
          <button id="envialead-send-button" class="envialead-send-button"></button>
        `;
        break;
        
      case 'single':
        inputHTML = '<div class="envialead-options-group">';
        if (question.options && question.options.length > 0) {
          question.options.forEach((option, index) => {
            inputHTML += `
              <button 
                class="envialead-option-button" 
                data-value="${option}"
                type="button"
              >
                ${option}
              </button>
            `;
          });
        }
        inputHTML += '</div>';
        break;
        
      case 'radio':
        inputHTML = '<div class="envialead-radio-group">';
        if (question.options && question.options.length > 0) {
          question.options.forEach((option, index) => {
            inputHTML += `
              <div class="envialead-radio-option" data-value="${option}">
                <input 
                  type="radio" 
                  id="envialead-radio-${index}" 
                  name="envialead-radio" 
                  value="${option}"
                  ${question.required ? 'required' : ''}
                />
                <label for="envialead-radio-${index}">${option}</label>
              </div>
            `;
          });
        }
        inputHTML += '</div>';
        break;
        
      default:
        inputHTML = `
          <input 
            type="text" 
            id="envialead-text-input" 
            placeholder="${question.placeholder || 'Digite sua resposta...'}"
            class="envialead-input-field"
            ${question.required ? 'required' : ''}
          />
          <button id="envialead-send-button" class="envialead-send-button"></button>
        `;
    }
    
    inputContainer.innerHTML = inputHTML;
    
    // Aplicar máscaras baseadas no tipo IMEDIATAMENTE
    const input = inputContainer.querySelector('input, textarea');
    if (input) {
      if (question.type === 'phone') {
        console.log('[EnviaLead] Aplicando máscara telefone ao input');
        inputMasks.applyPhoneMask(input);
      } else if (question.type === 'email') {
        console.log('[EnviaLead] Aplicando máscara email ao input');
        inputMasks.applyEmailMask(input);
      }
      
      // Focar no input
      setTimeout(() => input.focus(), 100);
      
      // Adicionar evento de Enter para envio
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendAnswer();
        }
      });
    }
    
    // Adicionar eventos para botão de envio
    const sendButton = document.getElementById('envialead-send-button');
    if (sendButton) {
      sendButton.addEventListener('click', handleSendAnswer);
    }
    
    // Adicionar eventos para botões de opção (single choice)
    const optionButtons = inputContainer.querySelectorAll('.envialead-option-button');
    optionButtons.forEach(button => {
      button.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        console.log('[EnviaLead] Opção selecionada:', value);
        
        // Simular seleção visual
        optionButtons.forEach(btn => btn.style.opacity = '0.5');
        this.style.opacity = '1';
        
        // Armazenar resposta temporariamente
        window.tempAnswer = value;
        
        // Enviar resposta após delay
        setTimeout(() => handleSendAnswer(), 300);
      });
    });

    // Adicionar eventos para radio buttons
    const radioOptions = inputContainer.querySelectorAll('.envialead-radio-option');
    radioOptions.forEach(option => {
      option.addEventListener('click', function() {
        // Remover seleção anterior
        radioOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Adicionar seleção atual
        this.classList.add('selected');
        
        // Marcar radio button
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          
          // Enviar resposta após delay
          setTimeout(() => handleSendAnswer(), 500);
        }
      });
    });
  }
  
  // Função para processar resposta
  function handleSendAnswer() {
    console.log('[EnviaLead] ==> PROCESSANDO RESPOSTA');
    
    const currentQuestion = window.enviaLeadData.questions[window.enviaLeadCurrentQuestion];
    if (!currentQuestion) {
      console.error('[EnviaLead] Pergunta atual não encontrada');
      return;
    }
    
    let answer = '';
    let isValid = true;
    
    // Obter resposta baseada no tipo da pergunta
    switch (currentQuestion.type) {
      case 'text':
        const textInput = document.getElementById('envialead-text-input');
        answer = textInput ? textInput.value.trim() : '';
        break;
        
      case 'email':
        const emailInput = document.getElementById('envialead-email-input');
        answer = emailInput ? emailInput.value.trim() : '';
        if (answer && !inputMasks.validateEmail(answer)) {
          isValid = false;
          console.log('[EnviaLead] Email inválido:', answer);
        }
        break;
        
      case 'phone':
        const phoneInput = document.getElementById('envialead-phone-input');
        answer = phoneInput ? phoneInput.value.trim() : '';
        if (answer && !inputMasks.validatePhone(answer)) {
          isValid = false;
          console.log('[EnviaLead] Telefone inválido:', answer);
        }
        break;
        
      case 'textarea':
        const textareaInput = document.getElementById('envialead-textarea-input');
        answer = textareaInput ? textareaInput.value.trim() : '';
        break;
        
      case 'single':
        // Para perguntas de múltipla escolha, usar a resposta temporária
        answer = window.tempAnswer || '';
        window.tempAnswer = null; // Limpar após uso
        break;
        
      case 'radio':
        const selectedRadio = document.querySelector('input[name="envialead-radio"]:checked');
        answer = selectedRadio ? selectedRadio.value : '';
        break;
        
      default:
        const defaultInput = document.getElementById('envialead-text-input');
        answer = defaultInput ? defaultInput.value.trim() : '';
    }
    
    // Validar resposta obrigatória
    if (currentQuestion.required && !answer) {
      console.log('[EnviaLead] Resposta obrigatória não preenchida');
      return;
    }
    
    // Validar formato se necessário
    if (!isValid) {
      console.log('[EnviaLead] Resposta inválida');
      return;
    }
    
    console.log('[EnviaLead] Resposta válida:', answer);
    
    // ARMAZENAR RESPOSTA COM FUNÇÃO CORRIGIDA
    storeResponse(currentQuestion.id, currentQuestion.title, answer);
    
    // Mostrar resposta do usuário
    addMessage(answer, false);
    
    // Limpar input
    const inputContainer = document.getElementById('envialead-input-container');
    if (inputContainer) {
      inputContainer.innerHTML = '';
    }
    
    // Salvar lead parcial
    saveLead(false);
    
    // Próxima pergunta ou finalização
    window.enviaLeadCurrentQuestion++;
    
    // Filtrar apenas perguntas reais (não mensagens de bot)
    const realQuestions = window.enviaLeadData.questions.filter(q => q.type !== 'bot_message');
    
    if (window.enviaLeadCurrentQuestion < realQuestions.length) {
      // Verificar se há mensagem de bot na sequência
      const allItems = window.enviaLeadData.questions;
      const currentRealIndex = window.enviaLeadCurrentQuestion;
      
      // Procurar mensagens de bot antes da próxima pergunta
      const botMessages = allItems.filter(item => 
        item.type === 'bot_message' && 
        item.order > realQuestions[currentRealIndex - 1]?.order &&
        item.order < realQuestions[currentRealIndex]?.order
      );
      
      let delay = 1000;
      
      // Mostrar mensagens de bot se existirem
      if (botMessages.length > 0) {
        botMessages.forEach((botMsg, index) => {
          setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
              hideTypingIndicator();
              addMessage(botMsg.title, true);
              
              // Se é a última mensagem bot, mostrar próxima pergunta
              if (index === botMessages.length - 1) {
                setTimeout(() => {
                  showTypingIndicator();
                  setTimeout(() => {
                    hideTypingIndicator();
                    showQuestion(realQuestions[currentRealIndex]);
                  }, 1500);
                }, 1000);
              }
            }, 1500);
          }, delay);
          delay += 3000; // Incrementar delay para cada mensagem
        });
      } else {
        // Não há mensagens de bot, mostrar próxima pergunta diretamente
        showTypingIndicator();
        setTimeout(() => {
          hideTypingIndicator();
          showQuestion(realQuestions[currentRealIndex]);
        }, 2000);
      }
    } else {
      // Finalizar conversa
      showTypingIndicator();
      
      setTimeout(() => {
        hideTypingIndicator();
        const finalMessage = window.enviaLeadData.final_message_custom || window.enviaLeadData.final_message || 'Obrigado pelo seu contato! Em breve entraremos em contato.';
        addMessage(finalMessage, true);
        
        // Salvar lead completo
        saveLead(true);
        
        // Mostrar botão WhatsApp se configurado
        if (window.enviaLeadData.show_whatsapp_button && window.enviaLeadData.whatsapp) {
          setTimeout(() => {
            showWhatsAppButton();
          }, 1000);
        }
      }, 2000);
    }
  }
  
  // Função para salvar lead
  function saveLead(completed = false) {
    console.log('[EnviaLead] Salvando lead:', { completed, responses: window.enviaLeadResponses });
    
    const leadData = {
      flow_id: window.enviaLeadData.id,
      responses: window.enviaLeadResponses,
      completed: completed,
      user_agent: navigator.userAgent,
      url: window.location.href
    };
    
    // Chamada para edge function
    fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/save-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('[EnviaLead] Lead salvo:', data);
      if (data.success) {
        console.log('[EnviaLead] Lead salvo com sucesso:', data.lead_id);
      }
    })
    .catch(error => {
      console.error('[EnviaLead] Erro ao salvar lead:', error);
    });
  }
})();
